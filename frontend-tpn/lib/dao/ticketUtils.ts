import fs from "fs";
import path from "path";

const TICKETS_PATH = path.join(process.cwd(), "data", "dao-tickets.json");

export function appendTicket(newTicket: any) {
  try {
    const raw = fs.readFileSync(TICKETS_PATH, "utf-8");
    const current = JSON.parse(raw);
    const nextId = `${newTicket.type}#${current.filter((t: any) => t.type === newTicket.type).length + 1}`;
    const ticket = { ...newTicket, id: nextId };

    current.push(ticket);
    fs.writeFileSync(TICKETS_PATH, JSON.stringify(current, null, 2));
    console.log("✅ Ticket appended:", ticket);
  } catch (err) {
    console.error("❌ Failed to append ticket:", err);
  }
}
