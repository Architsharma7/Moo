import { ethers } from 'ethers';
import { RPC_URL, TRADE_EVENT_TOPIC, TradeEvent } from './types';

export async function fetchLastTradeEvents(
    provider: ethers.providers.JsonRpcProvider,
    settlementContract: `0x${string}`,
    sellToken: `0x${string}`,
    buyToken: `0x${string}`,
    blockCount: number = 10000,
): Promise<TradeEvent[]> {
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = currentBlock - blockCount;
    const tradeEvents: TradeEvent[] = [];

    if (fromBlock < 0 || fromBlock > currentBlock) {
        console.error('Invalid block count');
        return [];
    }

    const logs = await provider.getLogs({
        address: settlementContract,
        topics: [TRADE_EVENT_TOPIC],
        fromBlock,
        toBlock: currentBlock,
    });

    const lastEvents = logs.slice(-32);

    await Promise.all(
        lastEvents.map(async log => {
            const iface = new ethers.utils.Interface([
                'event Trade(address indexed owner, address sellToken, address buyToken, uint256 sellAmount, uint256 buyAmount, uint256 feeAmount, bytes orderUid)',
            ]);

            const block = await provider.getBlock(log.blockNumber);
            if (!block) return;

            await Promise.all(
                lastEvents.map(async log => {
                    const parsedLog = iface.parseLog(log);
                    if (!parsedLog) return;
                    const block = await provider.getBlock(log.blockNumber);
                    if (!block) return;

                    tradeEvents.push({
                        owner: parsedLog.args.owner.toLowerCase(),
                        sellToken: parsedLog.args.sellToken.toLowerCase(),
                        buyToken: parsedLog.args.buyToken.toLowerCase(),
                        sellAmount: BigInt(parsedLog.args.sellAmount),
                        buyAmount: BigInt(parsedLog.args.buyAmount),
                        feeAmount: BigInt(parsedLog.args.feeAmount),
                        orderUid: parsedLog.args.orderUid,
                        timestamp: block.timestamp,
                        txHash: log.transactionHash,
                        block: log.blockNumber,
                    });
                }),
            );
        }),
    );
    return filterTradesByTokens(tradeEvents, sellToken, buyToken);
}

function filterTradesByTokens(events: TradeEvent[], sellToken: string, buyToken: string): TradeEvent[] {
    const filteredEvents = events.filter(
        event =>
            event.sellToken.toLowerCase() === sellToken.toLowerCase() &&
            event.buyToken.toLowerCase() === buyToken.toLowerCase(),
    );
    console.log(filteredEvents);
    console.log(`Filtered ${filteredEvents.length} trade events`);
    if (filteredEvents.length === 0) {
        console.log('No trade events found for the specified tokens');
        return [];
    }
    if (filteredEvents.length < 10) {
        console.log('Less than required number of trade events found for the specified tokens');
        return [];
    }
    return filteredEvents;
}

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const settlementContract = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41';
fetchLastTradeEvents(
    provider,
    settlementContract,
    '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    '0xb4f1737af37711e9a5890d9510c9bb60e170cb0d',
);
