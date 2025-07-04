// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UpgradeableManager {
    address public owner;
    mapping(address => string) public contractVersions;
    string public currentVersion;

    event VersionTagEmitted(string version, uint256 timestamp);
    event ContractVersionUpdated(address indexed target, string version);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(string memory initialVersion) {
        owner = msg.sender;
        currentVersion = initialVersion;
        emit VersionTagEmitted(initialVersion, block.timestamp);
    }

    function emitVersionTag(string memory version) external onlyOwner {
        currentVersion = version;
        emit VersionTagEmitted(version, block.timestamp);
    }

    function setContractVersion(address contractAddress, string memory version) external onlyOwner {
        contractVersions[contractAddress] = version;
        emit ContractVersionUpdated(contractAddress, version);
    }

    function getContractVersion(address contractAddress) external view returns (string memory) {
        return contractVersions[contractAddress];
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
