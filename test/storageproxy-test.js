const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("StorageProxy", function() {
  it("Should be able to access SimpleStorageV1 and V2 through the Proxy", async function() {
    const [addr1, addr2] = await ethers.getSigners();
    const SimpleStorageV1 = await ethers.getContractFactory("SimpleStorageV1");
    const proxy = await upgrades.deployProxy(SimpleStorageV1, [1])

    await proxy.deployed();
    console.log("Implementation V1 deployed to:", proxy.address);

    expect(await proxy.get()).to.equal(1);

    await proxy.set(123);

    expect(await proxy.get()).to.equal(123);

    const SimpleStorageV2 = await ethers.getContractFactory("SimpleStorageV2");
    const proxyUpgraded = await upgrades.upgradeProxy(proxy.address, SimpleStorageV2)
    await proxyUpgraded.deployed();
    console.log("Implementation upgraded to V2, deployed to:", proxyUpgraded.address);

    expect(await proxyUpgraded.get()).to.equal(123, "should still have old data");
    await proxyUpgraded.set(234)
    expect(await proxyUpgraded.get()).to.equal(234, "should be able to call old set method");

    console.log("Setting value for ", addr1.address, "to", 555)
    await proxyUpgraded.setForSender(555)
    console.log("Setting value for ", addr2.address, "to", 666)
    await proxyUpgraded.connect(addr2).setForSender(666)

    expect(await proxyUpgraded.getForUser(addr1.address)).to.equal(555);
    expect(await proxyUpgraded.getForUser(addr2.address)).to.equal(666);
  });
});
