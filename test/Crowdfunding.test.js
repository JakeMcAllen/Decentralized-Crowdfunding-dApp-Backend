require('dotenv').config()
require('web3')
// Import our utilities.
const SharedUtils = require('../shared/utils')
// Import Chai expect interface.
const { expect } = require('chai')

// Crowdfunding contract tests.
contract('Crowdfunding', () => {
  before(async function () {
    // Initialize utilities class.
    await SharedUtils.init(web3)

    // Get the default transaction parameters.
    this.transactionParameters = SharedUtils.getTransactionParameters()

    // Get a new Crowdfunding SC instance.
    this.crowdfundingInstance = await SharedUtils.createNewCrowdfundingInstance()
  })

  describe('# Initialization', function () {
    it('[1] Should return an empty array of projects', async function () {
      const expectedEmptyArray = await this.crowdfundingInstance.methods.getAllProjects().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      expect(expectedEmptyArray).to.be.empty
    })
  })

  describe('# Projects ', function () {
    it('[2] Should start the crowdfunding for a new project', async function () {
      // Set project data.
      const name = 'Project A'
      const description = 'Not a so useful project'
      const durationInDays = 7
      const amountToRaise = 1000000

      // Starts the Project SC.
      const transactionReceipt = await this.crowdfundingInstance.methods.startProject(
        name,
        description,
        durationInDays,
        amountToRaise,
      ).send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().founderProjectA,
      })

      // Check Project SC instance.
      const projectAddress = transactionReceipt.events.ProjectStarted.returnValues.projectAddress
      const expectedProjectsArray = await this.crowdfundingInstance.methods.getAllProjects().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Checks.
      expect(expectedProjectsArray.length).to.be.equal(1)
      expect(expectedProjectsArray[0]).to.be.equal(projectAddress)
    })
  })
})
