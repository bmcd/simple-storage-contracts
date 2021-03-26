const { deployBadgeV1, deployTokenV1, deployMarketplaceV1 } = require('../scripts/util/helpers')

const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BigNumber } = require('@ethersproject/bignumber')

describe("Badge Marketplace", function() {
  it("Should be able to mint and set up sales of badges", async function() {
    const [addr1, addr2] = await ethers.getSigners();
    let coinProxy = await deployTokenV1()
    let badgeProxy = await deployBadgeV1(addr1.address)

    expect(await badgeProxy.name()).to.equal('SimpleStorageBadge')
    expect(await badgeProxy.symbol()).to.equal('SSB')
    await badgeProxy.mint(addr1.address, '123')
    await expect(badgeProxy.mint(addr1.address, '123')).to.be.revertedWith('VM Exception while processing transaction: revert TokenURI must be unique')
    await expect(badgeProxy.connect(addr2).mint(addr2.address, '456')).to.be.revertedWith('VM Exception while processing transaction: revert ERC721PresetMinterPauserAutoId: must have minter role to mint')
    await badgeProxy.mint(addr2.address, '456')

    expect(await badgeProxy.ownerOf(1)).to.equal(addr1.address)
    expect(await badgeProxy.ownerOf(2)).to.equal(addr2.address)


    const marketplaceProxy = await deployMarketplaceV1(coinProxy.address, badgeProxy.address)

    await badgeProxy.connect(addr2).approve(marketplaceProxy.address, 2)
    await expect(marketplaceProxy.connect(addr2).openTrade(1, 5000)).to.be.revertedWith("VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved")
    await marketplaceProxy.connect(addr2).openTrade(2, 5000)
    let [ poster, item, price, status ] = await marketplaceProxy.getTrade(0)
    expect(poster).to.equal(addr2.address)
    expect(item.toNumber()).to.equal(2)
    expect(price.toNumber()).to.equal(5000)
    expect(ethers.utils.parseBytes32String(status)).to.equal('Open')
    await expect(marketplaceProxy.executeTrade(0)).to.be.revertedWith("VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance")
    await coinProxy.approve(marketplaceProxy.address, 5000)
    await marketplaceProxy.executeTrade(0)
    expect(ethers.utils.parseBytes32String((await marketplaceProxy.getTrade(0))[3])).to.equal('Executed')
    expect(await coinProxy.balanceOf(addr2.address)).to.equal(BigNumber.from(5000))
    await testCancelTrade(badgeProxy, marketplaceProxy, addr1, addr2, coinProxy)
  });
});

async function testCancelTrade (badgeProxy, marketplaceProxy, addr1, addr2, coinProxy) {
  await badgeProxy.setApprovalForAll(marketplaceProxy.address, true)
  await marketplaceProxy.openTrade(2, 5000)
  let [poster, item, price, status] = await marketplaceProxy.getTrade(1)
  expect(poster).to.equal(addr1.address)
  expect(item.toNumber()).to.equal(2)
  expect(price.toNumber()).to.equal(5000)
  expect(ethers.utils.parseBytes32String(status)).to.equal('Open')
  await expect(marketplaceProxy.connect(addr2).cancelTrade(1)).to.be.revertedWith('VM Exception while processing transaction: revert Trade can be cancelled only by poster.')
  await marketplaceProxy.cancelTrade(1)
  expect(ethers.utils.parseBytes32String((await marketplaceProxy.getTrade(1))[3])).to.equal('Cancelled')
  await coinProxy.connect(addr2).approve(marketplaceProxy.address, 5000)
  await expect(marketplaceProxy.connect(addr2).executeTrade(1)).to.be.revertedWith('VM Exception while processing transaction: revert Trade is not Open.')
}

