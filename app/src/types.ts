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
export const callbackAddress = '0x39671c00bb6f4F82265eC7802C20F2A3d65D9EDa';
