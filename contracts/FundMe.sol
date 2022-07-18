// NOTE Lesson -> Style guide(SG) of solidity to make it more readable and professional

// SPDX-License-Identifier: GPL-3.0
//ANCHOR-1 Pragma (SG)
pragma solidity ^0.8.0;

//ANCHOR-2 Imports (SG)
import "./priceConverter.sol";

//ANCHOR-3 Error Codes (SG)
error FundMe__NotOwner(); //NOTE best practice => add contract name as prefix in custom errors so end user can identify which contract is throwing the error

//ANCHOR-4 Interfaces(4), Libraries(5), Contracts(6)  (SG)

//ANCHOR-(optional) "NatSpec Format" `ehtereum natural language specification format (NatSpec)
// NOTE it's a way to documenting our code by using some commnets and tags properly
// NOTE @dev is a way to explain something to developers
// NOTE use NatSpec when you think something is compicated that others can't understand

/** @title A contract for crowd funding
 *  @author Rohit Kumar Suman
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
    //ANCHOR-7 Type Declarations (SG)
    // SECTION PriceConverter library used here for uint256 type
    using PriceConverter for uint256;

    //ANCHOR-8 State Variables! (SG)
    // SECTION state variable
    uint256 public constant MINIMUM_USD = 50 * 1e18;

    // SECTION array & mapping to keep track of address
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public immutable i_owner;

    // SECTION priceFeed object
    AggregatorV3Interface public priceFeed;

    //ANCHOR-9 Events(9), Modifier(10)  (SG)
    // SECTION modifier
    modifier onlyOwner() {
        // require (msg.sender == i_owner, "Withdrawal is not owner");  //Replaced with Custom Error\\
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    //ANCHOR-11 Functions Order: (SG)
    /// constructor
    /// receive
    /// fallback
    /// external
    /// public
    /// internal
    /// private
    /// view / pure

    // SECTION constructor
    // TODO adding chainlink priceFeed address for different chains as parameter here
    constructor(address priceFeedAdress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAdress);
    }

    //SECTION receive
    // receive() external payable {
    //     fund();
    // }

    //SECTION fallback
    // fallback() external payable {
    //     fund();
    // }

    /**
     *  @notice This function funds this contract
     *  @dev This implements price feeds as our library
     *  if you have parameters than add 'at the rate' param
     *  if you have returns than add 'at the rate' return
     */
    // SECTION fund function
    function fund() public payable {
        require(
            // NOTE 2nd parameter should be added in getConversionRate parenthesis
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Don't Have Enough Eth"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    // SECTION withdraw function
    function withdraw() public payable onlyOwner {
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
