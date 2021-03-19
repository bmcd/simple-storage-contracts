const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BigNumber } = require('@ethersproject/bignumber')

describe("StorageProxy", function() {
  it("Should be able to deploy and use SSC through a proxy", async function() {
    const [addr1, addr2] = await ethers.getSigners();
    const SimpleStorageCoin = await ethers.getContractFactory("SimpleStorageCoin");
    const proxy = await upgrades.deployProxy(SimpleStorageCoin, [BigNumber.from("1000000000000000000000")])

    await proxy.deployed();
    console.log("SimpleStorageCoin Implementation V1 deployed to:", proxy.address);

    expect(await proxy.name()).to.equal('SimpleStorageCoin');
    expect(await proxy.symbol()).to.equal('SSC');
    expect(await proxy.decimals()).to.equal(18);
    expect(await proxy.totalSupply()).to.equal(BigNumber.from("1000000000000000000000"));
    expect(await proxy.balanceOf(addr1.address)).to.equal(BigNumber.from("1000000000000000000000"));
    expect(await proxy.balanceOf(addr2.address)).to.equal(0);
    await proxy.transfer(addr2.address, BigNumber.from("1000000000000000000"))
    expect(await proxy.balanceOf(addr2.address)).to.equal(BigNumber.from("1000000000000000000"));
  });
});
