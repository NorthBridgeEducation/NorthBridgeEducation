import { createClient } from "@supabase/supabase-js"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { isAdminAuthenticated } from "./_lib/session.js"

const PAGE_SIZE = 50
const ADMIN_BUCKET = "admin-candidate-documents"
const MAX_BYTES = 20 * 1024 * 1024
const MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
const CATEGORIES = [
  "Passport",
  "Visa",
  "Medical",
  "Contract",
  "Academic Transcript",
  "Language Certificate",
  "SSC Certificate",
  "HSC Certificate",
  "NID",
  "Other",
]
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store")

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST")
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
    if (req.method === "POST") {
      if (
        req.headers["content-type"]?.split(";")[0].trim() !== "application/json"
      ) {
        return res
          .status(415)
          .json({ message: "Send an application/json body." })
      }

      const { id, candidateId, fileName, mimeType, size, category } =
        req.body ?? {}
      if (
        typeof id !== "string" ||
        !uuidPattern.test(id) ||
        typeof candidateId !== "string" ||
        !uuidPattern.test(candidateId) ||
        typeof fileName !== "string" ||
        !fileName.trim() ||
        [...fileName].length > 255 ||
        [...fileName].some(
          (character) =>
            character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127
        ) ||
        !MIME_TYPES.includes(mimeType) ||
        !Number.isInteger(size) ||
        size < 1 ||
        size > MAX_BYTES ||
        !CATEGORIES.includes(category)
      ) {
        return res.status(400).json({ message: "Invalid document details." })
      }

      const { data: candidate, error: candidateError } = await supabase
        .from("candidates")
        .select("id")
        .eq("id", candidateId)
        .maybeSingle()
      if (candidateError) throw candidateError
      if (!candidate)
        return res.status(404).json({ message: "Candidate not found." })

      const path = `admin/${candidate.id}/${id.toLowerCase()}`
      const { error: reservationError } = await supabase
        .from("candidate_documents")
        .upsert(
          {
            id,
            candidate_id: candidate.id,
            storage_path: path,
            file_name: fileName,
            mime_type: mimeType,
            file_size: size,
            document_type: category,
            uploaded_by: null,
          },
          { onConflict: "id", ignoreDuplicates: true }
        )
      if (reservationError) throw reservationError

      const { data: reservation, error: lookupError } = await supabase
        .from("candidate_documents")
        .select("storage_path, file_name, mime_type, file_size, document_type")
        .eq("id", id)
        .single()
      if (lookupError) throw lookupError
      if (
        reservation.storage_path !== path ||
        reservation.file_name !== fileName ||
        reservation.mime_type !== mimeType ||
        Number(reservation.file_size) !== size ||
        reservation.document_type !== category
      ) {
        return res
          .status(409)
          .json({ message: "Select the file again and retry." })
      }

      const { data: uploaded, error: uploadedError } = await supabase
        .from("admin_candidate_files")
        .select("id")
        .eq("bucket_id", ADMIN_BUCKET)
        .eq("id", id)
        .maybeSingle()
      if (uploadedError) throw uploadedError
      if (uploaded) return res.status(200).json({ uploaded: true })

      const signed = await supabase.storage
        .from(ADMIN_BUCKET)
        .createSignedUploadUrl(path)
      if (signed.error) throw signed.error
      return res.status(200).json({ path, token: signed.data.token })
    }

    const { id, page = "0", search, candidateId, view } = req.query
    if (
      candidateId !== undefined &&
      (typeof candidateId !== "string" || !uuidPattern.test(candidateId))
    ) {
      return res.status(400).json({ message: "Invalid candidate ID." })
    }
    if (id !== undefined) {
      if (typeof id !== "string" || !uuidPattern.test(id)) {
        return res.status(400).json({ message: "Invalid file ID." })
      }

      let query = supabase
        .from(candidateId ? "admin_candidate_files" : "available_files")
        .select("bucket_id, storage_path, file_name")
        .eq("id", id)
      if (candidateId) query = query.eq("candidate_id", candidateId)
      const { data: file, error } = await query.maybeSingle()

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
    if (view === "candidates") {
      let candidates = supabase
        .from("candidates")
        .select("id, candidate_code, first_name, last_name")
        .order("first_name")
        .order("last_name")
        .order("id")
        .range(offset, offset + PAGE_SIZE)
      if (search) {
        // Quote PostgREST filter values and escape SQL LIKE wildcards.
        const term = search.replace(/[\\%_]/g, "\\$&")
        const pattern = JSON.stringify(`%${term}%`)
        candidates = candidates.or(
          `first_name.ilike.${pattern},last_name.ilike.${pattern},candidate_code.ilike.${pattern}`
        )
      }
      const { data, error } = await candidates
      if (error) throw error
      return res.status(200).json({
        candidates: data.slice(0, PAGE_SIZE),
        hasMore: data.length > PAGE_SIZE,
      })
    }

    let query = supabase
      .from(candidateId ? "admin_candidate_files" : "available_files")
      .select(
        "id, owner_id, file_name, category, status, size_bytes, created_at, bucket_id"
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + PAGE_SIZE)

    if (candidateId) query = query.eq("candidate_id", candidateId)

    if (search) {
      query =
        !candidateId && uuidPattern.test(search)
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
    return res.status(500).json({
      message:
        req.method === "POST"
          ? "Could not prepare the upload."
          : "Could not load the requested files.",
    })
  }
}
