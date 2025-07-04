// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TPNToken is ERC20, ERC20Burnable, Ownable {
    uint8 private immutable _customDecimals;

    // 🔒 Factory Locked
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        address owner_
    ) ERC20(name_, symbol_) {
        _customDecimals = decimals_;
        _mint(owner_, initialSupply_);
        _transferOwnership(owner_); // ✅ Ownership retained by deployer until transferred to DAO
    }

    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}





