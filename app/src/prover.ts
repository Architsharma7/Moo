import { ProofRequest, ReceiptData, Field, ErrCode, Prover, Brevis } from 'brevis-sdk-typescript';
import { TradeEvent, settlementContract, RPC_URL, callbackAddress } from './types';
import { fetchLastTradeEvents } from './collector';
import { ethers } from 'ethers';
import { brevisRequestABI } from './extras/BrevisRequestABI';

async function createProofRequest(tradeEvents: TradeEvent[]): Promise<ProofRequest> {
    const proofReq = new ProofRequest();

    tradeEvents.forEach(event => {
        proofReq.addReceipt(
            new ReceiptData({
                tx_hash: event.txHash,
                block_num: event.block,
                fields: [
                    new Field({
                        contract: settlementContract,
                        log_pos: 0,
                        is_topic: false,
                        field_index: 2,
                        value: event.sellAmount.toString(),
                    }),
                    new Field({
                        contract: settlementContract,
                        log_pos: 0,
                        is_topic: false,
                        field_index: 3,
                        value: event.buyAmount.toString(),
                    }),
                ],
            }),
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
        const tradeEvents = await fetchLastTradeEvents(
            provider,
            settlementContract,
            '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
            '0xb4f1737af37711e9a5890d9510c9bb60e170cb0d',
        );
        const proofReq = await createProofRequest(tradeEvents);
        const proofRes = await sendProof(proofReq);
        if (!proofRes) {
            console.log('Proof failed');
            return;
        }
        const brevisRes = await brevis.submit(proofReq, proofRes, 11155111, 11155111, 0, '', callbackAddress);
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
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    //@ts-ignore
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = signer.address;
    const nonce = await provider.getTransactionCount(address);
    const brevisRequest = new ethers.Contract('0xa082F86d9d1660C29cf3f962A31d7D20E367154F', brevisRequestABI, signer);
    const balance = await provider.getBalance(signer.address);
    console.log(`Current Balance: ${ethers.utils.formatEther(balance)} ETH`);
    const requiredFee = ethers.utils.parseEther(fee);
    if (balance.lt(requiredFee)) {
        throw new Error('Insufficient balance to pay the fees.');
    }
    const tx = await brevisRequest.sendRequest(id, nonce, address, '', 1, { value: requiredFee });
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
}