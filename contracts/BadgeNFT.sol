// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BadgeNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIds;

    enum TrustLevel { None, Basic, Verified, Audited }

    mapping(uint256 => TrustLevel) public badgeLevels;

    event BadgeMinted(address indexed recipient, uint256 tokenId, TrustLevel level);

    constructor(string memory name, string memory symbol, address _customOwner)
        ERC721(name, symbol)
    {
        _transferOwnership(_customOwner); // ✅ Ownership retained by deployer until .transferOwnership(dao)
    }

    function mintBadge(address recipient, uint8 level) external onlyOwner returns (uint256) {
        require(level >= 1 && level <= 3, "Invalid trust level");

        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;

        _mint(recipient, newTokenId);
        badgeLevels[newTokenId] = TrustLevel(level);

        emit BadgeMinted(recipient, newTokenId, TrustLevel(level));
        return newTokenId;
    }

    function getBadgeLevel(uint256 tokenId) external view returns (uint8) {
        require(_exists(tokenId), "Badge does not exist");
        return uint8(badgeLevels[tokenId]);
    }

    function getBadgeColor(uint8 trustLevel) public pure returns (string memory) {
        if (trustLevel == 1) return "Basic Trust";
        if (trustLevel == 2) return "Exchange Verified";
        if (trustLevel == 3) return "Audited & Verified";
        return "Unknown";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "BadgeNFT: URI query for nonexistent token");

        string memory levelStr = getBadgeColor(uint8(badgeLevels[tokenId]));

        return string(
            abi.encodePacked(
                "data:application/json;utf8,{",
                '"name":"TPN Badge #', tokenId.toString(), '",',
                '"description":"Immutable Proof of Trust from Timeproof Network",',
                '"attributes":[{"trait_type":"TPN Trust Level","value":"', levelStr, '"}]}'
            )
        );
    }
}
















