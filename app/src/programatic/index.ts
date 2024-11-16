import { createSafeClient } from '@safe-global/sdk-starter-kit';
import { ExtensibleFallbackContext, extensibleFallbackSetupTxs } from './extensibleCallback';
import { SupportedChainId } from '@cowprotocol/cow-sdk';
import { createApprovalTxs, Order } from './order';
import { SigningMethod } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import { ERC20ABI } from '../extras/CowABI';
import { createOrderTx, ConditionalOrderParams } from './order';
import { hexZeroPad } from '@ethersproject/bytes';

const SIGNER_PRIVATE_KEY = '';
const RPC_URL = 'https://rpc.ankr.com/eth_sepolia';
const sellTokenAddress = '0x';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const safeAddress = '';

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
    const erc20Contract = new ethers.Contract(sellAddress, ERC20ABI, provider);
    const orderContext = {
        spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
        erc20Contract: erc20Contract,
    };
    const approvalTxs = await createApprovalTxs(sellTokenAddress, orderContext);

    const txs = callbackTxs.concat(approvalTxs);

    const tx = await safeClient.protocolKit.createTransaction({ transactions: txs });

    const safeTransaction = await safeClient.protocolKit.signTransaction(tx, SigningMethod.ETH_SIGN);

    const transactionResponse = await safeClient.protocolKit.executeTransaction(safeTransaction);
    console.log(transactionResponse);
};

export const createOrder = async (orderdetails: Order) => {
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
        //Todo: Add handler address
        handler: '',
    };
    const orderTx = await createOrderTx(params);
    const tx = await safeClient.protocolKit.createTransaction({ transactions: orderTx });

    const safeTransaction = await safeClient.protocolKit.signTransaction(tx, SigningMethod.ETH_SIGN);

    const transactionResponse = await safeClient.protocolKit.executeTransaction(safeTransaction);
    console.log(transactionResponse);
};
