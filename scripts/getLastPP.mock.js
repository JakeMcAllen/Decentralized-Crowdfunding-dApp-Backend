require('dotenv').config()
require('web3')
const colors = require('colors')
const SharedUtils = require('../shared/utils')

// Get all mocked projects.
const mockedProjects = require('../mocks/projects.json')


async function getLastPP() {

	// Initialize test utilities class.
  	await SharedUtils.init(web3)
  	this.transactionParameters = SharedUtils.getTransactionParameters()
  	this.criptovalInstance = await SharedUtils.createNewCrowdfundingInstance()

  	const trsct2 = await this.criptovalInstance.methods.getLastPP()
  	.send({
    		...this.transactionParameters,
    		from: (await web3.eth.getAccounts())[0],
  	})

  	const trsct2Address = trsct2.events.pricePrediction.returnValues

  	console.log(`\n${colors.green('User')} -> (${colors.magenta( (await web3.eth.getAccounts())[0] )})`)
	console.log(`\n${colors.green('Data get from blockchain')} -> (${colors.magenta( trsct2Address.pp )})`)


	return true
}



module.exports = function (callback) {
  return new Promise((resolve, reject) => {
    getLastPP()
      .then((value) => resolve(value))
      .catch(err => {
        console.log('Error:', err)
        reject(err)
      })
  })
}
