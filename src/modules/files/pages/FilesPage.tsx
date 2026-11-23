import { useEffect, useState } from "react"
import { Download, FolderOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { downloadFile, formatFileSize, type FileRecord } from "../file-record"

type AdminFile = Pick<
  FileRecord,
  | "id"
  | "owner_id"
  | "file_name"
  | "category"
  | "status"
  | "size_bytes"
  | "created_at"
>

async function requestFiles<T>(
  params: URLSearchParams,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`/api/admin/files?${params}`, { signal })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result) {
    throw new Error(result?.message ?? "Could not reach the files API.")
  }
  return result
}

export function FilesPage() {
  const [files, setFiles] = useState<AdminFile[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloadError, setDownloadError] = useState("")
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      page: String(page),
      search: search.trim(),
    })

    requestFiles<{ files: AdminFile[]; hasMore: boolean }>(
      params,
      controller.signal
    )
      .then((result) => {
        if (controller.signal.aborted) return
        setFiles(result.files)
        setHasMore(result.hasMore)
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setError(error.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [page, search])

  async function handleDownload(id: string) {
    setDownloading(id)
    setDownloadError("")
    try {
      const { url } = await requestFiles<{ url: string }>(
        new URLSearchParams({ id })
      )
      downloadFile(url)
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Could not download file."
      )
    } finally {
      setDownloading(null)
    }
  }

  function changePage(nextPage: number) {
    setLoading(true)
    setError("")
    setPage(nextPage)
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <FolderOpen className="size-5 text-muted-foreground" />
        <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>All Documents</CardTitle>
          <Input
            aria-label="Search documents"
            placeholder="Search by filename or user ID"
            maxLength={255}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              changePage(0)
            }}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {downloadError && (
            <p role="alert" className="text-sm text-destructive">
              {downloadError}
            </p>
          )}
          {loading && (
            <p role="status" className="text-sm text-muted-foreground">
              Loading documents…
            </p>
          )}
          {!loading && !error && files.length === 0 && (
            <p className="text-sm text-muted-foreground">No documents found.</p>
          )}
          {!loading && !error && files.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th scope="col" className="p-3">
                      Document
                    </th>
                    <th scope="col" className="p-3">
                      User ID
                    </th>
                    <th scope="col" className="p-3">
                      Category
                    </th>
                    <th scope="col" className="p-3">
                      Uploaded
                    </th>
                    <th scope="col" className="p-3">
                      Status
                    </th>
                    <th scope="col" className="p-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {files.map((file) => (
                    <tr key={file.id}>
                      <td className="p-3">
                        <p className="max-w-64 font-medium break-all">
                          {file.file_name}
                        </p>
                        <p className="text-muted-foreground">
                          {formatFileSize(file.size_bytes)}
                        </p>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {file.owner_id ?? "Deleted user"}
                      </td>
                      <td className="p-3">{file.category}</td>
                      <td className="p-3 whitespace-nowrap">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{file.status}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={downloading !== null}
                          onClick={() => void handleDownload(file.id)}
                        >
                          <Download className="size-4" />
                          {downloading === file.id ? "Preparing…" : "Download"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                disabled={loading || !!error || !hasMore}
                onClick={() => changePage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}