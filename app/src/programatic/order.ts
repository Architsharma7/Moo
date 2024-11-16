import { MaxUint256 } from '@ethersproject/constants';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { Erc20 } from '@cowprotocol/abis';
import { COMPOSABLE_COW_CONTRACT_ADDRESS } from '@cowprotocol/cow-sdk';
import { COMPOSABLE_COW_ABI } from '../extras';
import { ethers } from 'ethers';

export interface Order {
    sellAmount: number;
    buyAmount: number;
    sellAddress: `0x${string}`;
    buyAddress: `0x${string}`;
    receiver: string;
}

export interface ConditionalOrderParams {
    staticInput: string;
    salt: string;
    handler: string;
}

export interface OrderCreationContext {
    spender: string;
    erc20Contract: Erc20;
}
export function createApprovalTxs(order: Order, context: OrderCreationContext): MetaTransactionData[] {
    const { erc20Contract, spender } = context;

    const { sellAddress } = order;

    const sellTokenAddress = sellAddress;
    const sellAmountApproval = MaxUint256.toString();

    const txs: MetaTransactionData[] = [];

    const approveTx = {
        to: sellTokenAddress,
        data: erc20Contract.interface.encodeFunctionData('approve', [spender, sellAmountApproval]),
        value: '0',
        operation: 0,
    };

    txs.push(approveTx);

    return txs;
}

export function createOrder(params: ConditionalOrderParams) {
    const txs: MetaTransactionData[] = [];
    const iface = new ethers.utils.Interface(COMPOSABLE_COW_ABI);

    const createOrderTx = {
        // only for sepolia for now
        to: COMPOSABLE_COW_CONTRACT_ADDRESS[11155111],
        data: iface.encodeFunctionData('createWithContext', [
            params,
            '0x52eD56Da04309Aca4c3FECC595298d80C2f16BAc',
            '0x',
            true,
        ]),
        value: '0',
        operation: 0,
    };

    txs.push(createOrderTx);

    return txs;
}
