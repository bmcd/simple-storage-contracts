const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("StorageProxy", function() {
  it("Should be able to access SimpleStorageV1 through the Proxy", async function() {
    const SimpleStorageV1 = await ethers.getContractFactory("SimpleStorageV1");
    const proxy = await upgrades.deployProxy(SimpleStorageV1, [1])

    await proxy.deployed();
    console.log("Implementation V1 deployed to:", proxy.address);

    expect(await proxy.get()).to.equal(1);

    await proxy.set(123);

    expect(await proxy.get()).to.equal(123);
  });
});
