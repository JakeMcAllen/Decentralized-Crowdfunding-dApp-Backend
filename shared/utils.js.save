require('dotenv').config()
// Import contract JSON compilation data.
const Crowdfunding = require('../build/contracts/Crowdfunding.json')
const Project = require('../build/contracts/Project.json')

// An utility class used to reduce test code duplications and errors.
class SharedUtils {
  /**
     * Initialization of shared object and functionalities for interacting with the Crowdfunding and Project
     * smart contracts. This class can be used either for test and script purposes.
     * @param {Object} web3 web3js library instance (provider from `truffle exec`).
     */
  async init (web3) {
    // Local web3 instance mirror.
    this._web3 = web3

    // Get accounts from current web3 instance.
    this.accounts = await web3.eth.getAccounts()

    // The parameters used when sending a transaction.
    this._transactionParameters = {
      gas: (await web3.eth.getBlock('latest')).gasLimit, // Current median gas limit.
      gasPrice: Number(await web3.eth.net.getNetworkType()), // Current gas price.
      data: '', // Data to sign (default null).
      from: this.accounts[0], // Default account (NB. use only for getters, override when sending txs).
    }

    // Symbolic account roles for testing purposes.
    this._testAccounts = {
      crowdfundingDeployer: this.accounts[0],
      founderProjectA: this.accounts[1],
      founderProjectB: this.accounts[2],
      founderProjectC: this.accounts[3],
      contributor1: this.accounts[4],
      contributor2: this.accounts[5],
      contributor3: this.accounts[6],
      contributor4: this.accounts[7],
      contributor5: this.accounts[8],
      others: this.accounts.slice(9, process.env.ACCOUNT_NUMBER),
    }

    // Smart Contract class instance for Crowdfunding and Project contracts.
    // (NB. these are not SC instances but you can instance one or more SC from these).
    this._crowdfunding = new SmartContract('Crowdfunding', Crowdfunding)
    this._project = new SmartContract('Project', Project)
  }

  /**
    * Deploy a new Crowdfunding Smart Contract on the network.
    * @returns {Object} The Crowdfunding SC instance.
    */
  async createNewCrowdfundingInstance () {
    // Create the JSON interface from ABI.
    const crowdfundingSC = new this._web3.eth.Contract(this._crowdfunding.getABI())

    // Deploy and return the Crowfunding SC instance.
    return await crowdfundingSC.deploy({
      data: this._crowdfunding.getBytecode(),
    }).send({
      ...this._transactionParameters,
      from: this.accounts[0],
    })
  }

  /**
    * Deploy a new Project Smart Contract on the network.
    * @param {string} name Project name.
    * @param {string} description Project description.
    * @param {number} durationInDays Project crowdfunding expiration days.
    * @param {number} amountToRaise Project goal amount in wei.
    * @param {string} founder EOA of the user who start the project.
    * @returns {Object} The Project SC instance.
    */
  async createNewProjectInstance (name, description, durationInDays, amountToRaise, founder) {
    // Create the JSON interface from ABI.
    const projectSC = new this._web3.eth.Contract(this._project.getABI())

    // Deploy and get the Project SC instance.
    return await projectSC.deploy({
      data: this._project.getBytecode(),
      arguments: [name, description, durationInDays, amountToRaise, founder],
    }).send({
      ...this._transactionParameters,
      from: founder,
    })
  }

  /**
    * Return the list of the account addresses.
    * @returns {string[]} Account list.
    */
  getAccounts () {
    return this._accounts
  }

  /**
    * Return the list of the test accounts addresses.
    * @returns {string[]} Test accounts list.
    */
  getTestAccounts () {
    return this._testAccounts
  }

  /**
    * Return the default transaction parameters.
    * @returns {Object} Default transaction parameter.
    */
  getTransactionParameters () {
    return this._transactionParameters
  }

  /**
    * Return the Crowdfunding Smart Contract object.
    * @returns {Object} Crowdfunding SmartContract class object.
    */
  getCrowdfundingContractSchema () {
    return this._crowdfunding
  }

  /**
    * Return the Project Smart Contract object.
    * @returns {Object} Project SmartContract class object.
    */
  getProjectContractSchema () {
    return this._project
  }
}

// A class used to define a set of getters utilities (metadata, istance, and events).
class SmartContract {
  constructor (name, schema) {
    this._name = name
    this._schema = schema
    // Get ABI and Bytecode from JSON schema.
    this._abi = schema.abi
    this._bytecode = schema.bytecode
  }

  /**
    * Return the Smart Contract ABI object.
    * @returns {Object} Smart Contract ABI object.
    */
  getABI () {
    return this._abi
  }

  /**
    * Return the Smart Contract Bytecode string.
    * @returns {string} Smart Contract Bytecode string.
    */
  getBytecode () {
    return this._bytecode
  }

  /**
    * Return a Smart Contract instance given its address.
    * @param contractAddress Smart Contract address.
    * @returns {Contract} Smart Contract instance.
    */
  getInstance (contractAddress) {
    return new web3.eth.Contract(this._schema, contractAddress)
  }

  /**
    * Return event arguments.
    * @param transactionHash The transaction where the event has been emitted.
    * @param eventName The event name
    * @returns {Promise<Object>} A Promise with a list of event objects.
    */
  async getEventArguments (transactionHash, eventName) {
    // Get all transaction logs.
    const { logs } = await this._web3.eth.getTransactionReceipt(transactionHash)

    // Get the event ABI.
    const eventABI = this._artifact.options.jsonInterface.filter(x => x.type === 'event' && x.name === eventName)[0]

    // The first topic will equal the hash of the event signature.
    const eventSignature = `${eventName}(${eventABI.inputs.map(input => input.type).join(',')})`
    const eventTopic = this._web3.utils.sha3(eventSignature)

    // Only decode events of type 'eventName'.
    const log = logs.find(log => log.topics.length > 0 && log.topics[0] === eventTopic)

    // Decode found log.
    return this._web3.eth.abi.decodeLog(eventABI.inputs, log.data, log.topics.slice(1))
  }
}

module.exports = new SharedUtils()
