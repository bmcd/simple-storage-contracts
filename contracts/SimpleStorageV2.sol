// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/proxy/Initializable.sol";

contract SimpleStorageV2 is Initializable {

    uint storedData;
    mapping(address => uint) userData;

    event Change(string message, uint newVal);
    event ChangeV2(string message, address user, uint newVal);

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

    function getForUser(address _user) view public returns (uint) {
        return userData[_user];
    }

    function setForSender(uint x) public {
        emit ChangeV2("set", msg.sender, x);
        userData[msg.sender] = x;
    }
}
