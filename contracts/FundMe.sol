// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./priceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;

    // why multipy by 1e18, because we get the price in this form from getPrice()
    uint256 public minimumUSD = 50 * 1e18;

    // SO, to keep the track of senders(funders) lets create Array and mapping
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    //  Creating a constructor So, only the owner of funds can withdraw it

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate() >= minimumUSD,
            "Don't Have Enough Eth"
        );

        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public {
        require(msg.sender == owner, "You aren't the owner");

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }
}
