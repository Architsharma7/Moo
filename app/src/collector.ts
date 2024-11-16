import { ethers } from 'ethers';
import { RPC_URL, TRADE_EVENT_TOPIC, TradeEvent } from './types';

export async function fetchLastTradeEvents(
    provider: ethers.providers.JsonRpcProvider,
    settlementContract: `0x${string}`,
    blockCount: number = 70,
): Promise<TradeEvent[]> {
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = currentBlock - blockCount;
    console.log(currentBlock, fromBlock);
    const seenPairs = new Map<string, TradeEvent>();
    const tradeEvents: TradeEvent[] = [];
    let matchFound = false;

    const logs = await provider.getLogs({
        address: settlementContract,
        topics: [TRADE_EVENT_TOPIC],
        fromBlock,
        toBlock: currentBlock,
    });
    console.log(logs);

    const iface = new ethers.utils.Interface([
        'event Trade(address indexed owner, address sellToken, address buyToken, uint256 sellAmount, uint256 buyAmount, uint256 feeAmount, bytes orderUid)',
    ]);

    async function getRelativeLogIndex(txHash: string, blockNumber: number, eventLogIndex: number): Promise<number> {
        const txLogs = await provider.getLogs({
            blockHash: (await provider.getBlock(blockNumber)).hash,
        });
        const txSpecificLogs = txLogs.filter(log => log.transactionHash === txHash);
        const firstLogIndex = txSpecificLogs[0]?.logIndex || 0;
        return eventLogIndex - firstLogIndex;
    }

    for (const log of logs) {
        const parsedLog = iface.parseLog(log);
        if (!parsedLog) continue;

        const block = await provider.getBlock(log.blockNumber);
        if (!block) continue;

        const relativeLogIndex = await getRelativeLogIndex(log.transactionHash, log.blockNumber, log.logIndex);

        const event: TradeEvent = {
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
            logIndex: relativeLogIndex,
        };

        const pairKey = `${event.sellToken}-${event.buyToken}`;

        if (!matchFound && seenPairs.has(pairKey)) {
            const previousEvent = seenPairs.get(pairKey)!;
            console.log('Found first matching pair:', {
                sellToken: event.sellToken,
                buyToken: event.buyToken,
                blocks: [previousEvent.block, event.block],
                logIndexes: [previousEvent.logIndex, event.logIndex],
            });
            tradeEvents.push(previousEvent, event);
            matchFound = true;
            break;
        }

        if (!matchFound) {
            seenPairs.set(pairKey, event);
        }
    }

    console.log(`Found ${tradeEvents.length} events`);
    console.log(tradeEvents);
    return tradeEvents;
}

// export async function fetchLastTradeEvents(
//     provider: ethers.providers.JsonRpcProvider,
//     settlementContract: `0x${string}`,
//     sellToken: `0x${string}`,
//     buyToken: `0x${string}`,
//     blockCount: number = 200,
// ): Promise<TradeEvent[]> {
//     const currentBlock = await provider.getBlockNumber();
//     const fromBlock = currentBlock - blockCount;
//     console.log(currentBlock, fromBlock);
//     const tradeEvents = new Map<number, TradeEvent>();

//     if (fromBlock < 0 || fromBlock > currentBlock) {
//         console.error('Invalid block count');
//         return [];
//     }

//     const logs = await provider.getLogs({
//         address: settlementContract,
//         topics: [TRADE_EVENT_TOPIC],
//         fromBlock,
//         toBlock: currentBlock,
//     });
//     console.log(logs);

//     const iface = new ethers.utils.Interface([
//         'event Trade(address indexed owner, address sellToken, address buyToken, uint256 sellAmount, uint256 buyAmount, uint256 feeAmount, bytes orderUid)',
//     ]);

//     await Promise.all(
//         logs.map(async log => {
//             const parsedLog = iface.parseLog(log);
//             if (!parsedLog) return;
//             const block = await provider.getBlock(log.blockNumber);
//             if (!block) return;
//             if (
//                 parsedLog.args.sellToken.toLowerCase() === sellToken.toLowerCase() &&
//                 parsedLog.args.buyToken.toLowerCase() === buyToken.toLowerCase()
//             ) {
//                 tradeEvents.set(log.blockNumber, {
//                     owner: parsedLog.args.owner.toLowerCase(),
//                     sellToken: parsedLog.args.sellToken.toLowerCase(),
//                     buyToken: parsedLog.args.buyToken.toLowerCase(),
//                     sellAmount: BigInt(parsedLog.args.sellAmount),
//                     buyAmount: BigInt(parsedLog.args.buyAmount),
//                     feeAmount: BigInt(parsedLog.args.feeAmount),
//                     orderUid: parsedLog.args.orderUid,
//                     timestamp: block.timestamp,
//                     txHash: log.transactionHash,
//                     block: log.blockNumber,
//                 });
//             }
//         }),
//     );

//     const uniqueBlockEvents = Array.from(tradeEvents.values());

//     const latestEvents = uniqueBlockEvents.slice(-32);

//     // if (latestEvents.length < 10) {
//     //     console.log('Less than required number of trade events found');
//     //     console.log(latestEvents);
//     //     return latestEvents;
//     // }

//     console.log(latestEvents);
//     console.log(`Found ${latestEvents.length} events `);
//     return latestEvents;
// }

// function filterTradesByTokens(events: TradeEvent[], sellToken: string, buyToken: string): TradeEvent[] {
//     const filteredEvents = events.filter(
//         event =>
//             event.sellToken.toLowerCase() === sellToken.toLowerCase() &&
//             event.buyToken.toLowerCase() === buyToken.toLowerCase(),
//     );
//     console.log(filteredEvents);
//     console.log(`Filtered ${filteredEvents.length} trade events`);
//     if (filteredEvents.length === 0) {
//         console.log('No trade events found for the specified tokens');
//         return [];
//     }
//     if (filteredEvents.length < 10) {
//         console.log('Less than required number of trade events found for the specified tokens');
//         return [];
//     }
//     return filteredEvents;
// }
