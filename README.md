# api-credentials-verifiers
Verifier contracts used to verify on-chain credentials returned by Fractal's Credentials API

## Credentials API Proof Verification

**Authorize wallet address transactions by including a Fractal credential proof in their payload.**

- no need to access or manage personal data
- minimal changes to user flow

![credential-verification](https://user-images.githubusercontent.com/365821/166981914-ed1d1888-9858-4989-8054-014a1937daae.png)

### Interface

#### Getting a Fractal proof for a user using the Credentials API. See detailed [documentation](https://docs.developer.fractal.id/fractal-credentials-api)

```
GET https://credentials.fractal.id/
    ?message=<message user signed>
    &signature=<user signature>

200 OK {
  address: "<EVM address>",
  approvedAt: <UNIX timestamp>,
  fractalId: "<hex string>",
  proof: "<hex string>",
  validUntil: <UNIX timestamp>
}

400 BAD REQUEST { error: "<error code>" }
404 NOT FOUND { address: "<EVM address>", error: "<error code>" }
```

### Setup

1. Import our `CredentialVerifier.sol` contract to inherit its `requiresCredential` modifier.
1. Change the first argument of `requiresCredential` (`expectedCredential`) based on your KYC level and country requirements.
   - Format: `level:<kycLevel>;citizenship_not:<comma-separated country codes>;residency_not:<comma-separated country codes>` ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes).
1. Set the second to last argument of `requiresCredential` (`maxAge`) to the maximum amount of time allowed to pass since KYC approval.

- In seconds (e.g. for `182` days, use `15724800`: `182*24*60*60`)
- Use `0` to skip this check (i.e. if it's not important how long ago the KYC was approved)

<details>
  <summary>👁️ <strong>See example <code>(Solidity)</code></strong></summary>

```solidity
import "github.com/trustfractal/credentials-api-verifiers/CredentialVerifier.sol";

contract Main is CredentialVerifier {
    function main(
        /* your transaction arguments go here */
        bytes calldata proof,
        uint validUntil,
        uint approvedAt,
        string memory fractalId
    ) external requiresCredential("level:plus;citizenship_not:de;residency_not:ca,us", proof, validUntil, approvedAt, 15724800, fractalId) {
        /* your transaction logic goes here */
    }
}
```

</details>

### Usage

1. Before a user interacts with your contract, ask them to sign a message authorizing Fractal to respond on their behalf.
1. Send this message and signature to Fractal's API, which returns an expiry timestamp (24 hours in the future) and a proof (Fractal's signature of the user's credential).
1. Use this timestamp and proof as arguments to your contract's method.

For more information on how to interact with Fractal's Credentials API, please read our [docs](https://docs.developer.fractal.id/fractal-credentials-api).

<details>
  <summary>👁️ <strong>See example <code>(Javascript)</code></strong></summary>

```javascript
// using web3.js and MetaMask

const message = `I authorize Defistarter (dc3aa1910acbb7ff4d22c07e43a6926adc3a81305a9355a304410048c9a91afd) to get a proof from Fractal that:
- I passed KYC level plus+liveness
- I am not a citizen of the following countries: Germany (DE)
- I am not a resident of the following countries: Germany (DE)`;

const account = (await web3.eth.getAccounts())[0];
const signature = await ethereum.request({
  method: "personal_sign",
  params: [message, account],
});

const { address, approvedAt, fractalId, proof, validUntil } =
  await FractalAPI.getProof(message, signature);

const mainContract = new web3.eth.Contract(contractABI, contractAddress);
mainContract.methods
  .main(proof, validUntil, approvedAt, fractalId)
  .send({ from: account });
```

</details>

### Gas cost

Credential verification adds approximately 26k gas to the transaction cost.
