// pages/api/dao/getPendingRequests.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const tickets = [
    {
      name: "almondcentral",
      symbol: "almc",
      creator: "0x6E118Ac0da2170697a4F942A0C509B29C59F698f",
      currentLevel: 1,
      requestedLevel: 3,
      proof1: "https://coinbase.com/en-in/price/almondcentral",
      proof2: "https://certik.com/projects/almondcentral",
      timestamp: "2025-07-22T16:02:00Z"
    }
  ];

  res.status(200).json({ tickets });
}
