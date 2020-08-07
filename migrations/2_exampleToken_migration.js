const ExampleToken = artifacts.require("ExampleToken");
const initialFixedSupply = 1000000; // ExampleToken contract constructor argument.

module.exports = function(deployer) {
  deployer.deploy(ExampleToken, initialFixedSupply);
};
