require('dotenv').config()
const Web3 = require('web3')
// Import contract JSON compilation data.
const Crowdfunding = require('../build/contracts/Crowdfunding.json')
const Project = require('../build/contracts/Project.json')

// An utility class used to reduce test code duplications and errors.
class TestUtils {
  async init () {
    // Init web3 instance.
    this.initWeb3()

    // Gather the accounts from the wallet provider.
    const accounts = await web3.eth.getAccounts()

    // Assign symbolic roles to the accounts that will be used with
    // specific purposes during tests.
    this._accounts = {
      crowdfundingDeployer: accounts[0],
      starterProjectA: accounts[1],
      starterProjectB: accounts[2],
      starterProjectC: accounts[3],
      contributor1: accounts[4],
      contributor2: accounts[5],
      contributor3: accounts[6],
      contributor4: accounts[7],
      contributor5: accounts[8],
      others: accounts.slice(9, process.env.ACCOUNT_NUMBER),
    }

    // An object that contains the transaction parameters. Useful to reduce duplication of
    // code when sending a transaction.
    this._transactionParameters = {
      gas: (await web3.eth.getBlock('latest')).gasLimit, // Current gas limit.
      gasPrice: await web3.eth.getGasPrice(), // Current gas price.
      data: '', // Data to sign.
      from: accounts[0], // Default account (NB. use only for getters, override when sending txs).
    }

    // Set an instance of helper Contract class for Crowdfunding and Project SCs.
    this._crowdfunding = new SmartContract('Crowdfunding', Crowdfunding.abi, Crowdfunding.bytecode)
    this._project = new SmartContract('Project', Project.abi, Project.bytecode)
  }

  initWeb3 () {
    // A web3 provider comes from truffle.
    // Through `truffle exec` command we execute this function using that web3 provider.
    // NB. The web3 provider comes from --network parameter specified (development or testnet).
    if (!web3) {
      throw Error('Something went wrong with the web3 provider. Did you have run the command using truffle test?')
    }

    // Initialize Web3 instance with the truffle provider.
    new Web3(web3.currentProvider)
  }

  /**
  * Create and return a new Crowdfunding SC instance.
  * @returns {string}
  */
  async createNewCrowdfundingInstance () {
    // Create the Crowdfunding smart contract to deploy.
    const crowdfundingSC = new web3.eth.Contract(this._crowdfunding.getABI())

    // Deploy and get the Crowfunding SC instance.
    return await crowdfundingSC.deploy({ data: this._crowdfunding.getBytecode() }).send({
      ...this._transactionParameters,
      from: this._accounts.crowdfundingDeployer,
    })
  }

  /**
  * Create and return a new Project SC instance.
  * @param {string} name Project name.
  * @param {string} description Project description.
  * @param {number} durationInDays Project crowdfunding expiration days.
  * @param {number} amountToRaise Project goal amount in wei.
  * @param {string} starter EOA of the user who start the project.
  * @returns {string}
  */
  async createNewProjectInstance (name, description, durationInDays, amountToRaise, starter) {
    // Create the Project smart contract to deploy.
    const projectSC = new web3.eth.Contract(this._project.getABI())

    // Deploy and get the Project SC instance.
    return await projectSC.deploy({
      data: this._project.getBytecode(),
      arguments: [name, description, durationInDays, amountToRaise, starter],
    }).send({
      ...this._transactionParameters,
      from: starter,
    })
  }

  /**
  * Return a list of N others account addresses.
  * @param numberOfOthersAccounts
  * @returns {string[]}
  */
  getOthersAccounts (numberOfOthersAccounts) {
    return this._accounts.others.splice(0, numberOfOthersAccounts)
  }

  /**
  * Return the default transaction parameters.
  * @returns {Object}
  */
  getTransactionParameters () {
    return this._transactionParameters
  }
}

// An utility class for Smart Contract name, artifact and events argument definition.
class SmartContract {
  constructor (name, abi, bytecode) {
    this._name = name
    this._abi = abi
    this._bytecode = bytecode
    this._artifact = artifacts.require(this._name)
  }

  getABI () {
    return this._abi
  }

  getBytecode () {
    return this._bytecode
  }

  /**
  * Return the contract artifact.
  * @returns {Contract}
  */
  getArtifact () {
    return this._artifact
  }

  /**
  * Return a contract instance.
  * @param contractAddress
  * @returns {Contract}
  */
  getInstance (contractAddress) {
    return this._artifact.at(contractAddress)
  }

  /**
  * Return event arguments.
  * @param transactionHash
  * @param eventName
  * @returns {Promise<Object>}
  */
  async getEventArguments (transactionHash, eventName) {
    // Get all transaction logs.
    const { logs } = await web3.eth.getTransactionReceipt(transactionHash)

    // Get the event ABI.
    const eventABI = this._artifact.options.jsonInterface.filter(x => x.type === 'event' && x.name === eventName)[0]

    // The first topic will equal the hash of the event signature.
    const eventSignature = `${eventName}(${eventABI.inputs.map(input => input.type).join(',')})`
    const eventTopic = web3.utils.sha3(eventSignature)

    // Only decode events of type 'eventName'.
    const log = logs.find(log => log.topics.length > 0 && log.topics[0] === eventTopic)

    // Decode found log.
    return web3.eth.abi.decodeLog(eventABI.inputs, log.data, log.topics.slice(1))
  }
}

module.exports = new TestUtils()
