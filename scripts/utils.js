require('dotenv').config()
// Import contract JSON compilation data.
const Crowdfunding = require('../build/contracts/Crowdfunding.json')
const Project = require('../build/contracts/Project.json')

// An utility class used to reduce test code duplications and errors.
class ProvaUtils {
    async init (web3) {
        // Gather the accounts from the wallet provider.
        const accounts = await web3.eth.getAccounts()

        this._web3 = web3
        
        // Assign symbolic roles to the accounts that will be used with
        // specific purposes during tests.
        this._accounts = {
            crowdfundingDeployer: accounts[0],
            founderProjectA: accounts[1],
            founderProjectB: accounts[2],
            founderProjectC: accounts[3],
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
        this._crowdfunding = new SmartContract('Crowdfunding', Crowdfunding)
        this._project = new SmartContract('Project', Project)
    }
    
    /**
    * Create and return a new Crowdfunding SC instance.
    * @returns {string}
    */
    async createNewCrowdfundingInstance () {
        // Create the Crowdfunding smart contract to deploy.
        const crowdfundingSC = new this._web3.eth.Contract(this._crowdfunding.getABI())
        
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
    * @param {string} founder EOA of the user who start the project.
    * @returns {string}
    */
    async createNewProjectInstance (name, description, durationInDays, amountToRaise, founder) {
        // Create the Project smart contract to deploy.
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
    * Return a list account addresses.
    * @returns {string[]}
    */
    getAccounts () {
        return this._accounts
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
    
    getProjectContractSchema() {
        return this._project
    }
}

// An utility class for Smart Contract name, artifact and events argument definition.
class SmartContract {
    constructor (name, schema) {
        this._name = name
        this._schema = schema
        this._abi = schema.abi
        this._bytecode = schema.bytecode
    }
    
    getABI () {
        return this._abi
    }
    
    getBytecode () {
        return this._bytecode
    }
    
    /**
    * Return a contract instance.
    * @param contractAddress
    * @returns {Contract}
    */
    getInstance (contractAddress) {
        console.log(contractAddress)
        return new web3.eth.Contract(this._schema, contractAddress)
    }
    
    /**
    * Return event arguments.
    * @param transactionHash
    * @param eventName
    * @returns {Promise<Object>}
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

module.exports = new ProvaUtils()
