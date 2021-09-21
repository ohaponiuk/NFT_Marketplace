const GameItem = artifacts.require("GameItem")
const Vex = artifacts.require("Vex")
const Market = artifacts.require("Market")

contract("Market", (accounts) => {
    before(async() => {
        gameItem = await GameItem.deployed()
        vex = await Vex.deployed()
        market = await Market.deployed()
    })
    it("Using a marketplace", async() => {
        var amount = web3.utils.toBN(100).mul(web3.utils.toBN(10).pow(web3.utils.toBN(await vex.decimals())))
        await vex.approve(market.address, amount, {from: accounts[0]})
        await gameItem.awardItem(accounts[1], "rock")
        await gameItem.approve(market.address, 1, {from: accounts[1]})
        await market.addTokenToMarket(gameItem.address, 1, amount)
        await market.buy(accounts[0], gameItem.address, 1)
        console.log((await vex.balanceOf(accounts[0])).toString())
        console.log((await vex.balanceOf(accounts[1])).toString())
        console.log((await gameItem.ownerOf(1)).toString())
    })
})