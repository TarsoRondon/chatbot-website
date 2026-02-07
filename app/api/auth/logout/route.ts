import { logoutAdmin } from "@/lib/auth"

export async function POST() {
  await logoutAdmin()
  return Response.json({ ok: true })
}
