// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./CredentialVerifier.sol";

contract ImplExample is CredentialVerifier {
	
	function test(Credential.Data calldata cred) public requiresCredential(cred) {

	}
}