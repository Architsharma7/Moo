import { ProofRequest, ReceiptData, Field, ErrCode, Prover, Brevis } from 'brevis-sdk-typescript';
import { TradeEvent, settlementContract, RPC_URL, callbackAddress } from './types';
import { fetchLastTradeEvents } from './collector';
import { ethers } from 'ethers';
import { brevisRequestABI } from './extras/BrevisRequestABI';

async function createProofRequest(tradeEvents: TradeEvent[]): Promise<ProofRequest> {
    const proofReq = new ProofRequest();

    tradeEvents.forEach((event, index) => {
        proofReq.addReceipt(
            new ReceiptData({
                tx_hash: event.txHash,
                fields: [
                    // sellamount
                    new Field({
                        log_pos: event.logIndex,
                        is_topic: false,
                        field_index: 2,
                    }),
                    // buyamount
                    new Field({
                        log_pos: event.logIndex,
                        is_topic: false,
                        field_index: 3,
                    }),
                ],
            }),
            index,
        );
    });

    console.log(proofReq);
    return proofReq;
}

async function sendProof(proofReq: ProofRequest) {
    const prover = new Prover('localhost:33247');
    const proofRes = await prover.prove(proofReq);
    if (proofRes.has_err) {
        const err = proofRes.err;
        switch (err.code) {
            case ErrCode.ERROR_INVALID_INPUT:
                console.error('invalid receipt/storage/transaction input:', err.msg);
                break;

            case ErrCode.ERROR_INVALID_CUSTOM_INPUT:
                console.error('invalid custom input:', err.msg);
                break;

            case ErrCode.ERROR_FAILED_TO_PROVE:
                console.error('failed to prove:', err.msg);
                break;
        }
        return;
    }
    console.log('proof', proofRes.proof);
    return proofRes;
}

export async function submitProof() {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const brevis = new Brevis('appsdkv3.brevis.network:443');
        const tradeEvents = await fetchLastTradeEvents(provider, settlementContract);
        if (tradeEvents.length === 0) {
            console.log('No trade events found');
            return;
        }
        const proofReq = await createProofRequest(tradeEvents);
        const proofRes = await sendProof(proofReq);
        if (!proofRes) {
            console.log('Proof failed');
            return;
        }
        const brevisRes = await brevis.submit(proofReq, proofRes, 1, 11155111, 0, '', '');
        const fee = brevisRes.fee;
        const id = brevisRes.queryKey;
        console.log('fee', fee);
        console.log('id', id);
        await payFees(fee, id);
        await brevis.wait(brevisRes.queryKey, 11155111);
    } catch (error) {
        console.log(error);
    }
}

// INFO: Right now the fees is set to 0 by brevis
async function payFees(fee: string, id: any) {
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.drpc.org');
    //@ts-ignore
    const signer = new ethers.Wallet('a3fca102e683a3c210a99e85c81d5e8725e5845cf1ada682d7afe433a0e2b968', provider);
    console.log('Signer:', signer.address);
    const address = signer.address;
    const brevisRequest = new ethers.Contract('0xa082F86d9d1660C29cf3f962A31d7D20E367154F', brevisRequestABI, signer);
    const balance = await provider.getBalance(signer.address);
    console.log(`Current Balance: ${ethers.utils.formatEther(balance)} ETH`);
    const requiredFee = ethers.utils.parseEther(fee);
    if (balance.lt(requiredFee)) {
        throw new Error('Insufficient balance to pay the fees.');
    }
    const callback = {
        target: callbackAddress,
        gas: 600000,
    };
    const tx = await brevisRequest.sendRequest(id.query_hash, id.nonce, address, callback, 0, { value: requiredFee });
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
}

submitProof();
