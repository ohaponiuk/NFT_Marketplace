// const { time, expectRevert } = require('@openzeppelin/test-helpers');
// const bigDecimal = require('js-big-decimal');
const BN = web3.utils.BN;
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const equal = chai.assert.equal;
chai.use(require('bn-chai')(BN));
chai.use(require('chai-match'));

function toBN(number) {
    return web3.utils.toBN(number);
}

function toBNWithDecimals(number) {
    return toBN(number).mul(toBN(10).pow(toBN(18)))
}

const GameItem = artifacts.require("GameItem")
const Vex = artifacts.require("Vex")
const Market = artifacts.require("Market")

contract("Market", (accounts) => {
    before(async() => {
        gameItem = await GameItem.deployed()
        vex = await Vex.deployed()
        market = await Market.deployed()
    })
    // it("Using a marketplace", async() => {
    //     var amount = web3.utils.toBN(100).mul(web3.utils.toBN(10).pow(web3.utils.toBN(await vex.decimals())))
    //     await vex.approve(market.address, amount, {from: accounts[0]})
    //     await gameItem.awardItem(accounts[1], "rock")
    //     await gameItem.approve(market.address, 1, {from: accounts[1]})
    //     await market.addTokenToMarket(gameItem.address, 1, amount)
    //     await market.buy(accounts[0], gameItem.address, 1)
    //     console.log((await vex.balanceOf(accounts[0])).toString())
    //     console.log((await vex.balanceOf(accounts[1])).toString())
    //     console.log((await gameItem.ownerOf(1)).toString())
    // })
    it("Vex minting", async() => {
        expect(await vex.balanceOf(accounts[0])).to.be.eq.BN(toBNWithDecimals(1000000));
    })
    it("GameItem minting", async() => {
        await gameItem.awardItem(accounts[0], "rock")
        equal(await gameItem.ownerOf(1), accounts[0], "1st token wasn't minted.")
        equal(await gameItem.tokenURI(1), "rock", "Incorrect description.")
    })
    it("Adding token to market", async() => {
        await gameItem.approve(market.address, 1, {from: accounts[0]})
        await market.addTokenToMarket(gameItem.address, 1, await toBNWithDecimals(100))
        equal(await market.getAvailable(gameItem.address, 1), true)
    })
    it("Removing token from market", async() => {
        await market.removeTokenFromMarket(gameItem.address, 1)
        try {
            equal(await market.getAvailable(gameItem.address, 1), false)
        }
        catch (e) {

        }
    })
    it("Buying token using market", async() => {
        await gameItem.awardItem(accounts[1], "description")
        await gameItem.approve(market.address, 2, {from: accounts[1]})
        price = await toBNWithDecimals(100)
        await market.addTokenToMarket(gameItem.address, 2, price)
        await vex.approve(market.address, price, {from: accounts[0]})
        balance0Before = await vex.balanceOf(accounts[0])
        balance1Before = await vex.balanceOf(accounts[1])
        await market.buy(accounts[0], gameItem.address, 2)
        balance0After = await vex.balanceOf(accounts[0])
        balance1After = await vex.balanceOf(accounts[1])
        expect(balance0After).to.be.eq.BN(balance0Before.sub(price))
        expect(balance1After).to.be.eq.BN(balance1Before.add(price))
        equal(await gameItem.ownerOf(2), accounts[0], "Token wasn't transferred.");
        try {
            equal(await market.getAvailable(gameItem.address, 2), false)
        }
        catch (e) {

        }
    })
    it("Add 3 tokens, buy 1, remove 1", async() => {
        await gameItem.awardItem(accounts[3], "item1")
        await gameItem.awardItem(accounts[4], "item2")
        await gameItem.awardItem(accounts[5], "item3")
        await gameItem.approve(market.address, 3, {from: accounts[3]})
        await gameItem.approve(market.address, 4, {from: accounts[4]})
        await gameItem.approve(market.address, 5, {from: accounts[5]})
        price = await toBNWithDecimals(100)
        await market.addTokenToMarket(gameItem.address, 3, price)
        await market.addTokenToMarket(gameItem.address, 4, price)
        await market.addTokenToMarket(gameItem.address, 5, price)
        await vex.approve(market.address, price, {from: accounts[1]}) //Has 100 vex from last test
        balance1Before = await vex.balanceOf(accounts[1])
        balance3Before = await vex.balanceOf(accounts[3])
        balance4Before = await vex.balanceOf(accounts[4])
        balance5Before = await vex.balanceOf(accounts[5])
        await market.buy(accounts[1], gameItem.address, 5)
        await market.removeTokenFromMarket(gameItem.address, 4)
        balance1After = await vex.balanceOf(accounts[1])
        balance3After = await vex.balanceOf(accounts[3])
        balance4After = await vex.balanceOf(accounts[4])
        balance5After = await vex.balanceOf(accounts[5])
        expect(balance1After).to.be.eq.BN(balance1Before.sub(price))
        expect(balance3After).to.be.eq.BN(balance3Before)
        expect(balance4After).to.be.eq.BN(balance4Before)
        expect(balance5After).to.be.eq.BN(balance5Before.add(price))
        equal(await gameItem.ownerOf(3), accounts[3], "Token is missing.");
        equal(await gameItem.ownerOf(4), accounts[4], "Token is missing.");
        equal(await gameItem.ownerOf(5), accounts[1], "Token wasn't transferred.");
        equal(await market.getAvailable(gameItem.address, 3), true)
        try {
            equal(await market.getAvailable(gameItem.address, 4), false)
        }
        catch (e) {

        }
        try {
            equal(await market.getAvailable(gameItem.address, 5), false)
        }
        catch (e) {

        }
    })
    it("Add token without allowing to spend it", async() => {
        await gameItem.awardItem(accounts[0], "item")
        await market.addTokenToMarket(gameItem.address, 6, toBNWithDecimals(1))
    })
    it("Add token with price =< 0", async() => {
        await gameItem.approve(market.address, 6, {from: accounts[0]})
        await market.addTokenToMarket(gameItem.address, 6, toBNWithDecimals(-10))
    })
    it("Remove token twice", async() => {
        await market.addTokenToMarket(gameItem.address, 6, toBNWithDecimals(10))
        await market.removeTokenFromMarket(gameItem.address, 6)
        await market.removeTokenFromMarket(gameItem.address, 6)
    })
    it("Buy without allowing to spend Vex tokens", async() => {
        await market.addTokenToMarket(gameItem.address, 6, toBNWithDecimals(10))
        await market.buy(accounts[5], gameItem.address, 6) // Has 100 vex tokens from last test
    })
    it("Buy without having enough funds", async() => {
        await vex.approve(market.address, toBNWithDecimals(100), {from: accounts[7]})
        await market.buy(accounts[7], gameItem.address, 6)
    })
    it("Buy NFT that isn't in the market", async() => {
        await gameItem.awardItem(accounts[0], "item")
        await vex.approve(market.address, toBNWithDecimals(100), {from: accounts[5]})
        await market.buy(accounts[5], gameItem.address, 7)
    })
})