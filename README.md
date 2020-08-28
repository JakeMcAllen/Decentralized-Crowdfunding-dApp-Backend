# A Simple Decentralized Crowdfunding dApp Backend
To demonstrate one of the boilerplate's possible usage, I developed a simple set of smart contracts that implements a small subset of the business logic for a real-world decentralized crowdfunding application. 

## Introduction
You might have already heard of Kickstarter, a well-known crowdfunding platform. This example is a simplified and similar version of it, managing the decentralized crowdfunding business logic using the Ethereum Smart Contract, implementing the following functionalities:

* **Start Project**: Everyone with an Ethereum Externally Owned Account (**EOA**) can start a new *Crowdfunding* project, along with setting its details like goal amount, deadline, etc. It will create a new *Project* smart contract on the blockchain.
* **View Projects**: Everyone can retrieve the project smart contracts addresses and read the projects' details.
* **Fund Project**: Everyone with an Ethereum EOA can fund an existing project with some *Ether*.
* **Retrieve Funds**: If a project reaches the deadline without matching the fixed and desired goal amount, contributors should retrieve their contributed funds in an *All-or-Nothing* setup.

The Smart Contracts are designed to guarantee trust for the operations involving transfers of *Ether* (e.g., when funding a project, when refunding a contributor) and time constraints (e.g., a contributor can be refunded if the goal amount isn't reached and the project has passed the deadline).

**Crowdfunding dApp idea references**: 
* [Creating a Simple Crowdfunding DApp with Ethereum Solidity and Vuejs - by Sam Benemerito](https://medium.com/openberry/creating-a-simple-crowdfunding-dapp-with-ethereum-solidity-and-vue-js-69ddb8e132dd)
* [Crowdfund dApp - by tyndallm](https://github.com/tyndallm/crowdfund-dapp)

## Getting Started

### Prerequisities
You need to have the following installed:

* [git](https://git-scm.com/downloads) >= *2.21.0*
* [node](https://nodejs.org/en/download/) >= *10.15.3*
* [npm](https://www.npmjs.com/get-npm) >= *6.14.8*

### Initialization
Clone the repository:

```bash
git clone https://github.com/Innovation-Advisory-Links-Foundation/Ethereum-Backend-Boilerplate.git
cd Ethereum-Backend-Boilerplate
```

Move to `example` branch and install packages:
```bash
git checkout example
npm install
```

Make a copy of the `.env.default` file and rename it `.env`. The new file will contain the following data:

```bash
DEV_HOST=localhost
DEV_PORT=8545
ACCOUNT_NUMBER=20
DEV_MNEMONIC="YOUR-12-WORDS-HERE-FOR-DEVELOPMENT-USAGE"
NET_MNEMONIC="YOUR-12-WORDS-HERE-FOR-TESTNET-USAGE"
INFURA_PROJECT_ID="YOUR-INFURA-PROJECT-ID-HERE"
```

* The `DEV_HOST` and `DEV_PORT` values are related to the Ganache node connection endpoint. 
* The `ACCOUNT_NUMBER` indicates how many accounts are you planning to use during the development. 
* The mnemonics are the 12-words code strings used for generating deterministic keys. Your `DEV_MNEMONIC` must refer to local development keys, and your `NET_MNEMONIC` must refer to public net development keys. 
* The `INFURA_PROJECT_ID` is a 32 characters string used to identify your project unique identifier. (*NB.* You need to [register](https://infura.io/register) to Infura to obtain a custom provider access for Ethereum public network connection. Follow this [guide](https://www.trufflesuite.com/tutorials/using-infura-custom-provider) if you have any problems).

To compile your Solidity SC code (this creates a new folder `build/` containing SC schema in JSON format): 

```bash
npm run compile
```

Run ESLint to check the syntax and style of your JavaScript code.

```bash
npm run lint-js
```

Run SolHint to check the syntax and style of your Solidity code.

```bash
npm run lint-sol
```


### Local Usage
Start a local Ganache node:

```bash
npm run ganache
```

Migrate (deploy) a single instance of the Crowdfunding smart contract:

```bash
npm run deploy-dev
```

You can run a script that deploys a new Crowdfunding smart contract instance and populate it by creating three new Project smart contracts (data from `./mocks/projects.json`):

```bash
npm run script-dev
```


You can run tests (*NB*. Each test will run from scratch on new Crowdfunding and Project smart contracts instances):

```bash
npm run test
```

### Public Network Usage
Migrate (deploy) a single instance of the Crowdfunding smart contract. The migration will happen on the public network specified in the `truffle-config.js` file (default: *ropsten*):

```bash
npm run deploy-net
```

You can run a script that deploys a new Crowdfunding smart contract instance and populate it by creating three new Project smart contracts (data from `./mocks/projects.json`). May take a while due to gas pricing and network latency:

```bash
npm run script-net
```

--- 

*NB.* This is a simple example and is **NOT** production-ready by any means.

You are most warmly invited to play around with the repo :-)

Ethereum Backend Boilerplate © 2020+, [LINKS Foundation](https://linksfoundation.com/)