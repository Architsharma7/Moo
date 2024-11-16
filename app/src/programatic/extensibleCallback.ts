import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { SignatureVerifierMuxerAbi, SignatureVerifierMuxer, GPv2Settlement } from '@cowprotocol/abis';
import { Contract } from '@ethersproject/contracts';
import { SupportedChainId } from '@cowprotocol/cow-sdk';
import { Web3Provider } from '@ethersproject/providers';

const COMPOSABLE_COW_ADDRESS = '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74';
const SAFE_EXTENSIBLE_HANDLER_ADDRESS = '0x2f55e8b20D0B9FEFA187AA7d00B6Cbe563605bF5';

export interface ExtensibleFallbackContext {
    safeAddress: string;
    chainId: SupportedChainId;
    settlementContract: GPv2Settlement;
    provider: Web3Provider;
}

export async function getSignatureVerifierContract(
    context: ExtensibleFallbackContext,
): Promise<SignatureVerifierMuxer> {
    const { safeAddress, provider } = context;

    return new Contract(safeAddress, SignatureVerifierMuxerAbi, provider) as SignatureVerifierMuxer;
}

export async function extensibleFallbackSetupTxs(context: ExtensibleFallbackContext): Promise<MetaTransactionData[]> {
    const { chainId, safeAddress, settlementContract } = context;

    const domainSeparator = await settlementContract.callStatic.domainSeparator();

    const signatureVerifierContract = await getSignatureVerifierContract(context);
    const composableCowContractAddress = COMPOSABLE_COW_ADDRESS[chainId];
    const extensibleHandlerAddress = SAFE_EXTENSIBLE_HANDLER_ADDRESS[chainId];

    const setFallbackHandlerTx = {
        to: safeAddress,
        data: signatureVerifierContract.interface.encodeFunctionData('setFallbackHandler', [extensibleHandlerAddress]),
        value: '0',
        operation: 0,
    };

    const setDomainVerifierTx = {
        to: safeAddress,
        data: signatureVerifierContract.interface.encodeFunctionData('setDomainVerifier', [
            domainSeparator,
            composableCowContractAddress,
        ]),
        value: '0',
        operation: 0,
    };

    return [setFallbackHandlerTx, setDomainVerifierTx];
}
