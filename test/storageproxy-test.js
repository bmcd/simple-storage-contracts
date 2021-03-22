const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BigNumber } = require('@ethersproject/bignumber')

describe("StorageProxy", function() {
  it("Should be able to access SimpleStorageV1 and V2 through the Proxy", async function() {
    const SimpleStorageV1 = await ethers.getContractFactory("SimpleStorageV1");
    let proxy = await upgrades.deployProxy(SimpleStorageV1, [1])

    await proxy.deployed();
    console.log("Implementation V1 deployed to:", proxy.address);

    await testGlobalStorage(proxy, 1, 123)

    const SimpleStorageV2 = await ethers.getContractFactory("SimpleStorageV2");
    proxy = await upgrades.upgradeProxy(proxy.address, SimpleStorageV2)
    await proxy.deployed();
    console.log("Implementation upgraded to V2, deployed to:", proxy.address);

    await testGlobalStorage(proxy, 123, 234)
    await testUserStorage(proxy, 555, 666)
  });
});

async function testGlobalStorage (proxy, currentValue, newValue) {
  expect(await proxy.get()).to.equal(currentValue)
  await proxy.set(newValue)
  expect(await proxy.get()).to.equal(newValue)
}

async function testUserStorage (proxy, addr1Value, addr2Value) {
  const [addr1, addr2] = await ethers.getSigners();

  console.log('Setting value for ', addr1.address, 'to', addr1Value)
  await proxy.setForSender(addr1Value)
  console.log('Setting value for ', addr2.address, 'to', addr2Value)
  await proxy.connect(addr2).setForSender(addr2Value)

  expect(await proxy.getForUser(addr1.address)).to.equal(addr1Value)
  expect(await proxy.getForUser(addr2.address)).to.equal(addr2Value)
}

async function testTokenContract (coinProxy) {
  const [addr1, addr2] = await ethers.getSigners();

  expect(await coinProxy.name()).to.equal('SimpleStorageCoin')
  expect(await coinProxy.symbol()).to.equal('SSC')
  expect(await coinProxy.decimals()).to.equal(18)
  expect(await coinProxy.totalSupply()).to.equal(BigNumber.from('1000000000000000000000'))
  expect(await coinProxy.balanceOf(addr1.address)).to.equal(BigNumber.from('1000000000000000000000'))
  expect(await coinProxy.balanceOf(addr2.address)).to.equal(0)
  await coinProxy.transfer(addr2.address, BigNumber.from('1000000000000000000'))
  expect(await coinProxy.balanceOf(addr2.address)).to.equal(BigNumber.from('1000000000000000000'))
}
