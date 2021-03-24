const { deployV1, upgradeToV2, upgradeToV3, deployTokenV1 } = require('../scripts/util/helpers')

const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BigNumber } = require('@ethersproject/bignumber')

describe("StorageProxy", function() {
  it("Should be able to access SimpleStorageV1 and V2 through the Proxy", async function() {
    let proxy = await deployV1()

    await testGlobalStorage(proxy, 1, 123)

    proxy = await upgradeToV2(proxy.address)

    await testGlobalStorage(proxy, 123, 234)
    await testUserStorage(proxy, 555, 666)

    let coinProxy = await deployTokenV1()

    await testTokenContract(coinProxy)

    proxy = await upgradeToV3(proxy.address, coinProxy.address)

    await expect(proxy.migrate(coinProxy.address, 5000)).to.be.revertedWith("revert Migratable: contract is already migrated")
    console.log("Implementation V3 deployed to:", proxy.address, " and using SSC token contract at:", coinProxy.address);
    await testStorageWithTokenPayments(proxy, coinProxy)
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

async function testStorageWithTokenPayments (proxy, coinProxy) {
  const [addr1, addr2] = await ethers.getSigners()

  expect(await proxy.get()).to.equal(234)

  await expect(proxy.set(123)).to.be.revertedWith('revert ERC20: transfer amount exceeds allowance')
  expect(await proxy.get()).to.equal(234)

  await coinProxy.approve(proxy.address, 10000)

  await proxy.set(123)
  expect(await proxy.get()).to.equal(123)
  await proxy.set(456)
  expect(await proxy.get()).to.equal(456)
  await expect(proxy.set(789)).to.be.revertedWith('revert ERC20: transfer amount exceeds allowance')
  expect(await proxy.get()).to.equal(456)

  console.log('Setting value for ', addr1.address, 'to', 777)
  await expect(proxy.setForSender(777)).to.be.revertedWith('revert ERC20: transfer amount exceeds allowance')
  expect(await proxy.getForUser(addr1.address)).to.equal(555)
  await coinProxy.approve(proxy.address, 5000)
  await proxy.setForSender(777)
  expect(await proxy.getForUser(addr1.address)).to.equal(777)
}

