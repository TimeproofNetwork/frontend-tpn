// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenRegistry is Ownable {
    struct TokenInfo {
        string name;
        bytes32 symbol;
        bytes32 bytecodeHash;
        bool registered;
    }

    uint256 public minFee = 100 ether; // 100 TPN
    IERC20 public feeToken; // Fee token (TPN)

    mapping(address => TokenInfo) private tokens;
    address[] private tokenList;

    event TokenRegistered(address indexed tokenAddress, string name, bytes32 symbol, uint256 feePaid);
    event MinFeeUpdated(uint256 newFee);
    event FeeTokenUpdated(address newToken);

    constructor(address _feeToken) Ownable(msg.sender) {
        feeToken = IERC20(_feeToken);
    }

    function registerToken(
        string memory name,
        bytes32 symbol,
        bytes32 bytecodeHash
    ) external {
        // Derive a deterministic address (for demo purposes)
        address tokenAddress = address(uint160(uint256(keccak256(abi.encodePacked(bytecodeHash)))));
        require(!tokens[tokenAddress].registered, "Token already registered");

        // Transfer TPN token fee
        require(
            feeToken.transferFrom(msg.sender, address(this), minFee),
            "Insufficient TPN fee or allowance"
        );

        tokens[tokenAddress] = TokenInfo(name, symbol, bytecodeHash, true);
        tokenList.push(tokenAddress);

        emit TokenRegistered(tokenAddress, name, symbol, minFee);
    }

    function updateMinFee(uint256 newFee) external onlyOwner {
        minFee = newFee;
        emit MinFeeUpdated(newFee);
    }

    function updateFeeToken(address newToken) external onlyOwner {
        feeToken = IERC20(newToken);
        emit FeeTokenUpdated(newToken);
    }

    function getAllTokens() external view returns (address[] memory) {
        return tokenList;
    }

    function getTokenInfo(address tokenAddress) external view returns (
        string memory name,
        bytes32 symbol,
        bytes32 bytecodeHash,
        bool registered
    ) {
        TokenInfo memory info = tokens[tokenAddress];
        return (info.name, info.symbol, info.bytecodeHash, info.registered);
    }
}







