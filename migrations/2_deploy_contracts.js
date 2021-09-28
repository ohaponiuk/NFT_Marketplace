// const bigDecimal = require('js-big-decimal');
// const web3 = require("web3");
function toBN(number) {
    return web3.utils.toBN(number);
}

const gameItem = artifacts.require("GameItem")
const vex = artifacts.require("Vex")
const market = artifacts.require("Market")

module.exports = async function (deployer) {
    await deployer.deploy(gameItem)
    await deployer.deploy(vex, toBN(1_000_000))
    await deployer.deploy(market, vex.address)
}