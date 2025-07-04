import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

type Data = {
  output?: string;
  error?: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Only POST method is allowed." });
  }

  const creator = req.body.creator?.trim();
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  if (!creator || !rpcUrl) {
    return res.status(400).json({
      error: "❌ Creator address or RPC URL missing from request or environment!",
    });
  }

  const rootDir = path.resolve(process.cwd(), "../");
  const scriptPath = path.join(rootDir, "scripts", "scanCreatorTrustScore.js");

  const command = `cd "${rootDir}" && CREATOR="${creator}" SEPOLIA_RPC_URL="${rpcUrl}" npx hardhat run "${scriptPath}" --network sepolia`;

  exec(command, { maxBuffer: 1024 * 5000 }, (error, stdout, stderr) => {
    if (error || stderr) {
      const errMessage = stderr || (error ? (error as Error).message : "Unknown error");
      return res.status(500).json({
        error: `❌ Creator TrustScore Scan Failed:\n\n${errMessage}`,
      });
    }

    const output = stdout?.trim();
    if (!output) {
      return res.status(200).json({ output: "No output returned." });
    }

    return res.status(200).json({ output });
  });
}














