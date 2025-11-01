import { NextResponse } from "next/server"
import sharp from "sharp"
import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import { requireAdmin } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const len = req.headers.get("content-length")
    const maxBytes = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024)
    if (len && Number(len) > maxBytes) return NextResponse.json({ error: "File too large" }, { status: 413 })

    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    if (buffer.byteLength > maxBytes) return NextResponse.json({ error: "File too large" }, { status: 413 })

    const mime = file.type || ""
    if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(mime)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
    }

    const webpBuffer = await sharp(buffer).webp({ quality: 82 }).toBuffer()
    const fileName = `${randomUUID()}.webp`
    const relDir = "categories"
    const publicDir = path.join(process.cwd(), "public", relDir)
    await fs.mkdir(publicDir, { recursive: true })
    await fs.writeFile(path.join(publicDir, fileName), webpBuffer)
    const url = path.posix.join("/categories", fileName)
    return NextResponse.json({ url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
