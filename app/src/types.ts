import { ethers } from 'ethers';

export const TRADE_EVENT_TOPIC = ethers.utils.id('Trade(address,address,address,uint256,uint256,uint256,bytes)');

export interface TradeEvent {
    owner: string;
    sellToken: string;
    buyToken: string;
    sellAmount: bigint;
    buyAmount: bigint;
    feeAmount: bigint;
    orderUid: string;
    timestamp: number;
    txHash: string;
    block: number;
    logIndex: number;
}

export const settlementContract = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41';
export const RPC_URL = 'https://rpc.ankr.com/eth';
export const callbackAddress = '0x902da116B35AfaAa9841b2b16603f8a18aD95Af3';
