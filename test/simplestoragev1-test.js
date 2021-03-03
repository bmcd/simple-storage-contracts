const { expect } = require("chai");

describe("SimpleStorageV1", function() {
  it("Should be able to set and get values", async function() {
    const SimpleStorageV1 = await hre.ethers.getContractFactory("SimpleStorageV1");

    const ss1 = await SimpleStorageV1.deploy();
    await ss1.deployed();
    console.log("Implementation V1 deployed to:", ss1.address);

    expect(await ss1.get()).to.equal(0);

    await ss1.set(123);

    expect(await ss1.get()).to.equal(123);

  });
});
