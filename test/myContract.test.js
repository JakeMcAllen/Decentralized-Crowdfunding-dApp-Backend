require('dotenv').config()
require('web3')
// Import our utilities.
const SharedUtils = require('../shared/utils')
// Import Chai expect interface.
const { expect } = require('chai')

contract('MyContract', () => {
    before(async function () {
        // Initialize utilities class.
        await SharedUtils.init(web3)
        
        // Get the default transaction parameters.
        this.transactionParameters = SharedUtils.getTransactionParameters()
    })
    describe('# Phase / Chronological Step', function () {
        it('[1] Should test something from your contract!', async function () {
            // Example.
            // const myValue = 10
            // const expectedValue = await myContract.methods.getValue().call({
            //                          from: SharedUtils.getAccounts()[0],
            //                       })
            // expect(expectedValue).to.be.equal(myValue)
        })
    })
})
