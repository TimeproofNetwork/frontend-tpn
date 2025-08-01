// app/api/get-existing-upgrade-requests/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "dao-tickets.json");
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const allTickets = JSON.parse(fileContents);

    const existingUpgradeRequests = allTickets
      .filter((ticket: any) => ticket.type === "E")
      .sort((a: any, b: any) => b.timestamp - a.timestamp);

    return NextResponse.json(existingUpgradeRequests);
  } catch (err) {
    console.error("Error reading upgrade requests:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



