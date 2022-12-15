// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";

library Credential {
    struct Data {
        bytes signature;
        uint validUntil;
        uint approvedAt;
        uint maxAge;
        string fractalId;
        string level;
    }

    function hash(Data calldata _cred) internal view returns (bytes32) {
        string memory sender = Strings.toHexString(
            uint256(uint160(msg.sender)),
            20
        );
        return keccak256(
            abi.encodePacked(
                sender,
                ";",
                _cred.fractalId,
                ";",
                Strings.toString(_cred.approvedAt),
                ";",
                Strings.toString(_cred.validUntil),
                ";",
                _cred.level
            )
        );
    }
}
