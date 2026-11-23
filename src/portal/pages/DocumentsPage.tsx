import { useEffect, useState, type FormEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import {
  downloadFile,
  FILE_CATEGORIES,
  FILE_PAGE_SIZE,
  FILE_SIZE_LIMIT,
  FILE_TYPES,
  formatFileSize,
  type FileRecord,
} from "@/modules/files/file-record.ts"


const selectClass = "h-9 w-full rounded-md border bg-background px-3 text-sm"

export function DocumentsPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState("")
  const [actionError, setActionError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [selected, setSelected] = useState<{ file: File; id: string } | null>(
    null
  )
  const [category, setCategory] = useState<FileRecord["category"]>("Other")

  useEffect(() => {
    const controller = new AbortController()
    const offset = page * FILE_PAGE_SIZE

    async function loadFiles() {
      const { data, error } = await supabase
        .from("available_files")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + FILE_PAGE_SIZE)
        .abortSignal(controller.signal)
      if (controller.signal.aborted) return

      setListError(error ? "Could not load your documents." : "")
      setFiles(data?.slice(0, FILE_PAGE_SIZE) ?? [])
      setHasMore((data?.length ?? 0) > FILE_PAGE_SIZE)
      setLoading(false)
    }

    void loadFiles()
    return () => controller.abort()
  }, [page, revision])

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || uploading) return

    const form = event.currentTarget
    const { file, id } = selected
    setActionError("")

    if (
      !FILE_TYPES.includes(file.type) ||
      file.size < 1 ||
      file.size > FILE_SIZE_LIMIT
    ) {
      setActionError(
        "Choose a PDF, JPG, PNG or WEBP file between 1 byte and 20 MB."
      )
      return
    }
    if ([...file.name].length > 255) {
      setActionError("Choose a filename of 255 characters or fewer.")
      return
    }

    setUploading(true)
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("Sign in to upload documents.")

      const path = `${user.id}/documents/${id}`
      const { error: reservationError } = await supabase.from("files").insert({
        id,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        category,
      })
      if (reservationError && reservationError.code !== "23505") {
        throw new Error("Could not prepare the upload. Try again.")
      }

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        const { data: completed } = await supabase
          .from("available_files")
          .select("id")
          .eq("id", id)
          .maybeSingle()
        if (!completed) throw new Error("Could not upload the file. Try again.")
      }

      setSelected(null)
      setCategory("Other")
      form.reset()
      setLoading(true)
      setPage(0)
      setRevision((value) => value + 1)
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not upload the file."
      )
    } finally {
      setUploading(false)
    }
  }

  async function handleDownload(file: FileRecord) {
    setDownloading(file.id)
    setActionError("")
    try {
      const { data, error } = await supabase.storage
        .from(file.bucket_id)
        .createSignedUrl(file.storage_path, 60, { download: file.file_name })
      if (error) throw error
      downloadFile(data.signedUrl)
    } catch {
      setActionError("Could not download this document.")
    } finally {
      setDownloading(null)
    }
  }

  function changePage(nextPage: number) {
    setLoading(true)
    setPage(nextPage)
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">My Documents</h1>

      <form onSubmit={handleUpload} className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="font-semibold">Upload a document</h2>
          <p className="text-sm text-muted-foreground">
            PDF, JPG, PNG or WEBP up to 20 MB.
          </p>
        </div>
        <fieldset disabled={uploading} className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            <span>File</span>
            <Input
              type="file"
              accept={FILE_TYPES.join(",")}
              required
              onChange={(event) => {
                const file = event.target.files?.[0]
                setSelected(file ? { file, id: crypto.randomUUID() } : null)
                setActionError("")
              }}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Category</span>
            <select
              className={selectClass}
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as FileRecord["category"])
              }
            >
              {FILE_CATEGORIES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </fieldset>
        <Button type="submit" disabled={!selected || uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </form>

      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}

      <div className="rounded-xl border">
        <h2 className="border-b p-4 font-semibold">Uploaded Documents</h2>
        {loading && (
          <p role="status" className="p-4 text-sm text-muted-foreground">
            Loading documents…
          </p>
        )}
        {!loading && listError && (
          <p role="alert" className="p-4 text-sm text-destructive">
            {listError}
          </p>
        )}
        {!loading && !listError && files.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            You haven’t uploaded any documents yet.
          </p>
        )}
        {!loading && !listError && (
          <ul className="divide-y">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium break-all">{file.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {file.category} · {formatFileSize(file.size_bytes)} ·{" "}
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{file.status}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={downloading !== null}
                    onClick={() => void handleDownload(file)}
                  >
                    {downloading === file.id ? "Preparing…" : "Download"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(page > 0 || hasMore) && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || page === 0}
            onClick={() => changePage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || !!listError || !hasMore}
            onClick={() => changePage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  )
}