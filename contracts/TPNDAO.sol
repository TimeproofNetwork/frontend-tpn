// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITPNToken {
    function balanceOf(address account) external view returns (uint256);
    function burn(uint256 amount) external;
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IUpgradeableContract {
    function upgradeTo(address newImpl) external;
}

contract TPNDAO {
    address public owner;
    address public tpnToken;
    uint256 public proposalFee = 1000 * 10 ** 18;
    uint256 public votingPeriod = 7 days;
    uint256 public executionDelay = 1 days;

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    struct Proposal {
        address proposer;
        string description;
        address upgradeTarget;
        address newImplementation;
        uint256 startTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    event ProposalCreated(uint256 id, address proposer, address target, string description);
    event VoteCast(uint256 id, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 id, address target, address newImpl);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _tpnToken) {
        require(_tpnToken != address(0), "Invalid token");
        tpnToken = _tpnToken;
        owner = msg.sender;
    }

    function createProposal(address target, address newImpl, string memory description) external {
        require(target != address(0) && newImpl != address(0), "Invalid addresses");

        // Burn proposal fee
        require(
            ITPNToken(tpnToken).transferFrom(msg.sender, address(this), proposalFee),
            "Proposal fee transfer failed"
        );
        ITPNToken(tpnToken).burn(proposalFee);

        Proposal storage p = proposals[++proposalCount];
        p.proposer = msg.sender;
        p.description = description;
        p.upgradeTarget = target;
        p.newImplementation = newImpl;
        p.startTime = block.timestamp;

        emit ProposalCreated(proposalCount, msg.sender, target, description);
    }

    function vote(uint256 id, bool support) external {
        Proposal storage p = proposals[id];
        require(block.timestamp < p.startTime + votingPeriod, "Voting closed");
        require(!p.hasVoted[msg.sender], "Already voted");

        // Weight is sqrt(TPN held)
        uint256 balance = ITPNToken(tpnToken).balanceOf(msg.sender);
        require(balance > 0, "No TPN");
        uint256 weight = sqrt(balance);

        if (support) {
            p.yesVotes += weight;
        } else {
            p.noVotes += weight;
        }

        p.hasVoted[msg.sender] = true;
        emit VoteCast(id, msg.sender, support, weight);
    }

    function execute(uint256 id) external {
        Proposal storage p = proposals[id];
        require(!p.executed, "Already executed");
        require(block.timestamp > p.startTime + votingPeriod + executionDelay, "Too early");

        require(p.yesVotes > p.noVotes, "Did not pass");

        IUpgradeableContract(p.upgradeTarget).upgradeTo(p.newImplementation);
        p.executed = true;

        emit ProposalExecuted(id, p.upgradeTarget, p.newImplementation);
    }

    // ---------------------------------------
    // Admin Controls (future-proofing only)
    // ---------------------------------------
    function setProposalFee(uint256 newFee) external onlyOwner {
        proposalFee = newFee;
    }

    function setVotingParams(uint256 newPeriod, uint256 newDelay) external onlyOwner {
        votingPeriod = newPeriod;
        executionDelay = newDelay;
    }

    // ---------------------------------------
    // Util: Integer square root
    // ---------------------------------------
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    // ════════════════════════════════════════
    // ✅ Additions: Dynamic DAO Proposal Staking
    // ════════════════════════════════════════

    uint256 public requiredStake = 1000 * 10 ** 18;

    function setRequiredStake(uint256 newStake) external onlyOwner {
        requiredStake = newStake;
    }

    struct DAOTicket {
        address proposer;
        string category;
        string message;
        uint256 timestamp;
    }

    uint256 public ticketCounter;
    mapping(uint256 => DAOTicket) public daoTickets;

    event DAOTicketSubmitted(
        uint256 indexed ticketId,
        address indexed proposer,
        string category,
        string message,
        uint256 timestamp
    );

    function submitDAOTicket(string memory category, string memory message) external {
        require(bytes(category).length > 0, "Category required");
        require(bytes(message).length > 0, "Message required");

        // Burn or hold stake
        require(
            ITPNToken(tpnToken).transferFrom(msg.sender, address(this), requiredStake),
            "Stake transfer failed"
        );
        ITPNToken(tpnToken).burn(requiredStake);

        daoTickets[++ticketCounter] = DAOTicket({
            proposer: msg.sender,
            category: category,
            message: message,
            timestamp: block.timestamp
        });

        emit DAOTicketSubmitted(ticketCounter, msg.sender, category, message, block.timestamp);
    }
}


