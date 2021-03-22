// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

const { ethers, upgrades } = require("hardhat");
const { BigNumber } = require('@ethersproject/bignumber')

async function main (coinProxyAddress) {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [addr1] = await ethers.getSigners();
  const recipients = [
    "0xf252019adF9637AF4Ef56145B1971E1Ac024BDc9",
    "0xF36d5771B051b197d8532795249C55444b7a7e76",
  ]

  const SimpleStorageCoin = await ethers.getContractFactory("SimpleStorageCoin");
  const ssc = await SimpleStorageCoin.attach(coinProxyAddress)

  await ssc.deployed();
  console.log('total', (await ssc.totalSupply()).toString())
  console.log('owner', (await ssc.balanceOf(addr1.address)).toString())
  for (let address of recipients) {
    console.log('Sending 1 SSC to', address)
    await ssc.transfer(address, BigNumber.from("100000000000000000"))
    console.log('done', (await ssc.balanceOf(address)).toString())
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
 main("0xa513E6E4b8f2a923D98304ec87F64353C4D5C853")
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
