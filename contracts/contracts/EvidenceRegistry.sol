// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title EvidenceRegistry
 * @dev Smart contract para registrar evidencias con hash IPFS
 */
contract EvidenceRegistry {
    struct Evidence {
        string plate;
        string ipfsCid;
        string hash;
        uint256 timestamp;
        address submittedBy;
        bool exists;
    }

    mapping(string => Evidence) public records;
    string[] private recordIds;

    event EvidenceStored(
        string indexed recordId,
        string plate,
        string ipfsCid,
        string hash,
        uint256 timestamp,
        address indexed submittedBy
    );

    event EvidenceUpdated(
        string indexed recordId,
        string newIpfsCid,
        string newHash,
        uint256 timestamp,
        address indexed updatedBy
    );

    /**
     * @dev Almacena nueva evidencia en la blockchain
     */
    function storeEvidence(
        string memory recordId,
        string memory plate,
        string memory ipfsCid,
        string memory hash
    ) public {
        require(bytes(recordId).length > 0, "Record ID cannot be empty");
        require(bytes(plate).length > 0, "Plate cannot be empty");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(bytes(hash).length > 0, "Hash cannot be empty");
        require(!records[recordId].exists, "Record already exists");

        records[recordId] = Evidence(
            plate,
            ipfsCid,
            hash,
            block.timestamp,
            msg.sender,
            true
        );

        recordIds.push(recordId);

        emit EvidenceStored(
            recordId,
            plate,
            ipfsCid,
            hash,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @dev Actualiza la evidencia existente (solo por el creador original)
     */
    function updateEvidence(
        string memory recordId,
        string memory newIpfsCid,
        string memory newHash
    ) public {
        require(records[recordId].exists, "Record does not exist");
        require(
            records[recordId].submittedBy == msg.sender,
            "Only original submitter can update"
        );
        require(bytes(newIpfsCid).length > 0, "IPFS CID cannot be empty");
        require(bytes(newHash).length > 0, "Hash cannot be empty");

        records[recordId].ipfsCid = newIpfsCid;
        records[recordId].hash = newHash;
        records[recordId].timestamp = block.timestamp;

        emit EvidenceUpdated(
            recordId,
            newIpfsCid,
            newHash,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @dev Obtiene la evidencia por ID
     */
    function getEvidence(string memory recordId)
        public
        view
        returns (Evidence memory)
    {
        require(records[recordId].exists, "Record does not exist");
        return records[recordId];
    }

    /**
     * @dev Verifica si un record existe
     */
    function recordExists(string memory recordId) public view returns (bool) {
        return records[recordId].exists;
    }

    /**
     * @dev Obtiene el total de registros
     */
    function getTotalRecords() public view returns (uint256) {
        return recordIds.length;
    }

    /**
     * @dev Obtiene un record ID por índice
     */
    function getRecordIdByIndex(uint256 index) public view returns (string memory) {
        require(index < recordIds.length, "Index out of bounds");
        return recordIds[index];
    }
}
