const { deployBadgeV1 } = require('../scripts/helpers')

const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BigNumber } = require('@ethersproject/bignumber')

describe("StorageProxy", function() {
  it("Should be able to access SimpleStorageV1 and V2 through the Proxy", async function() {
    const [addr1, addr2] = await ethers.getSigners();
    let badgeProxy = await deployBadgeV1(addr1.address)
    expect(await badgeProxy.name()).to.equal('SimpleStorageBadge')
    expect(await badgeProxy.symbol()).to.equal('SSB')
    await badgeProxy.mint(addr1.address, '123')
    await expect(badgeProxy.mint(addr1.address, '123')).to.be.revertedWith('VM Exception while processing transaction: revert TokenURI must be unique')
    await expect(badgeProxy.connect(addr2).mint(addr2.address, '456')).to.be.revertedWith('VM Exception while processing transaction: revert ERC721PresetMinterPauserAutoId: must have minter role to mint')
    await badgeProxy.mint(addr2.address, '456')
  });
});

