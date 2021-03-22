// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, upgrades } = require("hardhat");
const { upgradeToV3 } = require('./helpers')

async function main(proxyAddress, coinProxyAddress) {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  await upgradeToV3(proxyAddress, coinProxyAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", "0x0165878A594ca255338adfa4d48449f69242Eb8F")
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
