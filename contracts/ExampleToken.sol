// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <=0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ExampleToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("ExampleToken", "EXT") {
        _mint(msg.sender, initialSupply);
    }
}