// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, upgrades } = require("hardhat");
const { upgradeToV2 } = require('./helpers')

async function main (proxyAddress) {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  await upgradeToV2(proxyAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main("0x32D5AFB271C22ed6Db72D5D336F48E96eBc0c66C")
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
