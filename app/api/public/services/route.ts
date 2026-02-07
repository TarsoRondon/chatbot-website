import { readDb } from "@/lib/db"

export async function GET() {
  const db = await readDb()
  return Response.json(db.services)
}
