// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract EvidenceRegistry {
    struct Evidence {
        string plate;
        string ipfsCid;
        string hash;
        uint256 timestamp;
        address submittedBy;
    }

    mapping(string => Evidence) public records;

    event EvidenceStored(
        string indexed recordId,
        string plate,
        string ipfsCid,
        string hash,
        uint256 timestamp,
        address indexed submittedBy
    );

    function storeEvidence(
        string memory recordId,
        string memory plate,
        string memory ipfsCid,
        string memory hash
    ) public {
        records[recordId] = Evidence(
            plate,
            ipfsCid,
            hash,
            block.timestamp,
            msg.sender
        );

        emit EvidenceStored(
            recordId,
            plate,
            ipfsCid,
            hash,
            block.timestamp,
            msg.sender
        );
    }

    function getEvidence(string memory recordId)
        public
        view
        returns (Evidence memory)
    {
        return records[recordId];
    }
}
