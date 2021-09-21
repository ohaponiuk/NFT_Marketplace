// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Market {

    using SafeERC20 for IERC20;

    address public currencyToken;
    mapping (address => mapping (uint256 => uint256)) public tokenPrice; // ERC721 contract address => tokenId => price in ERC20 tokens

    constructor (address _currencyToken) {
        currencyToken = _currencyToken;
    }

    function addTokenToMarket(address contractId, uint256 tokenId, uint256 price) public {
        require(IERC721(contractId).getApproved(tokenId) == address(this), "Can't add NFT to the market because owner doesn't allow spending.");
        require(price > 0, "Price must be > 0.");
        tokenPrice[contractId][tokenId] = price;
    }

    function removeTokenFromMarket(address contractId, uint256 tokenId) public {
        require(tokenPrice[contractId][tokenId] > 0, "NFT is already removed.");
        tokenPrice[contractId][tokenId] = 0;
    }

    function buy(address buyer, address contractId, uint256 tokenId) public {
        address seller = IERC721(contractId).ownerOf(tokenId);
        require(tokenPrice[contractId][tokenId] > 0, "This NFT isn't in the market.");
        IERC20(currencyToken).safeTransferFrom(buyer, seller, tokenPrice[contractId][tokenId]);
        IERC721(contractId).transferFrom(seller, buyer, tokenId);
        delete tokenPrice[contractId][tokenId];
    }
}