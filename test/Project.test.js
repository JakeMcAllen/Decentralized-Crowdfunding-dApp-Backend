require('dotenv').config()
require('web3')
// Import Open Zeppelin test utils.
const { expectRevert } = require('@openzeppelin/test-helpers')
// Import our utilities.
const SharedUtils = require('../shared/utils')
// Import Chai expect interface.
const { expect } = require('chai')

// Project contract tests.
contract('Project', (accounts) => {
  const name = 'Project A'
  const description = 'Not so interesting!'
  const deadline = Date.now()
  const amountGoal = 100000
  let founderA = ''

  before(async function () {
    // Initialize utilities class.
    await SharedUtils.init(web3)

    // Initialize Big Numbers (BN) for wei math operations.
    this.BN = web3.utils.BN

    // Get the default transaction parameters.
    this.transactionParameters = SharedUtils.getTransactionParameters()

    // Get a new Crowdfunding SC instance.
    this.crowdfundingInstance = await SharedUtils.createNewCrowdfundingInstance()

    // Set the project founder.
    founderA = SharedUtils.getTestAccounts().founderProjectA
    // Get a new Project SC instance.
    this.projectAInstance = await SharedUtils.createNewProjectInstance(
      name,
      description,
      deadline,
      amountGoal,
      founderA,
    )
  })

  describe('# Initialization', function () {
    it('[1] Should match the project name', async function () {
      const expectedProjectName = await this.projectAInstance.methods.name().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      expect(expectedProjectName).to.be.equal(name)
    })

    it('[2] Should match the project description', async function () {
      const expectedProjectDescription = await this.projectAInstance.methods.description().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      expect(expectedProjectDescription).to.be.equal(description)
    })

    it('[3] Should match the project deadline', async function () {
      const expectedProjectDeadline = await this.projectAInstance.methods.deadline().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      expect(Number(expectedProjectDeadline)).to.be.equal(deadline)
    })

    it('[4] Should match the project amount goal', async function () {
      const expectedAmountGoal = await this.projectAInstance.methods.amountGoal().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      expect(Number(expectedAmountGoal)).to.be.equal(amountGoal)
    })

    it('[5] Should have zero value for completion time', async function () {
      const expectedZeroCompleteAt = await this.projectAInstance.methods.completeAt().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      expect(Number(expectedZeroCompleteAt)).to.be.equal(0)
    })

    it('[6] Should have zero raised funds', async function () {
      const expectedZeroRaisedFunds = await this.projectAInstance.methods.raisedFunds().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      expect(Number(expectedZeroRaisedFunds)).to.be.equal(0)
    })

    it('[7] Should match the address of the founder', async function () {
      const expectedFounder = await this.projectAInstance.methods.founder().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      expect(expectedFounder).to.be.equal(founderA)
    })

    it('[8] Should have the fundraising status', async function () {
      const expectedStatus = await this.projectAInstance.methods.status().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      expect(Number(expectedStatus)).to.be.equal(0)
    })
  })

  describe('# Fundraising ', function () {
    const weiContributionA = 1000
    const weiContributionB = 100
    let raisedFunds = 0

    it('[9] Should be possible to contribute to the project', async function () {
      // Send tx.
      const transactionReceipt = await this.projectAInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor1,
        value: weiContributionA,
      })

      // Check contribution from user.
      const contributor = transactionReceipt.events.FundingReceived.returnValues.contributor
      const expectedContribution = await this.projectAInstance.methods.contributions(contributor).call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check raised funds from user.
      const currentRaisedFunds = transactionReceipt.events.FundingReceived.returnValues.currentRaisedFunds
      const expectedRaisedFunds = await this.projectAInstance.methods.raisedFunds().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check project status.
      const expectedFundraisingStatus = await this.projectAInstance.methods.status().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Update local variables.
      raisedFunds = Number(currentRaisedFunds)

      // Checks.
      expect(contributor).to.be.equal(SharedUtils.getTestAccounts().contributor1)
      expect(Number(expectedContribution)).to.be.equal(weiContributionA)
      expect(Number(expectedRaisedFunds)).to.be.equal(Number(currentRaisedFunds))
      expect(Number(expectedFundraisingStatus)).to.be.equal(0)
    })

    it('[10] Shouldn\'t be possible to contribute with a zero value', async function () {
      const transaction = this.projectAInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor1,
        value: 0,
      })

      await expectRevert(transaction, 'zero-contribution')
    })

    it('[11] Shouldn\'t be possible for the founder to contribute to its project', async function () {
      const transaction = this.projectAInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().founderProjectA,
        value: 100,
      })

      await expectRevert(transaction, 'contribution-from-founder')
    })

    it('[12] Should be possible for a contributor to send another contribution to the same project', async function () {
      // Send tx.
      const transactionReceipt = await this.projectAInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor1,
        value: weiContributionA * 2,
      })

      // Check contribution from user.
      const contributor = transactionReceipt.events.FundingReceived.returnValues.contributor
      const expectedContribution = await this.projectAInstance.methods.contributions(contributor).call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check raised funds from user.
      const currentRaisedFunds = transactionReceipt.events.FundingReceived.returnValues.currentRaisedFunds
      const expectedRaisedFunds = await this.projectAInstance.methods.raisedFunds().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check project status.
      const expectedFundraisingStatus = await this.projectAInstance.methods.status().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Update local variables.
      raisedFunds = Number(currentRaisedFunds)

      // Checks.
      expect(contributor).to.be.equal(SharedUtils.getTestAccounts().contributor1)
      expect(Number(expectedContribution)).to.be.equal(weiContributionA * 3)
      expect(Number(expectedRaisedFunds)).to.be.equal(raisedFunds)
      expect(Number(expectedFundraisingStatus)).to.be.equal(0)
    })

    it('[13] Should be possible for another contributor to send a contribution to a project', async function () {
    // Send tx.
      const transactionReceipt = await this.projectAInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor2,
        value: weiContributionB,
      })

      // Check contribution from user.
      const contributor = transactionReceipt.events.FundingReceived.returnValues.contributor
      const expectedContribution = await this.projectAInstance.methods.contributions(contributor).call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check raised funds from user.
      const currentRaisedFunds = transactionReceipt.events.FundingReceived.returnValues.currentRaisedFunds
      const expectedRaisedFunds = await this.projectAInstance.methods.raisedFunds().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check project status.
      const expectedFundraisingStatus = await this.projectAInstance.methods.status().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Update local variables.
      raisedFunds = Number(currentRaisedFunds)

      // Checks.
      expect(contributor).to.be.equal(SharedUtils.getTestAccounts().contributor2)
      expect(Number(expectedContribution)).to.be.equal(weiContributionB)
      expect(Number(expectedRaisedFunds)).to.be.equal(raisedFunds)
      expect(Number(expectedFundraisingStatus)).to.be.equal(0)
    })

    it('[14] Shouldn\'t be possible for a contributor to get a refund when project has fundraising status', async function () {
      const transaction = this.projectAInstance.methods.refundMe().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor1,
      })

      await expectRevert(transaction, 'no-expired-status')
    })
  })

  describe('# Successful ', function () {
    const goalContribute = 100000
    let founderBalance = 0

    before(async function () {
      founderBalance = await web3.eth.getBalance(founderA)
    })

    it('[15] Should be successful after reaching the goal amount before the deadline', async function () {
      // Send tx.
      const transactionReceipt = await this.projectAInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor3,
        value: goalContribute,
      })

      // Check contribution from user.
      const contributor = transactionReceipt.events.FundingReceived.returnValues.contributor
      const expectedContribution = await this.projectAInstance.methods.contributions(contributor).call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check raised funds from user.
      const currentRaisedFunds = transactionReceipt.events.FundingReceived.returnValues.currentRaisedFunds
      const expectedZeroRaisedFunds = await this.projectAInstance.methods.raisedFunds().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check project status.
      const expectedSuccessfulStatus = await this.projectAInstance.methods.status().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check founder balance.
      const founderPaid = transactionReceipt.events.FounderPaid.returnValues.founder
      const founderPaidBalance = await web3.eth.getBalance(founderPaid)

      // Checks.
      expect(contributor).to.be.equal(SharedUtils.getTestAccounts().contributor3)
      expect(Number(expectedContribution)).to.be.equal(goalContribute)
      expect(Number(expectedZeroRaisedFunds)).to.be.equal(0)
      expect(Number(expectedSuccessfulStatus)).to.be.equal(1)
      expect(new this.BN(founderPaidBalance).toString()).to.be.equal(new this.BN(founderBalance).add(new this.BN(currentRaisedFunds)).toString())
    })

    it('[16] Shouldn\'t be possible for a contributor to get a refund when project has succesful status', async function () {
      const transaction = this.projectAInstance.methods.refundMe().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor3,
      })

      await expectRevert(transaction, 'no-expired-status')
    })
  })

  describe('# Expired ', function () {
    const weiContributionB2 = 10000
    let founderB = ''
    let founderBBalance = 0

    before(async function () {
      founderB = SharedUtils.getTestAccounts().founderProjectB

      // Create a new Project.
      this.projectBInstance = await SharedUtils.createNewProjectInstance(
        'Project B',
        'Nobody fund me',
        1577836800, // 01/01/20
        amountGoal,
        founderB,
      )

      founderBBalance = await web3.eth.getBalance(founderB)
    })

    it('[17] Should be expired after reaching the deadline without raising the goal amount', async function () {
      // Send tx.
      const transactionReceipt = await this.projectBInstance.methods.contribute().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor4,
        value: weiContributionB2,
      })

      // Check contribution from user.
      const contributor = transactionReceipt.events.FundingReceived.returnValues.contributor
      const expectedContribution = await this.projectBInstance.methods.contributions(contributor).call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check raised funds from user.
      const currentRaisedFunds = transactionReceipt.events.FundingReceived.returnValues.currentRaisedFunds
      const expectedRaisedFunds = await this.projectBInstance.methods.raisedFunds().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check project status.
      const expectedExpiredStatus = await this.projectBInstance.methods.status().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check founder balance.
      const founderNotPaidBalance = await web3.eth.getBalance(founderB)

      // Checks.
      expect(contributor).to.be.equal(SharedUtils.getTestAccounts().contributor4)
      expect(Number(expectedContribution)).to.be.equal(weiContributionB2)
      expect(Number(expectedRaisedFunds)).to.be.equal(Number(currentRaisedFunds))
      expect(Number(expectedExpiredStatus)).to.be.equal(2)
      expect(new this.BN(founderNotPaidBalance).toString()).to.be.equal(new this.BN(founderBBalance).toString())
    })

    it('[18] Should be possible for a contributor to get a refund when project expired', async function () {
      // Send tx.
      const transactionReceipt = await this.projectBInstance.methods.refundMe().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor4,
      })

      // Check contribution refunded.
      const contributorRefunded = transactionReceipt.events.ContributorRefunded.returnValues.contributor
      const expectedZeroContribution = await this.projectBInstance.methods.contributions(contributorRefunded).call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check raised funds.
      const expectedZeroRaisedFunds = await this.projectBInstance.methods.raisedFunds().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Check project status.
      const expectedExpiredStatus = await this.projectBInstance.methods.status().call({
        from: SharedUtils.getTestAccounts().crowdfundingDeployer,
      })

      // Checks.
      expect(contributorRefunded).to.be.equal(SharedUtils.getTestAccounts().contributor4)
      expect(Number(expectedZeroContribution)).to.be.equal(0)
      expect(Number(expectedZeroRaisedFunds)).to.be.equal(0)
      expect(Number(expectedExpiredStatus)).to.be.equal(2)
    })

    it('[19] Shouldn\'t be possible for a non contributor to get a refund', async function () {
      const transaction = this.projectBInstance.methods.refundMe().send({
        ...this.transactionParameters,
        from: SharedUtils.getTestAccounts().contributor5,
      })

      await expectRevert(transaction, 'no-contribution')
    })
  })
})
