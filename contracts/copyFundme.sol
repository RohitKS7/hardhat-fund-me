// /* ANCHOR this file is a copy of main fundme to show style guide and to remove extra comments from main file*/

// // NOTE Lesson -> Style guide(SG) of solidity to make it more readable and professional

// // SPDX-License-Identifier: GPL-3.0
// //ANCHOR-1 Pragma (SG)
// pragma solidity ^0.8.0;

// //ANCHOR-2 Imports (SG)
// import "./priceConverter.sol";

// //ANCHOR-3 Error Codes (SG)
// error FundMe__NotOwner(); //NOTE best practice => add contract name as prefix in custom errors so end user can identify which contract is throwing the error

// //ANCHOR-4 Interfaces(4), Libraries(5), Contracts(6)  (SG)

// //ANCHOR-(optional) "NatSpec Format" `ehtereum natural language specification format (NatSpec)
// // NOTE it's a way to documenting our code by using some commnets and tags properly
// // NOTE @dev is a way to explain something to developers
// // NOTE use NatSpec when you think something is compicated that others can't understand

// /** @title A contract for crowd funding
//  *  @author Rohit Kumar Suman
//  *  @notice This contract is to demo a sample funding contract
//  *  @dev This implements price feeds as our library
//  */
// contract FundMe {
//     //ANCHOR-7 Type Declarations (SG)
//     // SECTION PriceConverter library used here for uint256 type
//     using PriceConverter for uint256;

//     //ANCHOR-8 State Variables! (SG)
//     // NOTE Whenever you are declaring a State variable, consider adding "s_" prefix in the name of that variable to show, that they will gonna store in storage of contract but not in "constant & immutable" variable.
//     // SECTION state variable
//     uint256 public constant MINIMUM_USD = 50 * 1e18;

//     // SECTION array & mapping to keep track of address
//     address[] public s_funders;
//     mapping(address => uint256) public s_addressToAmountFunded;

//     address public immutable i_owner;

//     // SECTION priceFeed object
//     AggregatorV3Interface public s_priceFeed;

//     //ANCHOR-9 Events(9), Modifier(10)  (SG)
//     // SECTION modifier
//     modifier onlyOwner() {
//         // require (msg.sender == i_owner, "Withdrawal is not owner");  //Replaced with Custom Error\\
//         if (msg.sender != i_owner) {
//             revert FundMe__NotOwner();
//         }
//         _;
//     }

//     //ANCHOR-11 Functions Order: (SG)
//     /// constructor
//     /// receive
//     /// fallback
//     /// external
//     /// public
//     /// internal
//     /// private
//     /// view / pure

//     // SECTION constructor
//     // TODO adding chainlink priceFeed address for different chains as parameter here
//     constructor(address s_priceFeedAdress) {
//         i_owner = msg.sender;
//         s_priceFeed = AggregatorV3Interface(s_priceFeedAdress);
//     }

//     //SECTION receive
//     // receive() external payable {
//     //     fund();
//     // }

//     //SECTION fallback
//     // fallback() external payable {
//     //     fund();
//     // }

//     /**
//      *  @notice This function funds this contract
//      *  @dev This implements price feeds as our library
//      *  if you have parameters than add 'at the rate' param
//      *  if you have returns than add 'at the rate' return
//      */
//     // SECTION fund function
//     function fund() public payable {
//         require(
//             // NOTE 2nd parameter should be added in getConversionRate parenthesis
//             msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
//             "Don't Have Enough Eth"
//         );
//         s_funders.push(msg.sender);
//         s_addressToAmountFunded[msg.sender] += msg.value;
//     }

//     // SECTION withdraw function
//     function withdraw() public payable onlyOwner {
//         // NOTE reading array values from storage which cost more Gas
//         for (
//             uint256 funderIndex = 0;
//             funderIndex < s_funders.length;
//             funderIndex++
//         ) {
//             address funder = s_funders[funderIndex];
//             s_addressToAmountFunded[funder] = 0;
//         }
//         s_funders = new address[](0);

//         (bool callSuccess, ) = payable(msg.sender).call{
//             value: address(this).balance
//         }("");
//         require(callSuccess, "Call failed");
//     }

//     // SECTION creating Cheaper Withdraw function, its gas efficient.
//     function cheaperWithdraw() public payable onlyOwner {
//         // NOTE reading array all values from storage once and then from memory of functions which costs less Gas by saving "funders" array into memory
//         address[] memory funders = s_funders;
//         // NOTE mappings can't be in memory!!
//         for (
//             uint256 funderIndex = 0;
//             funderIndex < funders.length;
//             funderIndex++
//         ) {
//             address funder = funders[funderIndex];
//             s_addressToAmountFunded[funder] = 0;
//         }
//         // TODO update the state variable again
//         s_funders = new address[](0);

//         (bool callSuccess, ) = payable(msg.sender).call{
//             value: address(this).balance
//         }("");
//         require(callSuccess, "Call failed");
//     }
// }
