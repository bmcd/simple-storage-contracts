const { expect } = require("chai");

describe("SimpleStorageV2", function() {
  it("Should be able to use old set/get methods as well as new per address vaues", async function() {
    const [addr1, addr2] = await ethers.getSigners();
    const SimpleStorageV2 = await hre.ethers.getContractFactory("SimpleStorageV2");

    const ss2 = await SimpleStorageV2.deploy();
    await ss2.deployed();
    console.log("Implementation V2 deployed to:", ss2.address);

    expect(await ss2.get()).to.equal(0);

    await ss2.set(123);

    expect(await ss2.get()).to.equal(123);

    console.log("Setting value for ", addr1.address, "to", 555)
    await ss2.setForSender(555)
    await ss2.connect(addr2).setForSender(666)

    expect(await ss2.getForUser(addr1.address)).to.equal(555);
    expect(await ss2.getForUser(addr2.address)).to.equal(666);
  });
});
