import { isAdminAuthenticated } from "@/lib/auth"
import { promises as fs } from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v2 as cloudinary } from "cloudinary"

const MAX_SIZE_MB = 5
const PROVIDER = (process.env.UPLOAD_PROVIDER || "local").toLowerCase()

const extensionFromType = (fileType: string) => {
  if (fileType === "image/jpeg") return ".jpg"
  if (fileType === "image/png") return ".png"
  if (fileType === "image/webp") return ".webp"
  if (fileType === "image/gif") return ".gif"
  return ".png"
}

const ensureExtension = (name: string, fileType: string) => {
  const ext = path.extname(name || "").toLowerCase()
  if (ext) return ext
  return extensionFromType(fileType)
}

async function uploadLocal(buffer: Buffer, fileType: string, filename: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  await fs.mkdir(uploadDir, { recursive: true })
  const filepath = path.join(uploadDir, filename)
  await fs.writeFile(filepath, buffer)
  return `/uploads/${filename}`
}

async function uploadS3(buffer: Buffer, fileType: string, filename: string) {
  const bucket = process.env.S3_BUCKET
  const region = process.env.S3_REGION
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("S3 nao configurado")
  }

  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  })

  const key = `uploads/${filename}`
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: fileType,
    ...(process.env.S3_PUBLIC_READ === "true" ? { ACL: "public-read" } : {}),
  })

  await client.send(command)

  const publicBase =
    process.env.S3_PUBLIC_URL || `https://${bucket}.s3.${region}.amazonaws.com`
  return `${publicBase}/${key}`
}

async function uploadCloudinary(buffer: Buffer, fileType: string, filename: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary nao configurado")
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })

  const folder = process.env.CLOUDINARY_FOLDER || "uploads"

  const result = await new Promise<{ secure_url?: string; url?: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename.replace(path.extname(filename), ""),
        resource_type: "image",
        overwrite: true,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error || new Error("Falha no upload"))
          return
        }
        resolve(uploadResult)
      },
    )
    stream.end(buffer)
  })

  return result.secure_url || result.url || ""
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "file_required" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "invalid_type" }, { status: 400 })
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return Response.json({ error: "file_too_large" }, { status: 413 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = ensureExtension(file.name || "", file.type)
  const filename = `${randomUUID()}${ext}`

  try {
    let url = ""
    if (PROVIDER === "s3") {
      url = await uploadS3(buffer, file.type, filename)
    } else if (PROVIDER === "cloudinary") {
      url = await uploadCloudinary(buffer, file.type, filename)
    } else {
      url = await uploadLocal(buffer, file.type, filename)
    }

    if (!url) {
      throw new Error("Falha ao gerar URL")
    }

    return Response.json({ ok: true, url })
  } catch (error) {
    console.error("Upload error:", error)
    return Response.json({ error: "upload_failed" }, { status: 500 })
  }
}
