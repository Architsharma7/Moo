import { createSafeClient } from '@safe-global/sdk-starter-kit';
import { ExtensibleFallbackContext, extensibleFallbackSetupTxs } from './extensibleCallback';
import { SupportedChainId } from '@cowprotocol/cow-sdk';
import { createApprovalTxs, Order } from './order';
import { SigningMethod } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import { createOrderTx, ConditionalOrderParams } from './order';
import { hexZeroPad } from '@ethersproject/bytes';

const SIGNER_PRIVATE_KEY = '0xa3fca102e683a3c210a99e85c81d5e8725e5845cf1ada682d7afe433a0e2b968';
const RPC_URL = 'https://rpc.ankr.com/eth_sepolia';
const sellTokenAddress = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
const buyTokenAddress = '0x58eb19ef91e8a6327fed391b51ae1887b833cc91';
const buyAmount = 1000;
const sellAmount = 1000;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const safeAddress = '0x542e054E00D236Ec7330f943797f49B047be6C8c';

export const callbackAndApproval = async (sellAddress: string) => {
    const safeClient = await createSafeClient({
        provider: RPC_URL,
        signer: SIGNER_PRIVATE_KEY,
        safeAddress: safeAddress,
    });

    const contextForFallback: ExtensibleFallbackContext = {
        safeAddress: safeAddress,
        chainId: SupportedChainId.SEPOLIA,
        settlementContract: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
        provider: provider,
    };
    const callbackTxs = await extensibleFallbackSetupTxs(contextForFallback);
    const orderContext = {
        spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
    };
    const approvalTxs = await createApprovalTxs(sellTokenAddress, buyTokenAddress, orderContext);

    const txs = callbackTxs.concat(approvalTxs);

    const tx = await safeClient.protocolKit.createTransaction({ transactions: txs });

    const safeTransaction = await safeClient.protocolKit.signTransaction(tx, SigningMethod.ETH_SIGN);

    const transactionResponse = await safeClient.protocolKit.executeTransaction(safeTransaction);
    console.log(transactionResponse);
};

export const createOrder = async () => {
    const orderdetails: Order = {
        sellAmount: sellAmount,
        buyAmount: buyAmount,
        sellAddress: sellTokenAddress,
        buyAddress: buyTokenAddress,
    };
    const abiCoder = new ethers.utils.AbiCoder();
    const safeClient = await createSafeClient({
        provider: RPC_URL,
        signer: SIGNER_PRIVATE_KEY,
        safeAddress: safeAddress,
    });
    const ORDER_STRUCT = 'tuple(uint256 sellAmount, uint256 buyAmount, address sellToken, address buyToken)';
    const params: ConditionalOrderParams = {
        staticInput: abiCoder.encode(
            [ORDER_STRUCT],
            [
                {
                    sellAmount: orderdetails.sellAmount,
                    buyAmount: orderdetails.buyAmount,
                    sellToken: orderdetails.sellAddress,
                    buyToken: orderdetails.buyAddress,
                },
            ],
        ),
        salt: hexZeroPad(Buffer.from(Date.now().toString(16), 'hex'), 32),
        handler: '0x902da116B35AfaAa9841b2b16603f8a18aD95Af3',
    };
    const orderTx = await createOrderTx(params);
    const tx = await safeClient.protocolKit.createTransaction({ transactions: orderTx });

    const safeTransaction = await safeClient.protocolKit.signTransaction(tx, SigningMethod.ETH_SIGN);

    const transactionResponse = await safeClient.protocolKit.executeTransaction(safeTransaction);
    console.log(transactionResponse);
};

createOrder();
