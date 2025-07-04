import { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ output: "❌ Only POST allowed." });
  }

  const { name, symbol } = req.body;

  if (!name || !symbol) {
    return res.status(400).json({ output: "❌ Token name and symbol are required!" });
  }

  const rpc = process.env.SEPOLIA_RPC_URL;
  if (!rpc) {
    return res.status(500).json({ output: "❌ RPC URL missing from environment!" });
  }

  // ✅ Final fix: move one level up to access scripts/
  const absoluteScriptPath = path.resolve(process.cwd(), "../scripts/scanSuspicionListDEX.js");

  const envVars = `NAME="${name}" SYMBOL="${symbol}"`;

  const command = `${envVars} npx hardhat run ${absoluteScriptPath} --network sepolia`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        output: `❌ Script execution failed.\n${stderr || error.message}`,
      });
    }

    return res.status(200).json({ output: stdout });
  });
}
































