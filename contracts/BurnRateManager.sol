// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBurnableTPN {
    function burn(uint256 amount) external;
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract BurnRateManager {
    address public tpnToken;
    address public registry;  // TokenRegistry or DAO that calls burn
    uint256 public baseRate = 6; // Represented in parts-per-million logic (0.0006%)
    uint256 public baseStartYear = 2025;

    event BurnExecuted(address indexed user, uint256 amount, uint256 ratePpm);
    event RegistrySet(address newRegistry);

    modifier onlyRegistry() {
        require(msg.sender == registry, "Not authorized");
        _;
    }

    constructor(address _tpnToken) {
        require(_tpnToken != address(0), "Invalid TPN address");
        tpnToken = _tpnToken;
    }

    function setRegistry(address _registry) external {
        require(registry == address(0), "Registry already set");
        require(_registry != address(0), "Zero address");
        registry = _registry;
        emit RegistrySet(_registry);
    }

    // Computes current burn rate in ppm (parts per million)
    function getCurrentBurnRate() public view returns (uint256) {
        uint256 year = getCurrentYear();
        if (year < baseStartYear) return 0;

        uint256 decadeDiff = (year - baseStartYear) / 10;
        return baseRate / (10 ** decadeDiff); // decay by 10x every decade
    }

    // Call to perform burn based on decayed rate
    function burnFrom(address user, uint256 txAmount) external onlyRegistry {
        uint256 ratePpm = getCurrentBurnRate(); // rate per million
        uint256 burnAmount = (txAmount * ratePpm) / 1_000_000;

        if (burnAmount > 0) {
            require(
                IBurnableTPN(tpnToken).transferFrom(user, address(this), burnAmount),
                "Burn transfer failed"
            );
            IBurnableTPN(tpnToken).burn(burnAmount);
            emit BurnExecuted(user, burnAmount, ratePpm);
        }
    }

    function getCurrentYear() internal view returns (uint256) {
        uint256 timestamp = block.timestamp;
        uint256 year = (timestamp / 31556926) + 1970; // 1 year ≈ 365.2425 days
        return year;
    }
}
