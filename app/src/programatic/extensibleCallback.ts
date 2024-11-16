import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { Contract } from '@ethersproject/contracts';
import { SupportedChainId } from '@cowprotocol/cow-sdk';
import { GPv2Settlement, ExtensibleFallbackHandlerABI } from '../extras/CowABI';

const COMPOSABLE_COW_ADDRESS = '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74';
const SAFE_EXTENSIBLE_HANDLER_ADDRESS = '0x2f55e8b20D0B9FEFA187AA7d00B6Cbe563605bF5';

export interface ExtensibleFallbackContext {
    safeAddress: string;
    chainId: SupportedChainId;
    settlementContract: any;
    provider: any;
}

export async function getSignatureVerifierContract(context: ExtensibleFallbackContext): Promise<any> {
    const { safeAddress, provider } = context;
    // SignatureVerifierMuxer
    return new Contract(safeAddress, ExtensibleFallbackHandlerABI, provider);
}

export async function extensibleFallbackSetupTxs(context: ExtensibleFallbackContext): Promise<MetaTransactionData[]> {
    const { chainId, safeAddress, settlementContract } = context;
    const gvp2settelment = new Contract(settlementContract, GPv2Settlement, context.provider);

    const domainSeparator = await gvp2settelment.callStatic.domainSeparator();

    const signatureVerifierContract = await getSignatureVerifierContract(context);
    const composableCowContractAddress = COMPOSABLE_COW_ADDRESS[chainId];
    const extensibleHandlerAddress = SAFE_EXTENSIBLE_HANDLER_ADDRESS[chainId];

    const setFallbackHandlerTx = {
        to: safeAddress,
        data: signatureVerifierContract.interface.encodeFunctionData('setFallbackHandler', [extensibleHandlerAddress]),
        value: '0',
    };

    const setDomainVerifierTx = {
        to: safeAddress,
        data: signatureVerifierContract.interface.encodeFunctionData('setDomainVerifier', [
            domainSeparator,
            composableCowContractAddress,
        ]),
        value: '0',
    };

    return [setFallbackHandlerTx, setDomainVerifierTx];
}
