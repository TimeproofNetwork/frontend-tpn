const missingBanTokens = [
  {
    "name": "Bitcoin",
    "symbol": "BTC"
  },
  {
    "name": "Ethereum",
    "symbol": "ETH"
  },
  {
    "name": "Tether",
    "symbol": "USDT"
  },
  {
    "name": "XRP",
    "symbol": "XRP"
  },
  {
    "name": "BNB",
    "symbol": "BNB"
  },
  {
    "name": "Solana",
    "symbol": "SOL"
  },
  {
    "name": "USDC",
    "symbol": "USDC"
  },
  {
    "name": "Dogecoin",
    "symbol": "DOGE"
  },
  {
    "name": "TRON",
    "symbol": "TRX"
  },
  {
    "name": "Cardano",
    "symbol": "ADA"
  },
  {
    "name": "Lido Staked Ether",
    "symbol": "STETH"
  },
  {
    "name": "Wrapped Bitcoin",
    "symbol": "WBTC"
  },
  {
    "name": "Hyperliquid",
    "symbol": "HYPE"
  },
  {
    "name": "Sui",
    "symbol": "SUI"
  },
  {
    "name": "Wrapped stETH",
    "symbol": "WSTETH"
  },
  {
    "name": "Chainlink",
    "symbol": "LINK"
  },
  {
    "name": "Avalanche",
    "symbol": "AVAX"
  },
  {
    "name": "LEO Token",
    "symbol": "LEO"
  },
  {
    "name": "Bitcoin Cash",
    "symbol": "BCH"
  },
  {
    "name": "Stellar",
    "symbol": "XLM"
  },
  {
    "name": "Toncoin",
    "symbol": "TON"
  },
  {
    "name": "Shiba Inu",
    "symbol": "SHIB"
  },
  {
    "name": "USDS",
    "symbol": "USDS"
  },
  {
    "name": "Hedera",
    "symbol": "HBAR"
  },
  {
    "name": "WETH",
    "symbol": "WETH"
  },
  {
    "name": "Litecoin",
    "symbol": "LTC"
  },
  {
    "name": "Wrapped eETH",
    "symbol": "WEETH"
  },
  {
    "name": "Polkadot",
    "symbol": "DOT"
  },
  {
    "name": "Monero",
    "symbol": "XMR"
  },
  {
    "name": "Binance Bridged USDT (BNB Smart Chain)",
    "symbol": "BSC-USD"
  },
  {
    "name": "Ethena USDe",
    "symbol": "USDE"
  },
  {
    "name": "Bitget Token",
    "symbol": "BGB"
  },
  {
    "name": "Pepe",
    "symbol": "PEPE"
  },
  {
    "name": "Coinbase Wrapped BTC",
    "symbol": "CBBTC"
  },
  {
    "name": "Pi Network",
    "symbol": "PI"
  },
  {
    "name": "WhiteBIT Coin",
    "symbol": "WBT"
  },
  {
    "name": "Aave",
    "symbol": "AAVE"
  },
  {
    "name": "Uniswap",
    "symbol": "UNI"
  },
  {
    "name": "Dai",
    "symbol": "DAI"
  },
  {
    "name": "Ethena Staked USDe",
    "symbol": "SUSDE"
  },
  {
    "name": "Bittensor",
    "symbol": "TAO"
  },
  {
    "name": "OKB",
    "symbol": "OKB"
  },
  {
    "name": "Internet Computer",
    "symbol": "ICP"
  },
  {
    "name": "Cronos",
    "symbol": "CRO"
  },
  {
    "name": "Aptos",
    "symbol": "APT"
  },
  {
    "name": "NEAR Protocol",
    "symbol": "NEAR"
  },
  {
    "name": "BlackRock USD Institutional Digital Liquidity Fund",
    "symbol": "BUIDL"
  },
  {
    "name": "Jito Staked SOL",
    "symbol": "JITOSOL"
  },
  {
    "name": "Ondo",
    "symbol": "ONDO"
  },
  {
    "name": "sUSDS",
    "symbol": "SUSDS"
  },
  {
    "name": "Ethereum Classic",
    "symbol": "ETC"
  },
  {
    "name": "Tokenize Xchange",
    "symbol": "TKX"
  },
  {
    "name": "Kaspa",
    "symbol": "KAS"
  },
  {
    "name": "Gate",
    "symbol": "GT"
  },
  {
    "name": "USD1",
    "symbol": "USD1"
  },
  {
    "name": "Mantle",
    "symbol": "MNT"
  },
  {
    "name": "Official Trump",
    "symbol": "TRUMP"
  },
  {
    "name": "VeChain",
    "symbol": "VET"
  },
  {
    "name": "Render",
    "symbol": "RENDER"
  },
  {
    "name": "Ethena",
    "symbol": "ENA"
  },
  {
    "name": "Artificial Superintelligence Alliance",
    "symbol": "FET"
  },
  {
    "name": "Cosmos Hub",
    "symbol": "ATOM"
  },
  {
    "name": "Fasttoken",
    "symbol": "FTN"
  },
  {
    "name": "POL (ex-MATIC)",
    "symbol": "POL"
  },
  {
    "name": "Lombard Staked BTC",
    "symbol": "LBTC"
  },
  {
    "name": "Quant",
    "symbol": "QNT"
  },
  {
    "name": "Worldcoin",
    "symbol": "WLD"
  },
  {
    "name": "Filecoin",
    "symbol": "FIL"
  },
  {
    "name": "Arbitrum",
    "symbol": "ARB"
  },
  {
    "name": "Algorand",
    "symbol": "ALGO"
  },
  {
    "name": "First Digital USD",
    "symbol": "FDUSD"
  },
  {
    "name": "Sky",
    "symbol": "SKY"
  },
  {
    "name": "Jupiter Perpetuals Liquidity Provider Token",
    "symbol": "JLP"
  },
  {
    "name": "Binance-Peg WETH",
    "symbol": "WETH"
  },
  {
    "name": "USDtb",
    "symbol": "USDTB"
  },
  {
    "name": "USDT0",
    "symbol": "USDT0"
  },
  {
    "name": "KuCoin",
    "symbol": "KCS"
  },
  {
    "name": "Jupiter",
    "symbol": "JUP"
  },
  {
    "name": "Binance Staked SOL",
    "symbol": "BNSOL"
  },
  {
    "name": "Celestia",
    "symbol": "TIA"
  },
  {
    "name": "Injective",
    "symbol": "INJ"
  },
  {
    "name": "NEXO",
    "symbol": "NEXO"
  },
  {
    "name": "Flare",
    "symbol": "FLR"
  },
  {
    "name": "Bonk",
    "symbol": "BONK"
  },
  {
    "name": "Sonic",
    "symbol": "S"
  },
  {
    "name": "SPX6900",
    "symbol": "SPX"
  },
  {
    "name": "Rocket Pool ETH",
    "symbol": "RETH"
  },
  {
    "name": "Virtuals Protocol",
    "symbol": "VIRTUAL"
  },
  {
    "name": "Story",
    "symbol": "IP"
  },
  {
    "name": "Kelp DAO Restaked ETH",
    "symbol": "RSETH"
  },
  {
    "name": "Fartcoin",
    "symbol": "FARTCOIN"
  },
  {
    "name": "Polygon Bridged USDT (Polygon)",
    "symbol": "USDT"
  },
  {
    "name": "Optimism",
    "symbol": "OP"
  },
  {
    "name": "Sei",
    "symbol": "SEI"
  },
  {
    "name": "PayPal USD",
    "symbol": "PYUSD"
  },
  {
    "name": "Binance Bridged USDC (BNB Smart Chain)",
    "symbol": "USDC"
  },
  {
    "name": "XDC Network",
    "symbol": "XDC"
  },
  {
    "name": "Stacks",
    "symbol": "STX"
  },
  {
    "name": "Solv Protocol BTC",
    "symbol": "SOLVBTC"
  },
  {
    "name": "Immutable",
    "symbol": "IMX"
  },
  {
    "name": "Mantle Staked Ether",
    "symbol": "METH"
  },
  {
    "name": "StakeWise Staked ETH",
    "symbol": "OSETH"
  },
  {
    "name": "Vaulta",
    "symbol": "A"
  },
  {
    "name": "dogwifhat",
    "symbol": "WIF"
  },
  {
    "name": "Wrapped BNB",
    "symbol": "WBNB"
  },
  {
    "name": "Curve DAO",
    "symbol": "CRV"
  },
  {
    "name": "The Graph",
    "symbol": "GRT"
  },
  {
    "name": "Arbitrum Bridged WBTC (Arbitrum One)",
    "symbol": "WBTC"
  },
  {
    "name": "Renzo Restaked ETH",
    "symbol": "EZETH"
  },
  {
    "name": "Tether Gold",
    "symbol": "XAUT"
  },
  {
    "name": "clBTC",
    "symbol": "CLBTC"
  },
  {
    "name": "PAX Gold",
    "symbol": "PAXG"
  },
  {
    "name": "FLOKI",
    "symbol": "FLOKI"
  },
  {
    "name": "Zcash",
    "symbol": "ZEC"
  },
  {
    "name": "Jupiter Staked SOL",
    "symbol": "JUPSOL"
  },
  {
    "name": "PancakeSwap",
    "symbol": "CAKE"
  },
  {
    "name": "Theta Network",
    "symbol": "THETA"
  },
  {
    "name": "Lido DAO",
    "symbol": "LDO"
  },
  {
    "name": "Marinade Staked SOL",
    "symbol": "MSOL"
  },
  {
    "name": "GALA",
    "symbol": "GALA"
  },
  {
    "name": "Kaia",
    "symbol": "KAIA"
  },
  {
    "name": "SyrupUSDC",
    "symbol": "SYRUPUSDC"
  },
  {
    "name": "OUSG",
    "symbol": "OUSG"
  },
  {
    "name": "IOTA",
    "symbol": "IOTA"
  },
  {
    "name": "BitTorrent",
    "symbol": "BTT"
  },
  {
    "name": "JasmyCoin",
    "symbol": "JASMY"
  },
  {
    "name": "Ethereum Name Service",
    "symbol": "ENS"
  },
  {
    "name": "Stables Labs USDX",
    "symbol": "USDX"
  },
  {
    "name": "The Sandbox",
    "symbol": "SAND"
  },
  {
    "name": "Pyth Network",
    "symbol": "PYTH"
  },
  {
    "name": "Keeta",
    "symbol": "KTA"
  },
  {
    "name": "Walrus",
    "symbol": "WAL"
  },
  {
    "name": "Raydium",
    "symbol": "RAY"
  },
  {
    "name": "Bitcoin SV",
    "symbol": "BSV"
  },
  {
    "name": "Pendle",
    "symbol": "PENDLE"
  },
  {
    "name": "Usual USD",
    "symbol": "USD0"
  },
  {
    "name": "Solv Protocol Staked BTC",
    "symbol": "XSOLVBTC"
  },
  {
    "name": "Pudgy Penguins",
    "symbol": "PENGU"
  },
  {
    "name": "Polyhedra Network",
    "symbol": "ZKJ"
  },
  {
    "name": "Jito",
    "symbol": "JTO"
  },
  {
    "name": "Core",
    "symbol": "CORE"
  },
  {
    "name": "Tezos",
    "symbol": "XTZ"
  },
  {
    "name": "Ondo US Dollar Yield",
    "symbol": "USDY"
  },
  {
    "name": "Saros",
    "symbol": "SAROS"
  },
  {
    "name": "L2 Standard Bridged WETH (Base)",
    "symbol": "WETH"
  },
  {
    "name": "Falcon USD",
    "symbol": "USDF"
  },
  {
    "name": "Flow",
    "symbol": "FLOW"
  },
  {
    "name": "THORChain",
    "symbol": "RUNE"
  },
  {
    "name": "Grass",
    "symbol": "GRASS"
  },
  {
    "name": "Super OETH",
    "symbol": "SUPEROETH"
  },
  {
    "name": "ApeCoin",
    "symbol": "APE"
  },
  {
    "name": "Ket",
    "symbol": "KET"
  },
  {
    "name": "Helium",
    "symbol": "HNT"
  },
  {
    "name": "Decentraland",
    "symbol": "MANA"
  },
  {
    "name": "cgETH Hashkey Cloud",
    "symbol": "CGETH.HASHKEY"
  },
  {
    "name": "Wrapped HYPE",
    "symbol": "WHYPE"
  },
  {
    "name": "Avalanche Bridged BTC (Avalanche)",
    "symbol": "BTC.B"
  },
  {
    "name": "Mantle Restaked ETH",
    "symbol": "CMETH"
  },
  {
    "name": "DeXe",
    "symbol": "DEXE"
  },
  {
    "name": "Arbitrum Bridged WETH (Arbitrum One)",
    "symbol": "WETH"
  },
  {
    "name": "tBTC",
    "symbol": "TBTC"
  },
  {
    "name": "TrueUSD",
    "symbol": "TUSD"
  },
  {
    "name": "Brett",
    "symbol": "BRETT"
  },
  {
    "name": "Liquid Staked ETH",
    "symbol": "LSETH"
  },
  {
    "name": "Kava",
    "symbol": "KAVA"
  },
  {
    "name": "Onyxcoin",
    "symbol": "XCN"
  },
  {
    "name": "Binance-Peg Dogecoin",
    "symbol": "DOGE"
  },
  {
    "name": "Beldex",
    "symbol": "BDX"
  },
  {
    "name": "Bridged USDC (Polygon PoS Bridge)",
    "symbol": "USDC.E"
  },
  {
    "name": "USDD",
    "symbol": "USDD"
  },
  {
    "name": "Dog (Bitcoin)",
    "symbol": "DOG"
  },
  {
    "name": "Aethir",
    "symbol": "ATH"
  },
  {
    "name": "Starknet",
    "symbol": "STRK"
  },
  {
    "name": "eCash",
    "symbol": "XEC"
  },
  {
    "name": "MultiversX",
    "symbol": "EGLD"
  },
  {
    "name": "pumpBTC",
    "symbol": "PUMPBTC"
  },
  {
    "name": "Eigenlayer",
    "symbol": "EIGEN"
  },
  {
    "name": "Maple Finance",
    "symbol": "SYRUP"
  },
  {
    "name": "Aerodrome Finance",
    "symbol": "AERO"
  },
  {
    "name": "APENFT",
    "symbol": "NFT"
  },
  {
    "name": "Conflux",
    "symbol": "CFX"
  },
  {
    "name": "dYdX",
    "symbol": "DYDX"
  },
  {
    "name": "NEO",
    "symbol": "NEO"
  },
  {
    "name": "EOS",
    "symbol": "EOS"
  },
  {
    "name": "Arweave",
    "symbol": "AR"
  },
  {
    "name": "Compound",
    "symbol": "COMP"
  },
  {
    "name": "Circle USYC",
    "symbol": "USYC"
  },
  {
    "name": "USDB",
    "symbol": "USDB"
  },
  {
    "name": "MimbleWimbleCoin",
    "symbol": "MWC"
  },
  {
    "name": "Morpho",
    "symbol": "MORPHO"
  },
  {
    "name": "ether.fi Staked ETH",
    "symbol": "EETH"
  },
  {
    "name": "Axie Infinity",
    "symbol": "AXS"
  },
  {
    "name": "Staked HYPE",
    "symbol": "STHYPE"
  },
  {
    "name": "Reserve Rights",
    "symbol": "RSR"
  },
  {
    "name": "AIOZ Network",
    "symbol": "AIOZ"
  },
  {
    "name": "Ripple USD",
    "symbol": "RLUSD"
  },
  {
    "name": "KAITO",
    "symbol": "KAITO"
  },
  {
    "name": "Movement",
    "symbol": "MOVE"
  },
  {
    "name": "Mantle Bridged USDT (Mantle)",
    "symbol": "USDT"
  },
  {
    "name": "Telcoin",
    "symbol": "TEL"
  },
  {
    "name": "Ether.fi",
    "symbol": "ETHFI"
  },
  {
    "name": "Stader ETHx",
    "symbol": "ETHX"
  },
  {
    "name": "Sun Token",
    "symbol": "SUN"
  },
  {
    "name": "Zebec Network",
    "symbol": "ZBCN"
  },
  {
    "name": "Chiliz",
    "symbol": "CHZ"
  },
  {
    "name": "DeepBook",
    "symbol": "DEEP"
  },
  {
    "name": "Popcat",
    "symbol": "POPCAT"
  },
  {
    "name": "Ronin",
    "symbol": "RON"
  },
  {
    "name": "BUILDon",
    "symbol": "B"
  },
  {
    "name": "Coinbase Wrapped Staked ETH",
    "symbol": "CBETH"
  },
  {
    "name": "Akash Network",
    "symbol": "AKT"
  },
  {
    "name": "Ether.fi Staked BTC",
    "symbol": "EBTC"
  },
  {
    "name": "JUST",
    "symbol": "JST"
  },
  {
    "name": "Polygon Bridged WBTC (Polygon POS)",
    "symbol": "WBTC"
  },
  {
    "name": "Mog Coin",
    "symbol": "MOG"
  },
  {
    "name": "Wormhole",
    "symbol": "W"
  },
  {
    "name": "Swell Ethereum",
    "symbol": "SWETH"
  },
  {
    "name": "Beam",
    "symbol": "BEAM"
  },
  {
    "name": "Trust Wallet",
    "symbol": "TWT"
  },
  {
    "name": "Amp",
    "symbol": "AMP"
  },
  {
    "name": "Terra Luna Classic",
    "symbol": "LUNC"
  },
  {
    "name": "Olympus",
    "symbol": "OHM"
  },
  {
    "name": "Legacy Frax Dollar",
    "symbol": "FRAX"
  },
  {
    "name": "Gnosis",
    "symbol": "GNO"
  },
  {
    "name": "Polygon PoS Bridged WETH (Polygon POS)",
    "symbol": "WETH"
  },
  {
    "name": "Polygon",
    "symbol": "MATIC"
  },
  {
    "name": "Wrapped AVAX",
    "symbol": "WAVAX"
  },
  {
    "name": "Binance-Peg BUSD",
    "symbol": "BUSD"
  },
  {
    "name": "Bybit Staked SOL",
    "symbol": "BBSOL"
  },
  {
    "name": "Livepeer",
    "symbol": "LPT"
  },
  {
    "name": "Axelar",
    "symbol": "AXL"
  },
  {
    "name": "Frax Ether",
    "symbol": "FRXETH"
  },
  {
    "name": "Creditcoin",
    "symbol": "CTC"
  },
  {
    "name": "Plume",
    "symbol": "PLUME"
  },
  {
    "name": "Cheems Token",
    "symbol": "CHEEMS"
  },
  {
    "name": "Global Dollar",
    "symbol": "USDG"
  },
  {
    "name": "MANTRA",
    "symbol": "OM"
  },
  {
    "name": "SuperVerse",
    "symbol": "SUPER"
  },
  {
    "name": "Berachain",
    "symbol": "BERA"
  },
  {
    "name": "Safe",
    "symbol": "SAFE"
  },
  {
    "name": "1inch",
    "symbol": "1INCH"
  },
  {
    "name": "Turbo",
    "symbol": "TURBO"
  },
  {
    "name": "cat in a dogs world",
    "symbol": "MEW"
  },
  {
    "name": "aBTC",
    "symbol": "ABTC"
  },
  {
    "name": "OpenEden OpenDollar",
    "symbol": "USDO"
  },
  {
    "name": "Ravencoin",
    "symbol": "RVN"
  },
  {
    "name": "cWBTC",
    "symbol": "CWBTC"
  },
  {
    "name": "BENQI Liquid Staked AVAX",
    "symbol": "SAVAX"
  },
  {
    "name": "BTSE Token",
    "symbol": "BTSE"
  },
  {
    "name": "Kusama",
    "symbol": "KSM"
  },
  {
    "name": "Compounding OpenDollar",
    "symbol": "CUSDO"
  },
  {
    "name": "Dash",
    "symbol": "DASH"
  },
  {
    "name": "Peanut the Squirrel",
    "symbol": "PNUT"
  },
  {
    "name": "Aave USDC (Sonic)",
    "symbol": "ASONUSDC"
  },
  {
    "name": "Polygon PoS Bridged DAI (Polygon POS)",
    "symbol": "DAI"
  },
  {
    "name": "MX",
    "symbol": "MX"
  },
  {
    "name": "Decred",
    "symbol": "DCR"
  },
  {
    "name": "Venom",
    "symbol": "VENOM"
  },
  {
    "name": "Frax (prev. FXS)",
    "symbol": "FRAX"
  },
  {
    "name": "Mina Protocol",
    "symbol": "MINA"
  },
  {
    "name": "Drift Staked SOL",
    "symbol": "DSOL"
  },
  {
    "name": "Trip",
    "symbol": "TRIP"
  },
  {
    "name": "Theta Fuel",
    "symbol": "TFUEL"
  },
  {
    "name": "SafePal",
    "symbol": "SFP"
  },
  {
    "name": "ai16z",
    "symbol": "AI16Z"
  },
  {
    "name": "Golem",
    "symbol": "GLM"
  },
  {
    "name": "Staked Frax Ether",
    "symbol": "SFRXETH"
  },
  {
    "name": "LayerZero",
    "symbol": "ZRO"
  },
  {
    "name": "Notcoin",
    "symbol": "NOT"
  },
  {
    "name": "Moca Network",
    "symbol": "MOCA"
  },
  {
    "name": "Astar",
    "symbol": "ASTR"
  },
  {
    "name": "Baby Doge Coin",
    "symbol": "BABYDOGE"
  },
  {
    "name": "Zilliqa",
    "symbol": "ZIL"
  },
  {
    "name": "GHO",
    "symbol": "GHO"
  },
  {
    "name": "Convex Finance",
    "symbol": "CVX"
  },
  {
    "name": "Toshi",
    "symbol": "TOSHI"
  },
  {
    "name": "ETHPlus",
    "symbol": "ETH+"
  },
  {
    "name": "Resolv USR",
    "symbol": "USR"
  },
  {
    "name": "Arkham",
    "symbol": "ARKM"
  },
  {
    "name": "Synthetix Network",
    "symbol": "SNX"
  },
  {
    "name": "Qtum",
    "symbol": "QTUM"
  },
  {
    "name": "KOGE",
    "symbol": "KOGE"
  },
  {
    "name": "Spiko EU T-Bills Money Market Fund",
    "symbol": "EUTBL"
  },
  {
    "name": "Treehouse ETH",
    "symbol": "TETH"
  },
  {
    "name": "Gigachad",
    "symbol": "GIGA"
  },
  {
    "name": "Universal BTC",
    "symbol": "UNIBTC"
  },
  {
    "name": "Blur",
    "symbol": "BLUR"
  },
  {
    "name": "Lagrange",
    "symbol": "LA"
  },
  {
    "name": "0x Protocol",
    "symbol": "ZRX"
  },
  {
    "name": "EURC",
    "symbol": "EURC"
  },
  {
    "name": "Oasis",
    "symbol": "ROSE"
  },
  {
    "name": "Evolve",
    "symbol": "EVOLVE"
  },
  {
    "name": "Animecoin",
    "symbol": "ANIME"
  },
  {
    "name": "Verus",
    "symbol": "VRSC"
  },
  {
    "name": "Moo Deng",
    "symbol": "MOODENG"
  },
  {
    "name": "Basic Attention",
    "symbol": "BAT"
  },
  {
    "name": "Solana Swap",
    "symbol": "SOS"
  },
  {
    "name": "ZKsync",
    "symbol": "ZK"
  },
  {
    "name": "USDa",
    "symbol": "USDA"
  },
  {
    "name": "IoTeX",
    "symbol": "IOTX"
  },
  {
    "name": "CHEX Token",
    "symbol": "CHEX"
  },
  {
    "name": "SwissBorg",
    "symbol": "BORG"
  },
  {
    "name": "Gas",
    "symbol": "GAS"
  },
  {
    "name": "AgentFun.AI",
    "symbol": "AGENTFUN"
  },
  {
    "name": "Infrared Bera",
    "symbol": "IBERA"
  },
  {
    "name": "VeThor",
    "symbol": "VTHO"
  },
  {
    "name": "Tradable NA Rent Financing Platform SSTN",
    "symbol": "PC0000031"
  },
  {
    "name": "Wrapped Beacon ETH",
    "symbol": "WBETH"
  },
  {
    "name": "Tribe",
    "symbol": "TRIBE"
  },
  {
    "name": "Nervos Network",
    "symbol": "CKB"
  },
  {
    "name": "Wrapped Ether (Mantle Bridge)",
    "symbol": "WETH"
  },
  {
    "name": "OriginTrail",
    "symbol": "TRAC"
  },
  {
    "name": "ZetaChain",
    "symbol": "ZETA"
  },
  {
    "name": "Snek",
    "symbol": "SNEK"
  },
  {
    "name": "Vana",
    "symbol": "VANA"
  },
  {
    "name": "ICON",
    "symbol": "ICX"
  },
  {
    "name": "Siacoin",
    "symbol": "SC"
  },
  {
    "name": "Celo",
    "symbol": "CELO"
  },
  {
    "name": "Elixir deUSD",
    "symbol": "DEUSD"
  },
  {
    "name": "WEMIX",
    "symbol": "WEMIX"
  },
  {
    "name": "Launch Coin on Believe",
    "symbol": "LAUNCHCOIN"
  },
  {
    "name": "ORDI",
    "symbol": "ORDI"
  },
  {
    "name": "CoW Protocol",
    "symbol": "COW"
  },
  {
    "name": "Freysa AI",
    "symbol": "FAI"
  },
  {
    "name": "GoMining Token",
    "symbol": "GOMINING"
  },
  {
    "name": "Neiro",
    "symbol": "NEIRO"
  },
  {
    "name": "yearn.finance",
    "symbol": "YFI"
  },
  {
    "name": "Stargate Finance",
    "symbol": "STG"
  },
  {
    "name": "Qubic",
    "symbol": "QUBIC"
  },
  {
    "name": "Steakhouse USDC Morpho Vault",
    "symbol": "STEAKUSDC"
  },
  {
    "name": "Casper Network",
    "symbol": "CSPR"
  },
  {
    "name": "Holo",
    "symbol": "HOT"
  },
  {
    "name": "Echelon Prime",
    "symbol": "PRIME"
  },
  {
    "name": "Harmony",
    "symbol": "ONE"
  },
  {
    "name": "SKOR AI",
    "symbol": "SKORAI"
  },
  {
    "name": "aixbt by Virtuals",
    "symbol": "AIXBT"
  },
  {
    "name": "Aster Staked BNB",
    "symbol": "ASBNB"
  },
  {
    "name": "aelf",
    "symbol": "ELF"
  },
  {
    "name": "Binance-Peg SOL",
    "symbol": "SOL"
  },
  {
    "name": "CoinEx",
    "symbol": "CET"
  },
  {
    "name": "Mask Network",
    "symbol": "MASK"
  },
  {
    "name": "Blockchain Capital",
    "symbol": "BCAP"
  },
  {
    "name": "Polymesh",
    "symbol": "POLYX"
  },
  {
    "name": "Horizen",
    "symbol": "ZEN"
  },
  {
    "name": "Ankr Network",
    "symbol": "ANKR"
  },
  {
    "name": "GMX",
    "symbol": "GMX"
  },
  {
    "name": "DigiByte",
    "symbol": "DGB"
  },
  {
    "name": "Chia",
    "symbol": "XCH"
  },
  {
    "name": "crvUSD",
    "symbol": "CRVUSD"
  },
  {
    "name": "UXLINK",
    "symbol": "UXLINK"
  },
  {
    "name": "Fluid",
    "symbol": "FLUID"
  },
  {
    "name": "Solayer",
    "symbol": "LAYER"
  },
  {
    "name": "Zano",
    "symbol": "ZANO"
  },
  {
    "name": "Kinesis Gold",
    "symbol": "KAU"
  },
  {
    "name": "EthereumPoW",
    "symbol": "ETHW"
  },
  {
    "name": "Nexus Mutual",
    "symbol": "NXM"
  },
  {
    "name": "XYO Network",
    "symbol": "XYO"
  },
  {
    "name": "Babylon",
    "symbol": "BABY"
  },
  {
    "name": "Bridged Ether (StarkGate)",
    "symbol": "ETH"
  },
  {
    "name": "Threshold Network",
    "symbol": "T"
  },
  {
    "name": "Euler",
    "symbol": "EUL"
  },
  {
    "name": "GMT",
    "symbol": "GMT"
  },
  {
    "name": "SQD",
    "symbol": "SQD"
  },
  {
    "name": "Purr",
    "symbol": "PURR"
  },
  {
    "name": "Drift Protocol",
    "symbol": "DRIFT"
  },
  {
    "name": "WOO",
    "symbol": "WOO"
  },
  {
    "name": "MAG7.ssi",
    "symbol": "MAG7.SSI"
  },
  {
    "name": "Osmosis",
    "symbol": "OSMO"
  },
  {
    "name": "STASIS EURO",
    "symbol": "EURS"
  },
  {
    "name": "Kinesis Silver",
    "symbol": "KAG"
  },
  {
    "name": "Wrapped fragSOL",
    "symbol": "WFRAGSOL"
  },
  {
    "name": "MimboGameGroup",
    "symbol": "MGG"
  },
  {
    "name": "Orca",
    "symbol": "ORCA"
  },
  {
    "name": "Kadena",
    "symbol": "KDA"
  },
  {
    "name": "Diverge Loop",
    "symbol": "DLC"
  },
  {
    "name": "Enjin Coin",
    "symbol": "ENJ"
  },
  {
    "name": "Coinshift USDL Morpho Vault",
    "symbol": "CSUSDL"
  },
  {
    "name": "ZIGChain",
    "symbol": "ZIG"
  },
  {
    "name": "Nano",
    "symbol": "XNO"
  },
  {
    "name": "Resolv RLP",
    "symbol": "RLP"
  },
  {
    "name": "Acet",
    "symbol": "ACT"
  },
  {
    "name": "GOHOME",
    "symbol": "GOHOME"
  },
  {
    "name": "World Mobile Token",
    "symbol": "WMTX"
  },
  {
    "name": "AWE Network",
    "symbol": "AWE"
  },
  {
    "name": "TDCCP",
    "symbol": "TDCCP"
  },
  {
    "name": "Cronos Bridged USDC (Cronos)",
    "symbol": "USDC"
  },
  {
    "name": "KUB Coin",
    "symbol": "KUB"
  },
  {
    "name": "Magic Eden",
    "symbol": "ME"
  },
  {
    "name": "Function ƒBTC",
    "symbol": "FBTC"
  },
  {
    "name": "BitDCA",
    "symbol": "BDCA"
  },
  {
    "name": "Level USD",
    "symbol": "LVLUSD"
  },
  {
    "name": "Tellor Tributes",
    "symbol": "TRB"
  },
  {
    "name": "Rollbit Coin",
    "symbol": "RLB"
  },
  {
    "name": "Resupply USD",
    "symbol": "REUSD"
  },
  {
    "name": "LMGroupToken",
    "symbol": "LMGX"
  },
  {
    "name": "AUSD",
    "symbol": "AUSD"
  },
  {
    "name": "BOOK OF MEME",
    "symbol": "BOME"
  },
  {
    "name": "COTI",
    "symbol": "COTI"
  },
  {
    "name": "Ontology",
    "symbol": "ONT"
  },
  {
    "name": "Sushi",
    "symbol": "SUSHI"
  },
  {
    "name": "io.net",
    "symbol": "IO"
  },
  {
    "name": "Cookie DAO",
    "symbol": "COOKIE"
  },
  {
    "name": "cETH",
    "symbol": "CETH"
  },
  {
    "name": "Anzen USDz",
    "symbol": "USDZ"
  },
  {
    "name": "SKALE",
    "symbol": "SKL"
  },
  {
    "name": "UMA",
    "symbol": "UMA"
  },
  {
    "name": "BORA",
    "symbol": "BORA"
  },
  {
    "name": "SWFTCOIN",
    "symbol": "SWFTC"
  },
  {
    "name": "Status",
    "symbol": "SNT"
  },
  {
    "name": "Goatseus Maximus",
    "symbol": "GOAT"
  },
  {
    "name": "Amnis Aptos",
    "symbol": "AMAPT"
  },
  {
    "name": "Melania Meme",
    "symbol": "MELANIA"
  },
  {
    "name": "Origin Ether",
    "symbol": "OETH"
  },
  {
    "name": "Aster USDF",
    "symbol": "USDF"
  },
  {
    "name": "Chutes",
    "symbol": "SN64"
  },
  {
    "name": "Sui Bridged USDT (Sui)",
    "symbol": "USDT"
  },
  {
    "name": "Metaplex",
    "symbol": "MPLX"
  },
  {
    "name": "VVS Finance",
    "symbol": "VVS"
  },
  {
    "name": "LCX",
    "symbol": "LCX"
  },
  {
    "name": "Illuvium",
    "symbol": "ILV"
  },
  {
    "name": "Verasity",
    "symbol": "VRA"
  },
  {
    "name": "Solar",
    "symbol": "SXP"
  },
  {
    "name": "Alchemist AI",
    "symbol": "ALCH"
  },
  {
    "name": "Terra",
    "symbol": "LUNA"
  },
  {
    "name": "Gamebitcoin Power",
    "symbol": "PWR"
  },
  {
    "name": "Lift Dollar",
    "symbol": "USDL"
  },
  {
    "name": "Incrypt",
    "symbol": "INC"
  },
  {
    "name": "Paycoin",
    "symbol": "PCI"
  },
  {
    "name": "Hive",
    "symbol": "HIVE"
  },
  {
    "name": "AI Companions",
    "symbol": "AIC"
  },
  {
    "name": "Mythos",
    "symbol": "MYTH"
  },
  {
    "name": "Big Time",
    "symbol": "BIGTIME"
  },
  {
    "name": "Rocket Pool",
    "symbol": "RPL"
  },
  {
    "name": "Hivemapper",
    "symbol": "HONEY"
  },
  {
    "name": "ViciCoin",
    "symbol": "VCNT"
  },
  {
    "name": "Constellation",
    "symbol": "DAG"
  },
  {
    "name": "Metis",
    "symbol": "METIS"
  },
  {
    "name": "Daku",
    "symbol": "DAKU"
  },
  {
    "name": "Rekt",
    "symbol": "REKT"
  },
  {
    "name": "Request",
    "symbol": "REQ"
  },
  {
    "name": "Resolv wstUSR",
    "symbol": "WSTUSR"
  },
  {
    "name": "Lorenzo stBTC",
    "symbol": "STBTC"
  },
  {
    "name": "Bio Protocol",
    "symbol": "BIO"
  },
  {
    "name": "Waves",
    "symbol": "WAVES"
  },
  {
    "name": "Noble Dollar (USDN)",
    "symbol": "USDN"
  },
  {
    "name": "Beets Staked Sonic",
    "symbol": "STS"
  },
  {
    "name": "Moonwell",
    "symbol": "WELL"
  },
  {
    "name": "Ozone Chain",
    "symbol": "OZO"
  },
  {
    "name": "sBTC",
    "symbol": "SBTC"
  },
  {
    "name": "Zenrock BTC",
    "symbol": "ZENBTC"
  },
  {
    "name": "Kamino",
    "symbol": "KMNO"
  },
  {
    "name": "Sologenic",
    "symbol": "SOLO"
  },
  {
    "name": "Siren",
    "symbol": "SIREN"
  },
  {
    "name": "TNQ",
    "symbol": "TNQ"
  },
  {
    "name": "Loopring",
    "symbol": "LRC"
  },
  {
    "name": "Hamster Kombat",
    "symbol": "HMSTR"
  },
  {
    "name": "Conscious Token",
    "symbol": "CONSCIOUS"
  },
  {
    "name": "Spiko US T-Bills Money Market Fund",
    "symbol": "USTBL"
  },
  {
    "name": "Entangle",
    "symbol": "NTGL"
  },
  {
    "name": "BULLA",
    "symbol": "BULLA"
  },
  {
    "name": "Band Protocol",
    "symbol": "BAND"
  },
  {
    "name": "Centrifuge [OLD]",
    "symbol": "CFG"
  },
  {
    "name": "Alchemy Pay",
    "symbol": "ACH"
  },
  {
    "name": "Venus",
    "symbol": "XVS"
  },
  {
    "name": "ConstitutionDAO",
    "symbol": "PEOPLE"
  },
  {
    "name": "Non-Playable Coin",
    "symbol": "NPC"
  },
  {
    "name": "Relend USDC",
    "symbol": "REUSDC"
  },
  {
    "name": "QL1 Bridged USDT (QL1)",
    "symbol": "QUSDT"
  },
  {
    "name": "Degen",
    "symbol": "DEGEN"
  },
  {
    "name": "Sophon",
    "symbol": "SOPH"
  },
  {
    "name": "IOST",
    "symbol": "IOST"
  },
  {
    "name": "PAAL AI",
    "symbol": "PAAL"
  },
  {
    "name": "Optimism Bridged WBTC (Optimism)",
    "symbol": "WBTC"
  },
  {
    "name": "Elixir Staked deUSD",
    "symbol": "SDEUSD"
  },
  {
    "name": "Verge",
    "symbol": "XVG"
  },
  {
    "name": "Venice Token",
    "symbol": "VVV"
  },
  {
    "name": "SingularityNET",
    "symbol": "AGIX"
  },
  {
    "name": "Prom",
    "symbol": "PROM"
  },
  {
    "name": "NKYC Token",
    "symbol": "NKYC"
  },
  {
    "name": "Solv Protocol SolvBTC Jupiter",
    "symbol": "SOLVBTC.JUP"
  },
  {
    "name": "XPR Network",
    "symbol": "XPR"
  },
  {
    "name": "PHALA",
    "symbol": "PHA"
  },
  {
    "name": "GAL (migrated to Gravity - G)",
    "symbol": "GAL"
  },
  {
    "name": "Velo",
    "symbol": "VELO"
  },
  {
    "name": "Biconomy",
    "symbol": "BICO"
  },
  {
    "name": "Pocket Network",
    "symbol": "POKT"
  },
  {
    "name": "Gravity (by Galxe)",
    "symbol": "G"
  },
  {
    "name": "Ribbita by Virtuals",
    "symbol": "TIBBIR"
  },
  {
    "name": "Usual",
    "symbol": "USUAL"
  },
  {
    "name": "BitMart",
    "symbol": "BMX"
  },
  {
    "name": "Initia",
    "symbol": "INIT"
  },
  {
    "name": "L2 Standard Bridged frxUSD",
    "symbol": "FRXUSD"
  },
  {
    "name": "Manta Network",
    "symbol": "MANTA"
  },
  {
    "name": "Restaked Swell ETH",
    "symbol": "RSWETH"
  },
  {
    "name": "RedStone",
    "symbol": "RED"
  },
  {
    "name": "Arbitrum Bridged USDC (Arbitrum)",
    "symbol": "USDC.E"
  },
  {
    "name": "Yield Guild Games",
    "symbol": "YGG"
  },
  {
    "name": "Delysium",
    "symbol": "AGI"
  },
  {
    "name": "SATS (Ordinals)",
    "symbol": "SATS"
  },
  {
    "name": "AltLayer",
    "symbol": "ALT"
  }
];

module.exports = missingBanTokens;