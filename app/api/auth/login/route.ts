import { loginAdmin } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = String(body?.password || "")
    const ok = await loginAdmin(password)
    if (!ok) {
      return Response.json({ ok: false }, { status: 401 })
    }
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
}
