// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import {BrevisApp} from "./lib/BrevisApp.sol";

contract MainContract is BrevisApp, Ownable {
    struct PriceStatistics {
        uint256 latestPrice;
        uint256 meanPrice;
        uint256 zScore;
        uint256 minPrice;
        uint256 maxPrice;
        uint256 timestamp;
    }

    uint256 public constant MAX_DATA_AGE = 1 hours;
    bytes32 public vkHash;

    PriceStatistics public priceStats;

    event StatsUpdated(
        uint256 latestPrice,
        uint256 meanPrice,
        uint256 zScore,
        uint256 minPrice,
        uint256 maxPrice,
        uint256 timestamp
    );

    constructor(address brevisRequest) BrevisApp(brevisRequest) Ownable(msg.sender) {}

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

    function getPriceStats() public view returns (PriceStatistics memory stats) {
        stats = priceStats;
        require(block.timestamp - stats.timestamp <= MAX_DATA_AGE, "Data too old");
        return stats;
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
