# A Simple Decentralized Crowdfunding dApp Backend
This branch contains an example which explains the usage of the backend for a simple dApp. You might have already heard of Kickstarter, a well-known crowdfunding platform. In this example, we'll be building a simplified and similar version of it, managing the decentralized crowdfunding business logic using the Ethereum Smart Contract.

* **Start Project**: Everyone with an Ethereum account (EOA - Externally Owned Account) should start a new crowdfunding project, along with setting its details like goal amount, deadline, etc.
* **View Projects**: Everyone can retrieve the project smart contracts' address and read the projects' details.
* **Fund Project**: Everyone with an Ethereum EOA can fund an existing project with some *Ether*.
* **Retrieve Funds**: If a project reaches the deadline without matching the fixed goal amount, contributors should be able to retrieve their contributed funds in an *All-or-Nothing* setup.

The Smart Contracts are designed to guarantee trust for the operations involving transfers of *Ether* (e.g., when funding a project, when refunding a contributor) and time constraints (e.g., a contributor can be refunded if the goal amount isn't reached and the project has passed the deadline). 

## Getting Started

*To do*

--- 

*NB.* This is a simple "dummy" example and is **NOT** production-ready by any means.

You are most warmly invited to play around with the repo!

*References* 
* https://medium.com/openberry/creating-a-simple-crowdfunding-dapp-with-ethereum-solidity-and-vue-js-69ddb8e132dd