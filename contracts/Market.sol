// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Market {

    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    struct itemInfo {
        address contractId;
        uint256 tokenId;
        uint256 price;
    }
    mapping (uint256 => itemInfo) tokenPrice;
    Counters.Counter private _listIndex;
    address public currencyToken;

    constructor (address _currencyToken) {
        currencyToken = _currencyToken;
    }

    function findTokenByValue(address contractId, uint256 tokenId) private view returns(uint256) {
        for (uint256 i = 0; i < _listIndex.current(); i++) {
            if(
                tokenPrice[i].contractId == contractId
                && tokenPrice[i].tokenId == tokenId
            ) {
                return i;
            }
        }
        revert("No such token in the market.");
    }

    function addTokenToMarket(address contractId, uint256 tokenId, uint256 price) public {
        require(IERC721(contractId).getApproved(tokenId) == address(this), "Can't add NFT to the market because owner doesn't allow spending.");
        require(price > 0, "Price must be > 0.");
        tokenPrice[_listIndex.current()] = itemInfo(contractId, tokenId, price);
        _listIndex.increment();
    }

    function removeTokenFromMarketByIndex(uint256 index) private {
        for (uint256 i = index; i < _listIndex.current() - 1; i++) {
            tokenPrice[i] = tokenPrice[i + 1];
        }
        delete tokenPrice[_listIndex.current() - 1];
    }

    function removeTokenFromMarket(address contractId, uint256 tokenId) public {
        uint256 index = findTokenByValue(contractId, tokenId);
        removeTokenFromMarketByIndex(index);
    }

    function buy(address buyer, address contractId, uint256 tokenId) public {
        address seller = IERC721(contractId).ownerOf(tokenId);
        uint256 index = findTokenByValue(contractId, tokenId);
        IERC20(currencyToken).safeTransferFrom(buyer, seller, tokenPrice[index].price);
        IERC721(contractId).transferFrom(seller, buyer, tokenId);
        removeTokenFromMarketByIndex(index);
    }

    function getAvailable(address contractId, uint256 tokenId) public view returns(bool) {
        findTokenByValue(contractId, tokenId); // Try-catch? Yes, this is stupid
        return true;
    }

    // TODO:
    // function getAvailableTokens()
}