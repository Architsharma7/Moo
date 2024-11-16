import { createSafeClient } from '@safe-global/sdk-starter-kit';
import { ExtensibleFallbackContext, extensibleFallbackSetupTxs } from './extensibleCallback';
import { SupportedChainId } from '@cowprotocol/cow-sdk';
import { createApprovalTxs } from './order';
import { SigningMethod } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import { ERC20ABI } from '../extras/CowABI';

const SIGNER_PRIVATE_KEY = '';
const RPC_URL = 'https://rpc.ankr.com/eth_sepolia';
const sellTokenAddress = '0x';

export const callbackAndApproval = async (sellAddress: string) => {
    const safeAddress = '';
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
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
