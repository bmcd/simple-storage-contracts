// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/proxy/Initializable.sol";

contract SimpleStorageV1 is Initializable {

    uint storedData;

    event Change(string message, uint newVal);

    function initialize(uint startingData) public initializer {
        storedData = startingData;
    }

    function get() view public returns (uint retVal) {
        return storedData;
    }

    function set(uint x) public {
        emit Change("set", x);
        storedData = x;
    }
}
