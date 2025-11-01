import { NextResponse } from "next/server"
import sharp from "sharp"
import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import { requireAdmin } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    // Only admins may upload product images
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Basic size guard (if client sends Content-Length)
    const len = req.headers.get("content-length")
    const maxBytes = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024) // 5MB default
    if (len && Number(len) > maxBytes) {
      return NextResponse.json({ error: "File too large" }, { status: 413 })
    }

    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Enforce file size limit from actual buffer
    if (buffer.byteLength > maxBytes) {
      return NextResponse.json({ error: "File too large" }, { status: 413 })
    }

    // Rudimentary mime/type guard (sharp will also validate image data)
    const mime = file.type || ""
    if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(mime)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
    }

    // Convert to webp
    const webpBuffer = await sharp(buffer).webp({ quality: 82 }).toBuffer()

  const fileName = `${randomUUID()}.webp`
  // IMPORTANT: use a relative path (no leading slash) so path.join adds under public/
  const relDir = "products/uploads"
  const publicDir = path.join(process.cwd(), "public", relDir)
    await fs.mkdir(publicDir, { recursive: true })
    await fs.writeFile(path.join(publicDir, fileName), webpBuffer)

  const url = path.posix.join("/products/uploads", fileName)
    return NextResponse.json({ url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}



