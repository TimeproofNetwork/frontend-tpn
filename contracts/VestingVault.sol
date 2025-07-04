// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VestingVault is Ownable {
    struct VestingSchedule {
        uint256 totalAllocation;
        uint256 claimedAmount;
        uint64 startTime;
        uint64 cliffDuration;
        uint64 vestingDuration;
    }

    IERC20 public immutable token;
    mapping(address => VestingSchedule) public vestingSchedules;

    event TokensClaimed(address indexed beneficiary, uint256 amount);

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token address");
        token = IERC20(tokenAddress);
        _transferOwnership(msg.sender); // ✅ Certik-safe owner assignment
    }

    function addVestingSchedule(
        address beneficiary,
        uint256 totalAllocation,
        uint64 startTime,
        uint64 cliffDuration,
        uint64 vestingDuration
    ) external onlyOwner {
        require(vestingSchedules[beneficiary].totalAllocation == 0, "Schedule already exists");
        require(totalAllocation > 0, "Invalid allocation");
        require(vestingDuration >= cliffDuration, "Cliff > Vesting");

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAllocation: totalAllocation,
            claimedAmount: 0,
            startTime: startTime,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration
        });
    }

    function claim() external {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAllocation > 0, "No vesting schedule");

        uint256 vested = _vestedAmount(schedule);
        uint256 claimable = vested - schedule.claimedAmount;
        require(claimable > 0, "Nothing to claim");

        schedule.claimedAmount = vested;
        require(token.transfer(msg.sender, claimable), "Token transfer failed");

        emit TokensClaimed(msg.sender, claimable);
    }

    function _vestedAmount(VestingSchedule memory schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        } else if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAllocation;
        } else {
            uint256 timeElapsed = block.timestamp - schedule.startTime;
            return (schedule.totalAllocation * timeElapsed) / schedule.vestingDuration;
        }
    }

    function getClaimableAmount(address beneficiary) external view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        uint256 vested = _vestedAmount(schedule);
        return vested - schedule.claimedAmount;
    }
}

