import { ethers } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getLastBlockTimestamp } from "./time"

export interface ICredential {
  signature: any;
  fractalId: string;
  approvedAt: number;
  validUntil: number;
  level: string;
}

export async function signCredentials(
  credential: ICredential,
  fractal: SignerWithAddress,
  user: SignerWithAddress
) {
    const hash = ethers.utils.arrayify(
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
        [
          "string",
          "string"
        ],
        [
          user.address.toLowerCase(),
          ";" +
          credential.fractalId +
          ";" +
          credential.approvedAt +
          ";" +
          credential.validUntil +
          ";" +
          credential.level
        ]
        )
      )
    );
    return await fractal.signMessage(hash);
}

export const defaultCredential: ICredential = {
  signature: [],
  fractalId: "0xc31e4db8e894e60ccc980fb9344d409da653bfe105e99fc7f203e289a746b07e",
  approvedAt: 1671001964,
  validUntil: 2669977368,
  maxAge: 15724800,
  level: "level:basic+liveness+uniq+wallet;citizenship_not:;residency_not:"
}