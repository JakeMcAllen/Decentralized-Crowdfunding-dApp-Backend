require('dotenv').config()
require('web3')
const colors = require('colors')
const SharedUtils = require('../shared/utils')

// Get all mocked projects.
const mockedProjects = require('../mocks/projects.json')


async function addPrice (val) {

  // Initialize test utilities class.
  await SharedUtils.init(web3)
  this.transactionParameters = SharedUtils.getTransactionParameters()
  this.crowdfundingInstance = await SharedUtils.createNewCrowdfundingInstance()


  const trsct1 = await this.crowdfundingInstance.methods.addPrice(
    	"eurusd", 
    	val
  ).send({
  	...this.transactionParameters,
  	from: (await web3.eth.getAccounts())[0],
  })
        
  const trsct1Address = trsct1.events.ppT.returnValues

  console.log('val: ' + val);
  console.log(`${colors.green('Data get from blockchain')} -> (${colors.magenta(trsct1Address)})`)
  console.log(`${colors.green('Data get from blockchain')} -> (${colors.magenta(trsct1Address.cross)})`)
  console.log(`${colors.green('Data get from blockchain')} -> (${colors.magenta(trsct1Address.pp)})`)
  console.log(`${colors.white('-------------------------------------------------------------------')}\n`)

  console.log(`\n${colors.green('Data get from blockchain')} -> (${colors.magenta( (await web3.eth.getAccounts())[0] )})\n`)

  console.log('val: ' + val);
  return true;
}



// Required by `truffle exec`
module.exports = function (callback) {
  return new Promise((resolve, reject) => {
    addPrice(11)
    .then((value) => resolve(value))
    .catch(err => {
        console.log('Error:', err)
        reject(err)
    })
  })
}
