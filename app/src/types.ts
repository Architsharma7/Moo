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
export const callbackAddress = '0xA0d53c4A44bDBf39948fabe5ECd24292931d7246';
export const SIGNER_PRIVATE_KEY = '0xa3fca102e683a3c210a99e85c81d5e8725e5845cf1ada682d7afe433a0e2b968';
export const sellTokenAddress = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
export const buyTokenAddress = '0x58eb19ef91e8a6327fed391b51ae1887b833cc91';
export const buyAmount = 1000;
export const sellAmount = 1000;
export const safeAddress = '0x542e054E00D236Ec7330f943797f49B047be6C8c';
export const maincontractAddress = '0xA0d53c4A44bDBf39948fabe5ECd24292931d7246';
