import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { defaultCredential, signCredentials } from "./utils/credential"
import { getLastBlockTimestamp, setNextBlockTimestamp } from "./utils/time"

describe("CredentialVerifier basics", function () {

  let owner, fractal, user, credentialVerifier;
  beforeEach(async () => {
    ([owner, fractal, user] = await ethers.getSigners());
    const ImplExample = await ethers.getContractFactory("ImplExample");
    credentialVerifier = await ImplExample.connect(user).deploy(fractal.address);
    await credentialVerifier.deployed();
  });

  it("To be verified with the right credentials", async function () {
    const credentials = {...defaultCredential};
    credentials.signature = await signCredentials(credentials, fractal, user)
    const tx = await credentialVerifier.connect(user).test(credentials)
    await tx.wait()
  });

  it("To fail if expired", async function () {
    const credentials = {...defaultCredential};

    const timestamp = await getLastBlockTimestamp();

    credentials.validUntil = timestamp - 100; // in the past

    credentials.signature = await signCredentials(credentials, fractal, owner)

    await expect(
      credentialVerifier.connect(user).test(credentials)
    ).to.be.revertedWith("CredentialVerifier: Credential no longer valid.");
  });


  it("To fail if the approval is not recent enough.", async function () {
    const credentials = {...defaultCredential};

    const timestamp = await getLastBlockTimestamp();

    credentials.approvedAt = timestamp - defaultCredential.maxAge; // in the past

    credentials.signature = await signCredentials(credentials, fractal, owner)

    await expect(
      credentialVerifier.connect(user).test(credentials)
    ).to.be.revertedWith("CredentialVerifier: Approval not recent enough.");
  });

  it("To fail if used twice", async function () {
    const credentials = {...defaultCredential};
    credentials.signature = await signCredentials(credentials, fractal, user)
    const tx = await credentialVerifier.connect(user).test(credentials)
    await tx.wait()
    await expect(
      credentialVerifier.connect(user).test(credentials)
    ).to.rejectedWith("CredentialVerifier: Used hash.");
  });
});
