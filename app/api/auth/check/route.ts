import { isAdminAuthenticated } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET() {
  const authed = await isAdminAuthenticated()
  return Response.json({ authed })
}
