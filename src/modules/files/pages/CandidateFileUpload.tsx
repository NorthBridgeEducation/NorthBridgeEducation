import { useState, type FormEvent } from "react"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import { FILE_CATEGORIES, FILE_SIZE_LIMIT, FILE_TYPES } from "../file-record"

const categories = [
  ...FILE_CATEGORIES,
  "SSC Certificate",
  "HSC Certificate",
  "NID",
]
const bucket = "admin-candidate-documents"

export function CandidateFileUpload({
  candidateId,
  onUploaded,
}: {
  candidateId: string
  onUploaded: () => void
}) {
  const [selection, setSelection] = useState<{ file: File; id: string } | null>(
    null
  )
  const [category, setCategory] = useState("Other")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploaded, setUploaded] = useState(false)

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selection || uploading) return

    const form = event.currentTarget
    const { file, id } = selection
    setError("")
    setUploaded(false)
    if (
      !FILE_TYPES.includes(file.type) ||
      file.size < 1 ||
      file.size > FILE_SIZE_LIMIT
    ) {
      setError("Choose a PDF, JPG, PNG or WEBP file up to 20 MB.")
      return
    }

    setUploading(true)
    try {
      const response = await fetch("/api/admin/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          candidateId,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          category,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result) {
        throw new Error(result?.message ?? "Could not prepare the upload.")
      }

      if (!result.uploaded) {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .uploadToSignedUrl(result.path, result.token, file, {
            contentType: file.type,
          })
        if (uploadError)
          throw new Error("Could not upload the file. Try again.")
      }

      form.reset()
      setSelection(null)
      setCategory("Other")
      setUploaded(true)
      onUploaded()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not upload the file."
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={upload} className="space-y-3 rounded-xl border p-4">
      <div>
        <h2 className="font-semibold">Upload document</h2>
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
              setSelection(file ? { file, id: crypto.randomUUID() } : null)
              setError("")
              setUploaded(false)
            }}
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Category</span>
          <select
            className="h-9 w-full rounded-md border bg-background px-3"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)
              if (selection)
                setSelection({ file: selection.file, id: crypto.randomUUID() })
            }}
          >
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </fieldset>
      <Button type="submit" disabled={uploading || !selection}>
        <Upload className="size-4" />
        {uploading ? "Uploading…" : "Upload"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {uploaded && (
        <p role="status" className="text-sm">
          Document uploaded.
        </p>
      )}
    </form>
  )
}
