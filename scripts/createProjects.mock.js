require('dotenv').config()
require('web3')
const colors = require('colors')
const SharedUtils = require('../shared/utils')

// Get all mocked projects.
const mockedProjects = require('../mocks/projects.json')

async function main () {
  // Initialize test utilities class.
  await SharedUtils.init(web3)

  // Get the default transaction parameters.
  this.transactionParameters = SharedUtils.getTransactionParameters()

  // Get a new Crowdfunding SC instance.
  this.crowdfundingInstance = await SharedUtils.createNewCrowdfundingInstance()

  // Create a new Project for each mocked project data.
  for (let i = 0; i < mockedProjects.length; i++) {
    const mockedProject = mockedProjects[i]

    // Send the tx.
    const transactionReceipt = await this.crowdfundingInstance.methods.startProject(
      mockedProject.name,
      mockedProject.description,
      mockedProject.durationInDays,
      mockedProject.amountToRaise,
    ).send({
      ...this.transactionParameters,
      from: (await web3.eth.getAccounts())[i + 1], // from account 1 to 3.
    })

    // Get Project contract schema to retrieve associated instance with address and show it.
    const projectAddress = transactionReceipt.events.ProjectStarted.returnValues.projectAddress

    console.log(`\n${colors.green('Project SC Address')} -> (${colors.magenta(projectAddress)})`)
    console.log(`\n${colors.blue('Name')}: "${colors.yellow(mockedProject.name)}"`)
    console.log(`\n${colors.blue('Description')}: "${colors.yellow(mockedProject.description)}"`)
    console.log(`\n${colors.blue('Duration (days)')}: "${colors.yellow(mockedProject.durationInDays)}"`)
    console.log(`\n${colors.blue('Goal')}: "${colors.yellow(mockedProject.amountToRaise)}"`)
    console.log(`\n${colors.white('-------------------------------------------------------------------')}`)
  }

  return true
}

// Required by `truffle exec`
module.exports = function (callback) {
  return new Promise((resolve, reject) => {
    main()
      .then((value) => resolve(value))
      .catch(err => {
        console.log('Error:', err)
        reject(err)
      })
  })
}
