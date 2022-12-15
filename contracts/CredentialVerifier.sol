// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./Credential.sol";

abstract contract CredentialVerifier {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) private _usedHashs;

    address public FRACTAL_SIGNER;

    modifier requiresCredential(Credential.Data calldata _cred) {
        _requiresCredential(_cred);
        _;
    }

    function _requiresCredential(Credential.Data calldata _cred) internal {
        require(block.timestamp < _cred.validUntil, "CredentialVerifier: Credential no longer valid.");

        require(_cred.maxAge == 0 || block.timestamp < _cred.approvedAt + _cred.maxAge,
            "CredentialVerifier: Approval not recent enough.");

        bytes32 hash = Credential.hash(_cred);

        require(!_usedHashs[hash], "CredentialVerifier: Used hash.");

        bytes32 hashFormatted = hash.toEthSignedMessageHash();
        address recoveredAddress = hashFormatted.recover(_cred.signature);
        require(recoveredAddress == FRACTAL_SIGNER, "CredentialVerifier: Signature invalid.");

        _usedHashs[hash] = true;
    }
}
