// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITPNToken {
    function burn(uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface ITokenRegistry {
    function upgradeTrustLevel(address token, uint8 newLevel) external;
    function daoBan(string memory name, string memory symbol, bool status) external;
}

contract TPNDAODelegation {
    address public owner;
    address public tpnToken;
    address public registry;
    uint256 public proposalFee = 1000 * 10 ** 18;
    uint256 public timelockDuration = 1 days;
    uint256 public votingDuration = 7 days;

    struct Proposal {
        address proposer;
        string actionType;
        string param1;
        string param2;
        address targetToken;
        uint8 trustLevel;
        uint256 timestamp;
        bool executed;
    }

    Proposal[] public proposals;

    event ProposalSubmitted(uint256 indexed id, address proposer, string actionType);
    event ProposalExecuted(uint256 indexed id, string actionType);
    event DAOConfigUpdated(string param, uint256 newValue);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _tpnToken, address _registry) {
        owner = msg.sender;
        tpnToken = _tpnToken;
        registry = _registry;
    }

    function submitProposal(
        string memory actionType,
        string memory param1,
        string memory param2,
        address targetToken,
        uint8 trustLevel
    ) external {
        ITPNToken(tpnToken).transferFrom(msg.sender, address(this), proposalFee);
        ITPNToken(tpnToken).burn(proposalFee);

        proposals.push(Proposal({
            proposer: msg.sender,
            actionType: actionType,
            param1: param1,
            param2: param2,
            targetToken: targetToken,
            trustLevel: trustLevel,
            timestamp: block.timestamp,
            executed: false
        }));

        emit ProposalSubmitted(proposals.length - 1, msg.sender, actionType);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "Already executed");
        require(block.timestamp >= p.timestamp + timelockDuration, "Timelock not passed");

        if (keccak256(bytes(p.actionType)) == keccak256("upgradeTrust")) {
            ITokenRegistry(registry).upgradeTrustLevel(p.targetToken, p.trustLevel);
        } else if (keccak256(bytes(p.actionType)) == keccak256("banToken")) {
            ITokenRegistry(registry).daoBan(p.param1, p.param2, true);
        } else {
            revert("Unknown actionType");
        }

        p.executed = true;
        emit ProposalExecuted(proposalId, p.actionType);
    }

    function updateProposalFee(uint256 newFee) external onlyOwner {
        proposalFee = newFee;
        emit DAOConfigUpdated("proposalFee", newFee);
    }

    function updateTimelock(uint256 newTimelock) external onlyOwner {
        timelockDuration = newTimelock;
        emit DAOConfigUpdated("timelockDuration", newTimelock);
    }

    function updateVotingDuration(uint256 newVotingPeriod) external onlyOwner {
        votingDuration = newVotingPeriod;
        emit DAOConfigUpdated("votingDuration", newVotingPeriod);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }

    function getProposal(uint256 id) external view returns (
        address, string memory, string memory, string memory,
        address, uint8, uint256, bool
    ) {
        Proposal memory p = proposals[id];
        return (
            p.proposer, p.actionType, p.param1, p.param2,
            p.targetToken, p.trustLevel, p.timestamp, p.executed
        );
    }
}

