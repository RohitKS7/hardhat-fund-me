// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.8;

// chainlink to get real world ether price in USD
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface s_priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int price, , , ) = s_priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface s_priceFeed
    ) internal view returns (uint256) {
        // when we call getPrice() we can add priceFeed of FundMe.sol
        uint256 ethPrice = getPrice(s_priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
