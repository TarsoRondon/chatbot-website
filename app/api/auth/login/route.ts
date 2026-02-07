import { loginAdmin } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    let password = ""
    try {
      const body = await request.json()
      password = String(body?.password || "")
    } catch {
      const form = await request.formData().catch(() => null)
      if (form) {
        password = String(form.get("password") || "")
      }
    }
    const ok = await loginAdmin(password)
    if (!ok) {
      return Response.json({ ok: false }, { status: 401 })
    }
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
}
