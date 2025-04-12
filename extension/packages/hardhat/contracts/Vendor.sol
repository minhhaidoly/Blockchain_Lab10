// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {
    // Events
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event SellTokens(address seller, uint256 amountOfTokens, uint256 amountOfETH);

    // Our token contract
    YourToken public yourToken;
    
    // Token price: 1 ETH = 100 tokens
    uint256 public constant tokensPerEth = 100;

    constructor(address tokenAddress) Ownable(msg.sender) {
        yourToken = YourToken(tokenAddress);
    }

    // Payable function to buy tokens
    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        
        // Calculate token amount based on exchange rate
        uint256 tokenAmount = msg.value * tokensPerEth / 1 ether;
        
        // Check if the vendor has enough tokens
        uint256 vendorBalance = yourToken.balanceOf(address(this));
        require(vendorBalance >= tokenAmount, "Vendor has insufficient tokens");
        
        // Transfer tokens to the buyer
        bool sent = yourToken.transfer(msg.sender, tokenAmount);
        require(sent, "Failed to transfer tokens to buyer");
        
        // Emit the event
        emit BuyTokens(msg.sender, msg.value, tokenAmount);
    }
    
    // Function for users to sell tokens back to the vendor
    function sellTokens(uint256 tokenAmount) public {
        require(tokenAmount > 0, "Specify an amount of tokens greater than zero");
        
        // Calculate ETH amount based on exchange rate
        uint256 ethAmount = tokenAmount * 1 ether / tokensPerEth;
        
        // Check if the vendor has enough ETH
        uint256 vendorBalance = address(this).balance;
        require(vendorBalance >= ethAmount, "Vendor has insufficient ETH");
        
        // Transfer tokens from user to vendor using transferFrom (requires approval)
        bool sent = yourToken.transferFrom(msg.sender, address(this), tokenAmount);
        require(sent, "Failed to transfer tokens from user to vendor");
        
        // Transfer ETH to the user
        (bool ethSent, ) = msg.sender.call{value: ethAmount}("");
        require(ethSent, "Failed to send ETH to user");
        
        // Emit the event
        emit SellTokens(msg.sender, tokenAmount, ethAmount);
    }
    
    // Owner-only function to withdraw ETH from contract
    function withdraw() public onlyOwner {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "No ETH to withdraw");
        
        (bool sent, ) = msg.sender.call{value: ownerBalance}("");
        require(sent, "Failed to send ETH to owner");
    }
}