# A Simple Decentralized Crowdfunding dApp Backend
This branch contains an example which explains the usage of the backend for a simple dApp. You might have already heard of Kickstarter, a well-known crowdfunding platform. In this example, we'll be building a simplified and similar version of it, managing the decentralized crowdfunding business logic using the Ethereum Smart Contract.

* **Start Project**: Everyone with an Ethereum account (EOA - Externally Owned Account) should start a new crowdfunding project, along with setting its details like goal amount, deadline, etc.
* **View Projects**: Everyone can retrieve the project smart contracts' address and read the projects' details.
* **Fund Project**: Everyone with an Ethereum EOA can fund an existing project with some *Ether*.
* **Retrieve Funds**: If a project reaches the deadline without matching the fixed goal amount, contributors should retrieve their contributed funds in an *All-or-Nothing* setup.

The Smart Contracts are designed to guarantee trust for the operations involving transfers of *Ether* (e.g., when funding a project, when refunding a contributor) and time constraints (e.g., a contributor can be refunded if the goal amount isn't reached and the project has passed the deadline). 

## Getting Started
You can play around with this dApp, both locally or remotely.

After each JS or Solidity code change, you can run the linters to check for errors and auto fix the indentation.

```bash
npm run lint-js # for JS code.
npm run lint-sol # for Solidity SC code.
```

You can compile your contracts without deploying them running
```bash
npm run compile
```

#### Local
Start a local Ganache node

```bash
npm run ganache
```

If you'd like to deploy a single Crowdfunding Smart Contract

```bash
npm run deploy-dev
```

You can run a script example to deploy and populate a Crowdfunding Smart Contract creating three different Project Smart Contracts. The console will show you the Crowdfunding contract's address and the address and information about the Project Smart Contracts (you can change or add other projects modifying the file `mock/project.json`).

```bash
npm run script-dev
```

You can test Crowdfunding and Project Smart Contracts functionalities (you can add more tests inside `test/Crowdfunding.test.js` and `test/Project.test.js` files). Every run of the test script will deploy new smart contracts dynamically to restart from scratch.

```bash
npm run test
```

#### Remote
Deploy the Smart Contract on Ropsten testnet.

```bash
npm run deploy-net
```

You can run a script example to deploy and populate a Crowdfunding Smart Contract creating three different Project Smart Contracts. (NB. in that case you'll need to add more founders ropsten accounts).

```bash
npm run script-net
```

--- 

*NB.* This is a simple "dummy" example and is **NOT** production-ready by any means.

You are most warmly invited to play around with the repo!

*Example dApp Idea Reference* 
* https://medium.com/openberry/creating-a-simple-crowdfunding-dapp-with-ethereum-solidity-and-vue-js-69ddb8e132dd