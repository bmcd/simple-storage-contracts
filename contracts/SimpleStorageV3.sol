// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./SimpleStorageCoin.sol";
import "./Migratable.sol";

contract SimpleStorageV3 is Initializable, Migratable {

    uint storedData;
    mapping(address => uint) userData;
    uint price;
    SimpleStorageCoin token;

    event Change(string message, uint newVal);
    event ChangeV2(string message, address user, uint newVal);

    modifier hasPaid() {
        require(token.transferFrom(msg.sender, address(this), price));
        _;
    }

    function initialize(uint startingData) internal initializer {
        storedData = startingData;
    }

    function migrate(address tokenAddress, uint startingPrice) public migrater {
        token = SimpleStorageCoin(tokenAddress);
        price = startingPrice;
    }

    function get() view public returns (uint retVal) {
        return storedData;
    }

    function set(uint x) public hasPaid {
        emit Change("set", x);
        storedData = x;
    }

    function getForUser(address _user) view public returns (uint) {
        return userData[_user];
    }

    function setForSender(uint x) public hasPaid {
        emit ChangeV2("set", msg.sender, x);
        userData[msg.sender] = x;
    }

    function getPrice() view public returns (uint) {
        return price;
    }

    function setPrice(uint newPrice) public {
        price = newPrice;
    }

    // normally this would be an admin-protected transfer function so tokens aren't stuck
    function transfer(address recipient, uint amount) public {
        token.transfer(recipient, amount);
    }
}
