import { MaxUint256 } from '@ethersproject/constants';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { COMPOSABLE_COW_ABI } from '../extras/ComposablecowABI';
import { ethers } from 'ethers';
import { ERC20ABI } from '../extras/CowABI';

export interface Order {
    sellAmount: number;
    buyAmount: number;
    sellAddress: `0x${string}`;
    buyAddress: `0x${string}`;
}

export interface ConditionalOrderParams {
    staticInput: string;
    salt: string;
    handler: string;
}

export interface OrderCreationContext {
    spender: string;
}

export function createApprovalTxs(
    sellAddress: `0x${string}`,
    buyAddress: `0x${string}`,
    context: OrderCreationContext,
): MetaTransactionData[] {
    const { spender } = context;
    const sellAmountApproval = MaxUint256.toString();

    const txs: MetaTransactionData[] = [];

    const RPC_URL = 'https://rpc.ankr.com/eth_sepolia';
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const erc20SellContract = new ethers.Contract(sellAddress, ERC20ABI, provider);
    const erc20BuyContract = new ethers.Contract(buyAddress, ERC20ABI, provider);

    const approvesellTx = {
        to: sellAddress,
        data: erc20SellContract.interface.encodeFunctionData('approve', [spender, sellAmountApproval]),
        value: '0',
    };

    txs.push(approvesellTx);

    const approvebuyTx = {
        to: buyAddress,
        data: erc20BuyContract.interface.encodeFunctionData('approve', [spender, sellAmountApproval]),
        value: '0',
    };

    txs.push(approvebuyTx);

    console.log(txs);
    return txs;
}

export function createOrderTx(params: ConditionalOrderParams): MetaTransactionData[] {
    const txs: MetaTransactionData[] = [];
    const iface = new ethers.utils.Interface(COMPOSABLE_COW_ABI);

    const createOrderTx = {
        // only for sepolia for now
        to: '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74',
        data: iface.encodeFunctionData('createWithContext', [
            params,
            '0x52eD56Da04309Aca4c3FECC595298d80C2f16BAc',
            '0x',
            true,
        ]),
        value: '0',
    };

    txs.push(createOrderTx);

    return txs;
}
