// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/introspection/ERC165Upgradeable.sol";

contract SimpleStorageCoin is Initializable, ERC20Upgradeable, ERC165Upgradeable {
    function initialize(uint initialSupply) public initializer {
        __ERC20_init("SimpleStorageCoin", "SSC");
        __ERC165_init();
        _registerInterface(0x36372b07);
        _mint(msg.sender, initialSupply);
    }
}
