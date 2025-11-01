const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EvidenceRegistry", function () {
  let evidenceRegistry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const EvidenceRegistry = await ethers.getContractFactory("EvidenceRegistry");
    evidenceRegistry = await EvidenceRegistry.deploy();
    await evidenceRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await evidenceRegistry.getAddress()).to.be.properAddress;
    });

    it("Should start with zero records", async function () {
      expect(await evidenceRegistry.getTotalRecords()).to.equal(0);
    });
  });

  describe("Store Evidence", function () {
    it("Should store evidence successfully", async function () {
      const recordId = "REC001";
      const plate = "ABC123";
      const ipfsCid = "QmTest123";
      const hash = "0xhash123";

      await expect(
        evidenceRegistry.storeEvidence(recordId, plate, ipfsCid, hash)
      )
        .to.emit(evidenceRegistry, "EvidenceStored")
        .withArgs(
          recordId,
          plate,
          ipfsCid,
          hash,
          await ethers.provider.getBlockNumber().then(n => n + 1).then(async bn => {
            const block = await ethers.provider.getBlock(bn);
            return block.timestamp;
          }),
          owner.address
        );

      const evidence = await evidenceRegistry.getEvidence(recordId);
      expect(evidence.plate).to.equal(plate);
      expect(evidence.ipfsCid).to.equal(ipfsCid);
      expect(evidence.hash).to.equal(hash);
      expect(evidence.submittedBy).to.equal(owner.address);
      expect(evidence.exists).to.equal(true);
    });

    it("Should reject empty recordId", async function () {
      await expect(
        evidenceRegistry.storeEvidence("", "ABC123", "QmTest", "0xhash")
      ).to.be.revertedWith("Record ID cannot be empty");
    });

    it("Should reject empty plate", async function () {
      await expect(
        evidenceRegistry.storeEvidence("REC001", "", "QmTest", "0xhash")
      ).to.be.revertedWith("Plate cannot be empty");
    });

    it("Should reject duplicate recordId", async function () {
      const recordId = "REC001";
      await evidenceRegistry.storeEvidence(recordId, "ABC123", "QmTest", "0xhash");
      
      await expect(
        evidenceRegistry.storeEvidence(recordId, "XYZ789", "QmTest2", "0xhash2")
      ).to.be.revertedWith("Record already exists");
    });

    it("Should increment total records", async function () {
      await evidenceRegistry.storeEvidence("REC001", "ABC123", "QmTest", "0xhash");
      expect(await evidenceRegistry.getTotalRecords()).to.equal(1);

      await evidenceRegistry.storeEvidence("REC002", "XYZ789", "QmTest2", "0xhash2");
      expect(await evidenceRegistry.getTotalRecords()).to.equal(2);
    });
  });

  describe("Update Evidence", function () {
    beforeEach(async function () {
      await evidenceRegistry.storeEvidence("REC001", "ABC123", "QmTest", "0xhash");
    });

    it("Should allow owner to update evidence", async function () {
      const newCid = "QmNewTest";
      const newHash = "0xnewhash";

      await expect(
        evidenceRegistry.updateEvidence("REC001", newCid, newHash)
      ).to.emit(evidenceRegistry, "EvidenceUpdated");

      const evidence = await evidenceRegistry.getEvidence("REC001");
      expect(evidence.ipfsCid).to.equal(newCid);
      expect(evidence.hash).to.equal(newHash);
    });

    it("Should reject update from non-owner", async function () {
      await expect(
        evidenceRegistry.connect(addr1).updateEvidence("REC001", "QmNew", "0xnew")
      ).to.be.revertedWith("Only original submitter can update");
    });

    it("Should reject update for non-existent record", async function () {
      await expect(
        evidenceRegistry.updateEvidence("REC999", "QmNew", "0xnew")
      ).to.be.revertedWith("Record does not exist");
    });
  });

  describe("Get Evidence", function () {
    it("Should return correct evidence", async function () {
      const recordId = "REC001";
      const plate = "ABC123";
      const ipfsCid = "QmTest";
      const hash = "0xhash";

      await evidenceRegistry.storeEvidence(recordId, plate, ipfsCid, hash);
      const evidence = await evidenceRegistry.getEvidence(recordId);

      expect(evidence.plate).to.equal(plate);
      expect(evidence.ipfsCid).to.equal(ipfsCid);
      expect(evidence.hash).to.equal(hash);
    });

    it("Should revert for non-existent record", async function () {
      await expect(
        evidenceRegistry.getEvidence("REC999")
      ).to.be.revertedWith("Record does not exist");
    });
  });

  describe("Record Management", function () {
    it("Should check if record exists", async function () {
      expect(await evidenceRegistry.recordExists("REC001")).to.equal(false);
      
      await evidenceRegistry.storeEvidence("REC001", "ABC123", "QmTest", "0xhash");
      
      expect(await evidenceRegistry.recordExists("REC001")).to.equal(true);
    });

    it("Should get record ID by index", async function () {
      await evidenceRegistry.storeEvidence("REC001", "ABC123", "QmTest", "0xhash");
      await evidenceRegistry.storeEvidence("REC002", "XYZ789", "QmTest2", "0xhash2");

      expect(await evidenceRegistry.getRecordIdByIndex(0)).to.equal("REC001");
      expect(await evidenceRegistry.getRecordIdByIndex(1)).to.equal("REC002");
    });

    it("Should revert when index out of bounds", async function () {
      await expect(
        evidenceRegistry.getRecordIdByIndex(0)
      ).to.be.revertedWith("Index out of bounds");
    });
  });
});
