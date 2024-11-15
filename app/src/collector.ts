import { ethers } from 'ethers';

const TRADE_EVENT_TOPIC = ethers.id('Trade(address,address,address,uint256,uint256,uint256,bytes)');

interface TradeEvent {
    owner: string;
    sellToken: string;
    buyToken: string;
    sellAmount: bigint;
    buyAmount: bigint;
    feeAmount: bigint;
    orderUid: string;
    timestamp: number;
    txHash: string;
}

export async function fetchLastTradeEvents(
    provider: ethers.JsonRpcProvider,
    settlementContract: string,
    blockCount: number = 5000,
): Promise<TradeEvent[]> {
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = currentBlock - blockCount;
    const tradeEvents: TradeEvent[] = [];

    const logs = await provider.getLogs({
        address: settlementContract,
        topics: [TRADE_EVENT_TOPIC],
        fromBlock,
        toBlock: currentBlock,
    });

    const lastEvents = logs.slice(-32);

    await Promise.all(
        lastEvents.map(async log => {
            // const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            //     ['address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
            //     log.data,
            // );

            const iface = new ethers.Interface([
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
                        sellAmount: parsedLog.args.sellAmount,
                        buyAmount: parsedLog.args.buyAmount,
                        feeAmount: parsedLog.args.feeAmount,
                        orderUid: parsedLog.args.orderUid,
                        timestamp: block.timestamp,
                        txHash: log.transactionHash,
                    });
                }),
            );
        }),
    );

    console.log(`Fetched ${tradeEvents.length} trade events`);
    console.log(tradeEvents);
    return tradeEvents;
}

const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
const settlementContract = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41';
fetchLastTradeEvents(provider, settlementContract);
