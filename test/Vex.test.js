// const Vex = artifacts.require("Vex")

// contract("Vex", (accounts) => {
//     before(async () => {
//         vex = await Vex.deployed()
//     })

//     it("1M to owner", async() => {
//         let balance = await vex.balanceOf(accounts[0])
//         balance = web3.utils.fromWei(balance, 'ether')
//         assert.equal(balance, '1000000', "Balance should be 1M for owner")
//     })
//     it("transfer 1000 tokens", async() => {
//         let amount = web3.utils.toWei('1000', 'ether')
//         await vex.transfer(accounts[1], amount, { from: accounts[0] })

//         let balance = await vex.balanceOf(accounts[1])
//         balance = web3.utils.fromWei(balance, 'ether')
//         assert.equal(balance, '1000', "Transfered 1k")
//     })
// })