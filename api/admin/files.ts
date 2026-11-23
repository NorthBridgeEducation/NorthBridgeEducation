import { createClient } from "@supabase/supabase-js"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { isAdminAuthenticated } from "./_lib/session.js"

const PAGE_SIZE = 50
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store")

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ message: "Method not allowed." })
  }

  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ message: "Admin login required." })
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    return res
      .status(500)
      .json({ message: "Supabase server configuration is missing." })
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const { id, page = "0", search } = req.query
    if (id !== undefined) {
      if (typeof id !== "string" || !uuidPattern.test(id)) {
        return res.status(400).json({ message: "Invalid file ID." })
      }

      const { data: file, error } = await supabase
        .from("available_files")
        .select("bucket_id, storage_path, file_name")
        .eq("id", id)
        .maybeSingle()

      if (error) throw error
      if (!file) return res.status(404).json({ message: "File not found." })

      const signed = await supabase.storage
        .from(file.bucket_id)
        .createSignedUrl(file.storage_path, 60, { download: file.file_name })
      if (signed.error) throw signed.error

      return res.status(200).json({ url: signed.data.signedUrl })
    }

    if (
      typeof page !== "string" ||
      !/^\d{1,6}$/.test(page) ||
      (search !== undefined &&
        (typeof search !== "string" || search.length > 255))
    ) {
      return res.status(400).json({ message: "Invalid list parameters." })
    }

    const offset = Number(page) * PAGE_SIZE
    let query = supabase
      .from("available_files")
      .select(
        "id, owner_id, file_name, category, status, size_bytes, created_at"
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + PAGE_SIZE)

    if (search) {
      query = uuidPattern.test(search)
        ? query.eq("owner_id", search)
        : query.ilike("file_name", `%${search.replace(/[\\%_]/g, "\\$&")}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return res.status(200).json({
      files: data.slice(0, PAGE_SIZE),
      hasMore: data.length > PAGE_SIZE,
    })
  } catch (error) {
    console.error("Admin files request failed:", error)
    return res
      .status(500)
      .json({ message: "Could not load the requested files." })
  }
}
