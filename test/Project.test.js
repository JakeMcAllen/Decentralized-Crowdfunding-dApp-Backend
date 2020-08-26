require('dotenv').config()
const Web3 = require('web3')
// Import Open Zeppelin test utils.
const { expectRevert, constants } = require('@openzeppelin/test-helpers')
// Import our test utilities.
const testUtils = require('./utils')
// Import Chai should interface.
const { expect, should } = require('chai')

// Project contract tests.
contract('Project', (accounts) => {
  const name = 'Project A'
  const description = 'Not so interesting!'
  const deadline = Date.now()
  const amountGoal = 100000
  let starter = ''

  before(async function () {
    // Initialize test utilities class.
    await testUtils.init()

    // Get the default transaction parameters.
    this.transactionParameters = testUtils.getTransactionParameters()

    // Get a new Crowdfunding SC instance.
    this.crowdfundingInstance = await testUtils.createNewCrowdfundingInstance()

    // Set the project starter.
    starter = testUtils._accounts.starterProjectA
    // Get a new Project SC instance.
    this.projectInstance = await testUtils.createNewProjectInstance(
      name,
      description,
      deadline,
      amountGoal,
      starter,
    )
  })

  describe('# Initialization', function () {
    it('[1] Should match the project name', async function () {
      const expectedProjectName = await this.projectInstance.methods.name().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      expect(expectedProjectName).to.be.equal(name)
    })

    it('[2] Should match the project description', async function () {
      const expectedProjectDescription = await this.projectInstance.methods.description().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      expect(expectedProjectDescription).to.be.equal(description)
    })

    it('[3] Should match the project deadline', async function () {
      const expectedProjectDeadline = await this.projectInstance.methods.deadline().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      expect(Number(expectedProjectDeadline)).to.be.equal(deadline)
    })

    it('[4] Should match the project amount goal', async function () {
      const expectedAmountGoal = await this.projectInstance.methods.amountGoal().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      expect(Number(expectedAmountGoal)).to.be.equal(amountGoal)
    })

    it('[5] Should have zero value for completion time', async function () {
      const expectedZeroCompleteAt = await this.projectInstance.methods.completeAt().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      expect(Number(expectedZeroCompleteAt)).to.be.equal(0)
    })

    it('[6] Should have zero raised funds', async function () {
      const expectedZeroRaisedFunds = await this.projectInstance.methods.raisedFunds().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      expect(Number(expectedZeroRaisedFunds)).to.be.equal(0)
    })

    it('[7] Should match the address of the starter', async function () {
      const expectedStarter = await this.projectInstance.methods.starter().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      expect(expectedStarter).to.be.equal(starter)
    })

    it('[8] Should have the fundraising status', async function () {
      const expectedStatus = await this.projectInstance.methods.status().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      expect(Number(expectedStatus)).to.be.equal(0)
    })
  })

  describe('# Contributions ', function () {
    const weiContributionA = 1000
    const weiContributionB = 100
    let raisedFunds = 0

    it('[9] Should be possible to contribute to the project', async function () {
      // Send tx.
      const transactionReceipt = await this.projectInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: testUtils._accounts.contributor1,
        value: weiContributionA,
      })

      // Check contribution from user.
      const contributor = transactionReceipt.events.FundingReceived.returnValues.contributor
      const expectedContribution = await this.projectInstance.methods.contributions(contributor).call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      // Check raised funds from user.
      const currentRaisedFunds = transactionReceipt.events.FundingReceived.returnValues.currentRaisedFunds
      const expectedRaisedFunds = await this.projectInstance.methods.raisedFunds().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      // Check project status.
      const expectedFundraisingStatus = await this.projectInstance.methods.status().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      // Update local variables.
      raisedFunds = Number(currentRaisedFunds)

      // Checks.
      expect(contributor).to.be.equal(testUtils._accounts.contributor1)
      expect(Number(expectedContribution)).to.be.equal(weiContributionA)
      expect(Number(expectedRaisedFunds)).to.be.equal(Number(currentRaisedFunds))
      expect(Number(expectedFundraisingStatus)).to.be.equal(0)
    })

    it('[10] Shouldn\'t be possible to contribute with a zero value', async function () {
      const transaction = this.projectInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: testUtils._accounts.contributor1,
        value: 0,
      })

      await expectRevert(transaction, 'zero-contribution')
    })

    it('[11] Shouldn\'t be possible for the starter to contribute to its project', async function () {
      const transaction = this.projectInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: testUtils._accounts.starterProjectA,
        value: 100,
      })

      await expectRevert(transaction, 'contribution-from-starter')
    })

    it('[12] Should be possible for a contributor to send another contribution to the same project', async function () {
      // Send tx.
      const transactionReceipt = await this.projectInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: testUtils._accounts.contributor1,
        value: weiContributionA * 2,
      })

      // Check contribution from user.
      const contributor = transactionReceipt.events.FundingReceived.returnValues.contributor
      const expectedContribution = await this.projectInstance.methods.contributions(contributor).call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      // Check raised funds from user.
      const currentRaisedFunds = transactionReceipt.events.FundingReceived.returnValues.currentRaisedFunds
      const expectedRaisedFunds = await this.projectInstance.methods.raisedFunds().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      // Check project status.
      const expectedFundraisingStatus = await this.projectInstance.methods.status().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      // Update local variables.
      raisedFunds = Number(currentRaisedFunds)

      // Checks.
      expect(contributor).to.be.equal(testUtils._accounts.contributor1)
      expect(Number(expectedContribution)).to.be.equal(weiContributionA * 3)
      expect(Number(expectedRaisedFunds)).to.be.equal(raisedFunds)
      expect(Number(expectedFundraisingStatus)).to.be.equal(0)
    })

    it('[13] Should be possible for another contributor to send a contribution to a project', async function () {
    // Send tx.
      const transactionReceipt = await this.projectInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: testUtils._accounts.contributor2,
        value: weiContributionB,
      })

      // Check contribution from user.
      const contributor = transactionReceipt.events.FundingReceived.returnValues.contributor
      const expectedContribution = await this.projectInstance.methods.contributions(contributor).call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      // Check raised funds from user.
      const currentRaisedFunds = transactionReceipt.events.FundingReceived.returnValues.currentRaisedFunds
      const expectedRaisedFunds = await this.projectInstance.methods.raisedFunds().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      // Check project status.
      const expectedFundraisingStatus = await this.projectInstance.methods.status().call({
        from: testUtils._accounts.crowdfundingDeployer,
      })

      // Update local variables.
      raisedFunds = Number(currentRaisedFunds)

      // Checks.
      expect(contributor).to.be.equal(testUtils._accounts.contributor2)
      expect(Number(expectedContribution)).to.be.equal(weiContributionB)
      expect(Number(expectedRaisedFunds)).to.be.equal(raisedFunds)
      expect(Number(expectedFundraisingStatus)).to.be.equal(0)
    })
  })
})
