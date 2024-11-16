// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import {BrevisApp} from "./BrevisApp.sol";
import {ComposableCoW} from "./ComposableCoW.sol";

import {IConditionalOrder, IConditionalOrderGenerator, BaseConditionalOrder} from "./BaseConditionalOrder.sol";
import {GPv2Order} from "./GPv2order.sol";

string constant TOO_EARLY = "too early, brevis data not available";

contract MainContract is BrevisApp, Ownable, BaseConditionalOrder {
    struct PriceStatistics {
        uint256 latestPrice;
        uint256 meanPrice;
        uint256 zScore;
        uint256 minPrice;
        uint256 maxPrice;
        uint256 timestamp;
    }

    uint256 public constant MAX_DATA_AGE = 1 days;
    uint256 public constant Z_SCORE_THRESHOLD = 1e18;
    bytes32 public vkHash;
    bytes32 public constant KIND_SELL = keccak256("sell");
    bytes32 public constant KIND_BUY = keccak256("buy");
    bytes32 public constant BALANCE_ERC20 = keccak256("erc20");
    ComposableCoW public immutable composableCow;

    PriceStatistics public priceStats;

    event StatsUpdated(
        uint256 latestPrice,
        uint256 meanPrice,
        uint256 zScore,
        uint256 minPrice,
        uint256 maxPrice,
        uint256 timestamp
    );

    constructor(address brevisRequest, ComposableCoW _composableCow) BrevisApp(brevisRequest) Ownable() {
        composableCow = _composableCow;
    }

    function getTradeableOrder(
        address owner,
        address,
        bytes32 ctx,
        bytes calldata staticInput,
        bytes calldata
    ) public view override returns (GPv2Order.Data memory order) {
        GPv2Order.Data memory inputOrder = abi.decode(staticInput, (GPv2Order.Data));

        if (priceStats.timestamp == 0) {
            revert IConditionalOrder.PollTryAtBlock(block.number + 10, TOO_EARLY);
        }
        if (block.timestamp - priceStats.timestamp > MAX_DATA_AGE) {
            revert IConditionalOrder.PollTryAtBlock(block.number + 10, "Price data too old");
        }
        require(priceStats.zScore >= Z_SCORE_THRESHOLD, "Price movement not significant");

        bool shouldBuy = priceStats.latestPrice < priceStats.meanPrice;
        bytes32 kind = shouldBuy ? KIND_BUY : KIND_SELL;

        order = GPv2Order.Data({
            sellToken: shouldBuy ? inputOrder.buyToken : inputOrder.sellToken,
            buyToken: shouldBuy ? inputOrder.sellToken : inputOrder.buyToken,
            receiver: address(0),
            sellAmount: inputOrder.sellAmount,
            buyAmount: inputOrder.buyAmount,
            validTo: uint32(block.timestamp + 1 days),
            appData: 0,
            feeAmount: 0,
            kind: kind,
            partiallyFillable: false,
            sellTokenBalance: BALANCE_ERC20,
            buyTokenBalance: BALANCE_ERC20
        });
    }

    function handleProofResult(bytes32 _vkHash, bytes calldata _circuitOutput) internal override {
        require(vkHash == _vkHash, "invalid vk");

        (uint256 latestPrice, uint256 meanPrice, uint256 zScore, uint256 minPrice, uint256 maxPrice) = decodeOutput(
            _circuitOutput
        );

        priceStats = PriceStatistics({
            latestPrice: latestPrice,
            meanPrice: meanPrice,
            zScore: zScore,
            minPrice: minPrice,
            maxPrice: maxPrice,
            timestamp: block.timestamp
        });

        emit StatsUpdated(latestPrice, meanPrice, zScore, minPrice, maxPrice, block.timestamp);
    }

    function decodeOutput(
        bytes calldata o
    )
        internal
        pure
        returns (uint256 latestPrice, uint256 meanPrice, uint256 zScore, uint256 minPrice, uint256 maxPrice)
    {
        latestPrice = uint256(bytes32(o[0:32]));
        meanPrice = uint256(bytes32(o[32:64]));
        zScore = uint256(bytes32(o[64:96]));
        minPrice = uint256(bytes32(o[96:128]));
        maxPrice = uint256(bytes32(o[128:160]));
    }

    function setVkHash(bytes32 _vkHash) external onlyOwner {
        vkHash = _vkHash;
    }
}
