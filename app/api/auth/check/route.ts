import { isAdminAuthenticated } from "@/lib/auth"

export async function GET() {
  const authed = await isAdminAuthenticated()
  return Response.json({ authed })
}
