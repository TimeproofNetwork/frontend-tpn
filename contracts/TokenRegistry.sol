// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ✅ Interface for standard ERC20 (still used if needed elsewhere)
interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function burn(uint256 value) external;
}

// ✅ Interface for burnFrom() (for gas-optimized burn logic)
interface IERC20Burnable {
    function burnFrom(address account, uint256 amount) external;
}

// ✅ Interface for badge minting
interface IBadgeNFT {
    function mintBadge(address to, uint8 trustLevel) external;
}

// ══════════════════════════════════════════════════════════════════════════════
// ✅ TokenRegistry.sol — TPN Immutable Lock Build (Final Updated)
// ✅ All Layer Names and Phase 1 Features Included
// ══════════════════════════════════════════════════════════════════════════════

contract TokenRegistry is Ownable, ReentrancyGuard {

    address public tpnTokenAddress;
    address public badgeNFTAddress;
    address public dao;
    uint256 public minTPNFee = 100 * 10 ** 18;
    bool public paused;

    // ✅ New addition: Track all registered tokens
    address[] public allRegisteredTokens;


    struct TokenInfo {
    string name;
    string symbol;
    address tokenAddress;
    address registeredBy;
    uint256 timestamp;
    string proof1;
    string proof2;
    uint8 trustLevel;
    bool isRegistered;
    bool upgradeRequested;
}

struct BadgeMetadata {
    string name;
    string symbol;
    uint8 trustLevel;
    string levelName;
    string levelColor;
    uint256 timestamp;
}

    // ════════════════════════════════
    // 🛡️ Layer 1: Metadata Protections
    // ════════════════════════════════

    mapping(address => TokenInfo) public registeredTokens;
    mapping(bytes32 => bool) public usedFingerprints;
    mapping(bytes32 => address) public nameSymbolToAddress;
    // 🧬 Tracks uniqueness of sanitized (name, symbol) fingerprint
    mapping(bytes32 => bool) public fingerprintExists;
    // ✅ DAO-managed trusted domain lists
    mapping(string => bool) public allowedExchanges;
    mapping(string => bool) public allowedAuditors;

        
        // 👇 This function must be inside this contract
    function getRegisteredToken(string memory name, string memory symbol) external view returns (
        string memory,
        string memory,
        address,
        address,
        uint256,
        uint8,
        bool
    ) {
        bytes32 id = visualID(name, symbol);
        address tokenAddress = nameSymbolToAddress[id];
        require(tokenAddress != address(0), "Not registered");

        TokenInfo memory info = registeredTokens[tokenAddress];
        return (
            info.name,
            info.symbol,
            info.tokenAddress,
            info.registeredBy,
            info.timestamp,
            info.trustLevel,
            info.isRegistered
        );
    }
    function getTrustDetails(address token) external view returns (
    string memory name,
    string memory symbol,
    uint8 trustLevel,
    string memory levelName,
    string memory levelColor
) {
    TokenInfo memory info = registeredTokens[token];
    require(info.isRegistered, "Token not registered");

    name = info.name;
    symbol = info.symbol;
    trustLevel = info.trustLevel;

    if (trustLevel == 3) {
        levelName = "Audited & Exchange Verified";
        levelColor = "#800080"; // Purple
    } else if (trustLevel == 2) {
        levelName = "Exchange Verified";
        levelColor = "#00FF00"; // Green
    } else if (trustLevel == 1) {
        if (bytes(info.proof2).length > 0) {
            levelName = "Level 1: Upgrade level 3 under DAO review";
            levelColor = "#FFD700"; // Yellow
        } else if (bytes(info.proof1).length > 0) {
            levelName = "Level 1: Upgrade level 2 under DAO review";
            levelColor = "#FFD700"; // Yellow
        } else {
            levelName = "Basic Trust";
            levelColor = "#FFD700"; // Yellow
        }
    } else {
        levelName = "Unverified";
        levelColor = "#FFFFFF"; // White fallback
    }
}

   // ════════════════════════════════
   // 🔒 Layer 2: Global Bans & Lists
   // ════════════════════════════════

    mapping(bytes32 => bool) public globalBanList;
    mapping(bytes32 => bool) public daoPunishmentBan;
    mapping(bytes32 => bool) public suspicionList;
    mapping(bytes32 => bool) public quarantineList;

   // ══════════════════════════════════════════════════════════════════════════════
   // 📦 Quarantine Logbook Storage
   // ══════════════════════════════════════════════════════════════════════════════

    struct QuarantinedToken {
    string name;
    string symbol;
    address tokenAddress;
    address registeredBy;
    uint256 timestamp;
}

QuarantinedToken[] public quarantineLogbook;


function getTotalQuarantined() external view returns (uint256) {
    return quarantineLogbook.length;
}

function getQuarantinedToken(uint256 index) external view returns (
    string memory name,
    string memory symbol,
    address tokenAddress,
    address registeredBy,
    uint256 timestamp
) {
    QuarantinedToken memory qt = quarantineLogbook[index];
    return (qt.name, qt.symbol, qt.tokenAddress, qt.registeredBy, qt.timestamp);
}

    // ══════════════════════════════════════════════════════════════════════════════
    // 📦 DAO Ban Logbook Storage
    // ══════════════════════════════════════════════════════════════════════════════

    struct DAOBanToken {
        string name;
        string symbol;
        address tokenAddress;
        address registeredBy;
        uint256 timestamp;
    }

    struct DAOBannedToken {
    string name;
    string symbol;
    address tokenAddress;
    address registeredBy;
    uint256 timestamp;
}

    DAOBannedToken[] public daoBanLogbook;


    function getTotalDAOBanned() external view returns (uint256) {
        return daoBanLogbook.length;
    }

    function getDAOBannedToken(uint256 index) external view returns (
        string memory name,
        string memory symbol,
        address tokenAddress,
        address registeredBy,
        uint256 timestamp
    ) {
        DAOBannedToken storage dbt = daoBanLogbook[index];


        return (dbt.name, dbt.symbol, dbt.tokenAddress, dbt.registeredBy, dbt.timestamp);
    }


    // ════════════════════════════════
    // 📊 Layer 3: Rate Limiting & Logs
    // ════════════════════════════════

    mapping(address => uint256) public creatorSubmissionCount;
    TokenInfo[] public tokenLogbook;
    mapping(address => uint256) public customCooldowns;
    mapping(address => uint256) public lastSubmissionTimestamp;
    mapping(address => uint256) public submissionBurstCount;
    uint256 public defaultMaxBurst = 18;
    uint256 public defaultCooldown = 60;
    

    // ════════════════════════════════
    // 📢 Events
    // ════════════════════════════════

event TokenRegisteredCompressed(
    bytes32 nameSymbolHash,
    address tokenAddress,
    address indexed creator,
    uint8 trustLevel
);

event TokenRegistered(
    string name,
    string symbol,
    address tokenAddress,
    address creator,
    uint256 timestamp
);

event TokenGloballyBanned(string name, string symbol);
event TokenUnbanned(string name, string symbol);
event MinFeeUpdated(uint256 newFee);
event SelfHealTriggered(string name, string symbol, address removedToken, address keeper);
event RegistryPaused();
event RegistryUnpaused();
event DAOSet(address newDAO);
event TokenQuarantined(string name, string symbol);
event TokenUnquarantined(string name, string symbol);
event BadgeLevelUpdated(address tokenAddress, uint8 newLevel);
event DAOBanApplied(string name, string symbol);


    // ════════════════════════════════
    // 🔐 Modifiers
    // ════════════════════════════════

    modifier onlyDAO() {
        require(msg.sender == dao, "Not DAO");
        _;
    }

    modifier notPaused() {
        require(!paused, "Registry is paused");
        _;
    }
    modifier onlyIfNotRegistered(address token) {
    require(registeredTokens[token].timestamp == 0, "Already registered");
    _;
}
    // ════════════════════════════════
    // ⚙️ Constructor
    // ════════════════════════════════

    constructor(address _tpnTokenAddress, address _badgeNFTAddress, address _customOwner) {
    require(_tpnTokenAddress != address(0), "Invalid TPN address");
    require(_badgeNFTAddress != address(0), "Invalid BadgeNFT address");

    tpnTokenAddress = _tpnTokenAddress;
    badgeNFTAddress = _badgeNFTAddress;

    _transferOwnership(_customOwner); // ✅ Sets custom owner safely

    // ✅ Default trusted exchanges and auditors
    allowedExchanges["binance.com"] = true;
    allowedExchanges["coinbase.com"] = true;
    allowedAuditors["certik.com"] = true;
    allowedAuditors["trailofbits.com"] = true;
}

    // ════════════════════════════════
    // 🔤 Input Sanitization & Hashing
    // ════════════════════════════════

    function _isASCII(string memory str) internal pure returns (bool) {
        bytes memory b = bytes(str);
        for (uint i = 0; i < b.length; i++) {
            if (uint8(b[i]) > 127) return false;
        }
        return true;
    }

    function sanitize(string memory input) public pure returns (string memory) {
    bytes memory b = bytes(input);
    bytes memory result = new bytes(b.length);
    uint256 j;

    unchecked {
        for (uint256 i = 0; i < b.length; ++i) {
            uint8 c = uint8(b[i]);
            if (c >= 65 && c <= 90) {
                result[j++] = bytes1(c + 32); // A-Z → a-z
            } else if ((c >= 97 && c <= 122) || (c >= 48 && c <= 57)) {
                result[j++] = b[i]; // Keep a-z, 0-9
            }
        }
    }

    assembly {
        mstore(result, j) // Trim length in-place
    }

    return string(result);
}

    function visualID(string memory name, string memory symbol) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(sanitize(name), sanitize(symbol)));
    }

    function fingerprintID(string memory name, string memory symbol, address creator) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(sanitize(name), sanitize(symbol), creator));
    }

    // ════════════════════════════════
    // 📝 Token Registration
    // ════════════════════════════════

function registerToken(
    string memory name,
    string memory symbol,
    address tokenAddress,
    string memory proof1,
    string memory proof2
) external notPaused nonReentrant {

    // 🔠 Layer 0: ASCII Only
    require(_isASCII(name) && _isASCII(symbol), "Layer0: Only ASCII allowed");

    // 🧼 Layer 1: Sanitization Check
    string memory sanitizedName = sanitize(name);
    string memory sanitizedSymbol = sanitize(symbol);
    if (
        bytes(name).length != bytes(sanitizedName).length ||
        bytes(symbol).length != bytes(sanitizedSymbol).length
    ) {
        revert("Layer1: Sanitized mismatch");
    }

    // 🔍 Generate Hashes (Sanitized Only)
    bytes32 nameSymbolHash = keccak256(abi.encodePacked(sanitizedName, sanitizedSymbol));
    bytes32 fingerprintHash = keccak256(abi.encodePacked(sanitizedName, sanitizedSymbol, msg.sender));
    require(nameSymbolToAddress[nameSymbolHash] == address(0), "Layer2: Fingerprint already used");

    // 🔐 Layer 2–6 Checks
    require(!usedFingerprints[fingerprintHash], "Layer2: Fingerprint used");
    require(!globalBanList[nameSymbolHash], "Layer3: Token is globally banned");
    require(!daoPunishmentBan[nameSymbolHash], "Layer4: DAO banned");
    require(!quarantineList[nameSymbolHash], "Layer5: Token quarantined");
    require(!suspicionList[nameSymbolHash], "Layer6: Suspicious submission");

    // ⛔ Reject re-registration
    require(registeredTokens[tokenAddress].timestamp == 0, "Already registered");

    // ⏱ Cooldown & Burst Control
    uint256 cooldown = customCooldowns[msg.sender] > 0 ? customCooldowns[msg.sender] : defaultCooldown;
    uint256 maxBurst = defaultMaxBurst;
    uint256 last = lastSubmissionTimestamp[msg.sender];
    uint256 count = submissionBurstCount[msg.sender];

    if (block.timestamp < last + cooldown) {
        require(count < maxBurst, "Rate: Too many submissions");
        submissionBurstCount[msg.sender] = count + 1;
    } else {
        lastSubmissionTimestamp[msg.sender] = block.timestamp;
        if (count != 1) submissionBurstCount[msg.sender] = 1;
    }

    // 🔥 TPN Burn Fee
    IERC20Burnable tpn = IERC20Burnable(tpnTokenAddress);
    tpn.burnFrom(msg.sender, minTPNFee);

    // ✅ Finalize Fingerprint
    creatorSubmissionCount[msg.sender]++;
    usedFingerprints[fingerprintHash] = true;

    // 🧾 Validate Proofs
    if (bytes(proof1).length > 0) {
        require(_validExchangeProof(proof1), unicode"❌ Invalid exchange verification link");
    }
    if (bytes(proof2).length > 0) {
        require(_validAuditProof(proof2), unicode"❌ Invalid audit verification link");
    }

    // 📝 Mandatory fields check
    require(bytes(name).length > 0 && bytes(symbol).length > 0, "Name and symbol required");
    require(tokenAddress != address(0), "Token address cannot be zero");

    // 🔐 Fingerprint Uniqueness (Sanitized Only)
    require(!fingerprintExists[nameSymbolHash], "Token with same fingerprint already registered");

    // 🧾 Create and store token
    TokenInfo memory newToken = TokenInfo({
        name: name,
        symbol: symbol,
        tokenAddress: tokenAddress,
        registeredBy: msg.sender,
        timestamp: block.timestamp,
        trustLevel: 1,
        isRegistered: true,
        proof1: proof1,
        proof2: proof2,
        upgradeRequested: (bytes(proof1).length > 0 || bytes(proof2).length > 0)
    });

    registeredTokens[tokenAddress] = newToken;
    tokenLogbook.push(newToken);
    nameSymbolToAddress[nameSymbolHash] = tokenAddress;
    fingerprintExists[nameSymbolHash] = true;
    allRegisteredTokens.push(tokenAddress);

    emit TokenRegistered(name, symbol, tokenAddress, msg.sender, block.timestamp);
    emit TokenRegisteredCompressed(nameSymbolHash, tokenAddress, msg.sender, newToken.trustLevel);
}
 // ✅ Close registerToken function


// 🎖️ Badge Minting (Separated to optimize gas)
function mintBadgeFor(address tokenAddress) external nonReentrant notPaused {
    TokenInfo memory info = registeredTokens[tokenAddress];
    require(info.isRegistered, "Token not registered");
    require(info.registeredBy == msg.sender, "Not token creator");

    IBadgeNFT(badgeNFTAddress).mintBadge(msg.sender, info.trustLevel);
    emit BadgeLevelUpdated(tokenAddress, info.trustLevel);
}


// ════════════════════════════════
// 🛠️ DAO & Admin Functions (Final Matrix Compliant)
// ════════════════════════════════

function setDAO(address newDAO) external onlyOwner {
    require(newDAO != address(0), "Invalid DAO");
    dao = newDAO;
    emit DAOSet(newDAO);
}
function daoBan(string memory name, string memory symbol, bool stripBadge) external onlyDAO notPaused {

    bytes32 banHash = visualID(name, symbol);

    require(!quarantineList[banHash], "Token is quarantined - unquarantine first");

    // ✅ Always apply DAO punishment, even if globally banned already
    daoPunishmentBan[banHash] = true;

    // ✅ Ensure global ban enforced
    if (!globalBanList[banHash]) {
        globalBanList[banHash] = true;
    }
        address tokenAddrLog = getTokenByNameSymbol(name, symbol);
    if (tokenAddrLog != address(0) && registeredTokens[tokenAddrLog].isRegistered) {
        daoBanLogbook.push(DAOBannedToken({
            name: name,
            symbol: symbol,
            tokenAddress: tokenAddrLog,
            registeredBy: registeredTokens[tokenAddrLog].registeredBy,
            timestamp: block.timestamp
        }));
    }

    if (stripBadge) {
        address tokenAddr = getTokenByNameSymbol(name, symbol);
        if (tokenAddr != address(0) && registeredTokens[tokenAddr].isRegistered) {
            registeredTokens[tokenAddr].trustLevel = 0;
            emit BadgeLevelUpdated(tokenAddr, 0);
        }
        emit DAOBanApplied(name, symbol);
    }
}

function daoQuarantine(string memory name, string memory symbol) external onlyDAO notPaused {

    bytes32 id = visualID(name, symbol);

    require(!globalBanList[id], "Token is globally banned");
    require(!quarantineList[id], "Token already quarantined");

    quarantineList[id] = true;
    emit TokenQuarantined(name, symbol);
}

function unquarantineToken(string memory name, string memory symbol) external onlyDAO notPaused {

    bytes32 id = visualID(name, symbol);
    quarantineList[id] = false;
    emit TokenUnquarantined(name, symbol);
}

function daoUpgradeTrustLevel(
    address token,
    uint8 newLevel,
    string memory proof1,
    string memory proof2
) 
    external onlyDAO notPaused {

    require(token != address(0), "Invalid token");
    require(registeredTokens[token].isRegistered, "Token not registered");

    TokenInfo storage info = registeredTokens[token];
    bytes32 id = visualID(info.name, info.symbol);

    require(!globalBanList[id], "Token is globally banned");
    require(!quarantineList[id], "Token is quarantined - unquarantine first");

    require(newLevel != info.trustLevel, "No change");
    require(newLevel > info.trustLevel, "Must upgrade");

    if (newLevel == 2) {
        require(_validExchangeProof(proof1), "Invalid exchange proof for Level 2");
    }

    if (newLevel == 3) {
        require(_validExchangeProof(proof1), "Level 3 needs valid exchange proof");
        require(_validAuditProof(proof2), "Level 3 needs valid audit proof");
    }

    info.trustLevel = newLevel;
    IBadgeNFT(badgeNFTAddress).mintBadge(info.registeredBy, newLevel);
    emit BadgeLevelUpdated(token, newLevel);
}

function daoDowngradeTrustLevel(
    address token,
    uint8 newLevel,
    string memory proof1,
    string memory /* proof2 */
) 
    external onlyDAO notPaused {

    require(token != address(0), "Invalid token");
    require(registeredTokens[token].isRegistered, "Token not registered");

    TokenInfo storage info = registeredTokens[token];
    bytes32 id = visualID(info.name, info.symbol);

    require(!globalBanList[id], "Token is globally banned");
    require(!quarantineList[id], "Token is quarantined - unquarantine first");

    require(newLevel != info.trustLevel, "No change");
    require(newLevel < info.trustLevel, "Must downgrade");

    // No proof needed for downgrade to L1
    if (newLevel == 2) require(bytes(proof1).length > 0, "To Level 2 needs proof1");
    if (newLevel == 1) {
        // Level 1 is basic fallback; allow drop with empty proofs
    }

    info.trustLevel = newLevel;
    IBadgeNFT(badgeNFTAddress).mintBadge(info.registeredBy, newLevel);
    emit BadgeLevelUpdated(token, newLevel);
}
// ════════════════════════════════
// 🌐 DAO-Controlled Trusted Domain Lists
// ════════════════════════════════

function addTrustedExchange(string memory domain) external onlyDAO {
    require(bytes(domain).length > 3, "Invalid domain");
    allowedExchanges[domain] = true;
}

function addTrustedAuditor(string memory domain) external onlyDAO {
    require(bytes(domain).length > 3, "Invalid domain");
    allowedAuditors[domain] = true;
}

function removeTrustedExchange(string memory domain) external onlyDAO {
    allowedExchanges[domain] = false;
}

function removeTrustedAuditor(string memory domain) external onlyDAO {
    allowedAuditors[domain] = false;
}

// Optional helper to find token by name+symbol if needed

function getTokenByNameSymbol(string memory name, string memory symbol) internal view returns (address) {
    bytes32 id = visualID(name, symbol);

    // Loop (costly but used only in DAO context)
    for (uint256 i = 0; i < allRegisteredTokens.length; i++) {
        address token = allRegisteredTokens[i];
        if (
            registeredTokens[token].isRegistered &&
            visualID(registeredTokens[token].name, registeredTokens[token].symbol) == id
        ) {
            return token;
        }
    }

    return address(0);
}

    // ════════════════════════════════
    // 🧬 Self-Healing & Recovery
    // ════════════════════════════════

    function selfHeal(address[] memory all) external onlyOwner {
    for (uint256 i = 0; i < all.length; i++) {
        address token1 = all[i];
        if (!registeredTokens[token1].isRegistered) continue;
        TokenInfo memory info1 = registeredTokens[token1];
        bytes32 nameSymbolHash = visualID(info1.name, info1.symbol);
        address oldest = token1;
        uint256 oldestTime = info1.timestamp;

        // ✅ Find oldest token for this (name+symbol)
        for (uint256 j = 0; j < all.length; j++) {
            address token2 = all[j];
            if (token1 == token2 || !registeredTokens[token2].isRegistered) continue;
            TokenInfo memory info2 = registeredTokens[token2];
            if (visualID(info2.name, info2.symbol) == nameSymbolHash && info2.timestamp < oldestTime) {
                oldest = token2;
                oldestTime = info2.timestamp;
            }
        }

        // ✅ Purge all other clones strictly
        for (uint256 j = 0; j < all.length; j++) {
            address token = all[j];
            if (!registeredTokens[token].isRegistered) continue;
            TokenInfo memory info = registeredTokens[token];
            if (visualID(info.name, info.symbol) == nameSymbolHash && token != oldest) {
                delete registeredTokens[token];
                emit SelfHealTriggered(info.name, info.symbol, token, msg.sender);
            }
        }

        // ✅ Hard reset nameSymbolToAddress to only the oldest
        if (nameSymbolToAddress[nameSymbolHash] != oldest) {
            nameSymbolToAddress[nameSymbolHash] = oldest;
        }
    }
}

    // ════════════════════════════════
    // 💼 Owner Utilities
    // ════════════════════════════════

    function updateMinFee(uint256 newFee) external onlyOwner {
        minTPNFee = newFee;
        emit MinFeeUpdated(newFee);
    }
    function pauseRegistry() external onlyOwner {
    paused = true;
    emit RegistryPaused();
}

    function unpauseRegistry() external onlyOwner {
    paused = false;
    emit RegistryUnpaused();
}

    function transferOwnership(address newOwner) public override onlyOwner {
    _transferOwnership(newOwner);
}

    function batchBanTokens(string[] memory names, string[] memory symbols) public onlyOwner {
        require(names.length == symbols.length, "Input mismatch");
        for (uint256 i = 0; i < names.length; i++) {
            bytes32 banHash = visualID(names[i], symbols[i]);
            if (!globalBanList[banHash]) {
                globalBanList[banHash] = true;
                emit TokenGloballyBanned(names[i], symbols[i]);
            }
        }
    }

    // ════════════════════════════════
    // 🔍 Read-Only View Functions
    // ════════════════════════════════

    function getTokenInfo(address tokenAddress) external view returns (
    string memory name,
    string memory symbol,
    address tokenAddr,
    address creator,
    uint256 timestamp,
    string memory proof1,
    string memory proof2,
    uint8 trustLevel,
    bool isRegistered,
    bool upgradeRequested
) {
    TokenInfo memory info = registeredTokens[tokenAddress];
    return (
        info.name,
        info.symbol,
        info.tokenAddress,
        info.registeredBy,
        info.timestamp,
        info.proof1,
        info.proof2,
        info.trustLevel,
        info.isRegistered,
        info.upgradeRequested
    );
}


    function getTokenLogbook() external view returns (TokenInfo[] memory) {
        return tokenLogbook;
    }

    function isGloballyBanned(string memory name, string memory symbol) external view returns (bool) {
        return globalBanList[visualID(name, symbol)];
    }

    function isInSuspicionList(string memory name, string memory symbol) external view returns (bool) {
        return suspicionList[visualID(name, symbol)];
    }

    function isQuarantined(string memory name, string memory symbol) external view returns (bool) {
        return quarantineList[visualID(name, symbol)];
    }
    function isDAOPunished(string memory name, string memory symbol) external view returns (bool) {
    return daoPunishmentBan[visualID(name, symbol)];
    
    }
    function isPaused() external view returns (bool) {
        return paused;
    }
    function getProofLinks(address token) external view returns (string memory proof1, string memory proof2) {
    TokenInfo memory info = registeredTokens[token];
    require(info.isRegistered, "Token not registered");
    return (info.proof1, info.proof2);
}
    function getTokenBadgeMetadata(address token) external view returns (BadgeMetadata memory) {
    TokenInfo storage info = registeredTokens[token]; // storage instead of memory

    string memory levelName;
    string memory levelColor;

    if (info.trustLevel == 1) {
        levelName = "Basic Trust";
        levelColor = "#FFD700";
    } else if (info.trustLevel == 2) {
        levelName = "Exchange Verified";
        levelColor = "#00FF00";
    } else if (info.trustLevel == 3) {
        levelName = "Audited & Exchange Verified";
        levelColor = "#800080";
    } else {
        levelName = "Unverified";
        levelColor = "#FFFFFF";
    }

    return BadgeMetadata({
        name: info.name,
        symbol: info.symbol,
        trustLevel: info.trustLevel,
        levelName: levelName,
        levelColor: levelColor,
        timestamp: info.timestamp
    });
}


// ✅ Minimal trust level getter for frontend compatibility

function getTrustLevel(address token) external view returns (uint8) {
    return registeredTokens[token].trustLevel;
}
function _validExchangeProof(string memory url) internal view returns (bool) {
    return _matchAllowedDomain(url, allowedExchanges);
}

function _validAuditProof(string memory url) internal view returns (bool) {
    return _matchAllowedDomain(url, allowedAuditors);
}

function _contains(string memory str, string memory substr) internal pure returns (bool) {
    return bytes(str).length >= bytes(substr).length &&
           bytes(substr).length > 2 &&
           _indexOf(str, substr) != -1;
}

function _indexOf(string memory haystack, string memory needle) internal pure returns (int256) {
    bytes memory h = bytes(haystack);
    bytes memory n = bytes(needle);
    if(n.length > h.length) return -1;
    for (uint i = 0; i <= h.length - n.length; i++) {
        bool matchFound = true;
        for (uint j = 0; j < n.length; j++) {
            if (h[i + j] != n[j]) {
                matchFound = false;
                break;
            }
        }
        if (matchFound) return int256(i);
    }
    return -1;
}

// ✅ Shared domain match utility for proof validation

function _matchAllowedDomain(string memory url, mapping(string => bool) storage domainMap) internal view returns (bool) {
    // Optional safety fallback: loop a reasonable sample of domains
    string[4] memory fallbackDomains = ["binance.com", "coinbase.com", "certik.com", "trailofbits.com"];
    for (uint256 i = 0; i < fallbackDomains.length; i++) {
        if (domainMap[fallbackDomains[i]] && _contains(url, fallbackDomains[i])) {
            return true;
        }
    }
    return false;
}

}








































































