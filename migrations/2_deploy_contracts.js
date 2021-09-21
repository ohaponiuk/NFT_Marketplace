const gameItem = artifacts.require("GameItem")
const vex = artifacts.require("Vex")
const market = artifacts.require("Market")

module.exports = async function (deployer) {
    await deployer.deploy(gameItem)
    await deployer.deploy(vex, 1_000_000)
    await deployer.deploy(market, vex.address)
}