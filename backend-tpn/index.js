const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { exec } = require("child_process");

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

// ✅ Token Trust Score
app.post("/api/scanTokenTrustScore", (req, res) => {
  const { name, symbol } = req.body;
  exec(`NAME="${name}" SYMBOL="${symbol}" npx hardhat run scripts/scanTokenTrustScore.js --network sepolia`, (error, stdout) => {
    if (error) return res.status(500).json({ output: error.message });
    res.json({ output: stdout });
  });
});

// ✅ Suspicion DEX Scan
app.post("/api/scanSuspicionListDEX", (req, res) => {
  const { name, symbol } = req.body;
  exec(`NAME="${name}" SYMBOL="${symbol}" npx hardhat run scripts/scanSuspicionListDEX.js --network sepolia`, (error, stdout) => {
    if (error) return res.status(500).json({ output: error.message });
    res.json({ output: stdout });
  });
});

// ✅ Creator Trust Score
app.post("/api/scanCreatorTrustScore", (req, res) => {
  const { creator } = req.body;
  exec(`CREATOR="${creator}" npx hardhat run scripts/scanCreatorTrustScore.js --network sepolia`, (error, stdout) => {
    if (error) return res.status(500).json({ output: error.message });
    res.json({ output: stdout });
  });
});

// ✅ Creator Cluster Statistics
app.post("/api/scanCreatorClusterStatistics", (req, res) => {
  const { creator } = req.body;
  exec(`CREATOR="${creator}" npx hardhat run scripts/scanCreatorClusterStatistics.js --network sepolia`, (error, stdout) => {
    if (error) return res.status(500).json({ output: error.message });
    res.json({ output: stdout });
  });
});

app.get("/", (req, res) => {
  res.send("🛡️ Timeproof Network Backend is running.");
});

app.listen(port, () => {
  console.log(`🛡️ TPN Backend running on port ${port}`);
});
