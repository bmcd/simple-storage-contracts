const { ethers, upgrades } = require("hardhat");
const { BigNumber } = require('@ethersproject/bignumber')

async function deployV1 () {
  const SimpleStorageV1 = await ethers.getContractFactory('SimpleStorageV1')
  const proxy = await upgrades.deployProxy(SimpleStorageV1, [1])

  await proxy.deployed()
  console.log('Implementation V1 deployed using proxy at:', proxy.address)
  return proxy
}

async function upgradeToV2 (proxyAddress) {
  const SimpleStorageV2 = await ethers.getContractFactory('SimpleStorageV2')
  const proxy = await upgrades.upgradeProxy(proxyAddress, SimpleStorageV2)

  await proxy.deployed()
  console.log('Implementation upgraded to V2, using proxy at:', proxy.address)
  return proxy
}

async function upgradeToV3 (proxyAddress, coinProxyAddress) {
  const SimpleStorageV3 = await ethers.getContractFactory('SimpleStorageV3')
  const proxy = await upgrades.upgradeProxy(proxyAddress, SimpleStorageV3)
  await proxy.deployed()

  // TODO this should be done in one transaction using openzeppelin's upgradeToAndCall() function
  // TODO but openzeppelin-upgrades doesn't support this yet
  await proxy.migrate(coinProxyAddress, 5000)
  console.log('Implementation upgraded to V3, using proxy at:', proxy.address, 'and token contract at', coinProxyAddress)
  return proxy
}

async function deployTokenV1 () {
  const SimpleStorageCoin = await ethers.getContractFactory('SimpleStorageCoin')
  const coinProxy = await upgrades.deployProxy(SimpleStorageCoin, [BigNumber.from('1000000000000000000000')])

  await coinProxy.deployed()
  console.log('Token Implementation V1 deployed using proxy at:', coinProxy.address)
  return coinProxy
}

module.exports = { deployV1, upgradeToV2, upgradeToV3, deployTokenV1 }