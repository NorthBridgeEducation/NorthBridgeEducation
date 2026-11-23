import { useEffect, useState } from "react"
import { Download, FolderOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CandidateFileUpload } from "./CandidateFileUpload"
import { downloadFile, formatFileSize, type FileRecord } from "../file-record"

type AdminFile = Pick<
  FileRecord,
  | "id"
  | "owner_id"
  | "file_name"
  | "category"
  | "bucket_id"
  | "size_bytes"
  | "created_at"
> & { status: FileRecord["status"] | null }

type CandidateFolder = {
  id: string
  candidate_code: string | null
  first_name: string
  last_name: string | null
}

function candidateName(candidate: CandidateFolder) {
  return [candidate.first_name, candidate.last_name].filter(Boolean).join(" ")
}

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
  const [view, setView] = useState<"candidates" | "portal">("candidates")
  const [folder, setFolder] = useState<CandidateFolder | null>(null)
  const [folders, setFolders] = useState<CandidateFolder[]>([])
  const [revision, setRevision] = useState(0)
  const showingFolders = view === "candidates" && !folder
  const candidateId = folder?.id
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

    if (showingFolders) params.set("view", "candidates")
    if (candidateId) params.set("candidateId", candidateId)

    requestFiles<{
      files?: AdminFile[]
      candidates?: CandidateFolder[]
      hasMore: boolean
    }>(params, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setError("")
        setFiles(result.files ?? [])
        setFolders(result.candidates ?? [])
        setHasMore(result.hasMore)
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setError(error.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [page, search, candidateId, showingFolders, revision])

  async function handleDownload(id: string) {
    setDownloading(id)
    setDownloadError("")
    try {
      const params = new URLSearchParams({ id })
      if (candidateId) params.set("candidateId", candidateId)
      const { url } = await requestFiles<{ url: string }>(params)
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

  function openView(
    nextView: typeof view,
    nextFolder: CandidateFolder | null = null
  ) {
    setView(nextView)
    setFolder(nextFolder)
    setSearch("")
    setDownloadError("")
    changePage(0)
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <FolderOpen className="size-5 text-muted-foreground" />
        <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={view === "candidates" ? "default" : "outline"}
          disabled={showingFolders}
          onClick={() => openView("candidates")}
        >
          Candidate folders
        </Button>
        <Button
          variant={view === "portal" ? "default" : "outline"}
          disabled={view === "portal"}
          onClick={() => openView("portal")}
        >
          Portal documents
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>
            {folder
              ? candidateName(folder)
              : showingFolders
                ? "Candidate folders"
                : "Portal documents"}
          </CardTitle>
          {folder?.candidate_code && (
            <p className="text-sm text-muted-foreground">
              {folder.candidate_code}
            </p>
          )}
          <Input
            aria-label={
              showingFolders ? "Search candidates" : "Search documents"
            }
            placeholder={
              showingFolders
                ? "Search by name or candidate code"
                : folder
                  ? "Search by filename"
                  : "Search by filename or user ID"
            }
            maxLength={255}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              changePage(0)
            }}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {folder && (
            <CandidateFileUpload
              key={folder.id}
              candidateId={folder.id}
              onUploaded={() => setRevision((value) => value + 1)}
            />
          )}
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
              {showingFolders
                ? "Loading candidate folders…"
                : "Loading documents…"}
            </p>
          )}
          {!loading &&
            !error &&
            showingFolders &&
            (folders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No candidates found.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {folders.map((candidate) => (
                  <li key={candidate.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => openView("candidates", candidate)}
                      className="flex w-full items-center gap-3 rounded-xl border bg-background p-4 text-left hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <FolderOpen
                        aria-hidden="true"
                        className="size-6 shrink-0 text-primary"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {candidateName(candidate)}
                        </span>
                        {candidate.candidate_code && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {candidate.candidate_code}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}
          {!loading && !error && !showingFolders && files.length === 0 && (
            <p className="text-sm text-muted-foreground">No documents found.</p>
          )}
          {!loading && !error && !showingFolders && files.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th scope="col" className="p-3">
                      Document
                    </th>
                    <th scope="col" className="p-3">
                      {folder ? "Uploaded by" : "User ID"}
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
                        {folder
                          ? file.bucket_id === "files"
                            ? "Student"
                            : file.bucket_id === "admin-candidate-documents"
                              ? "Admin"
                              : "Candidate document"
                          : (file.owner_id ?? "Deleted user")}
                      </td>
                      <td className="p-3">{file.category}</td>
                      <td className="p-3 whitespace-nowrap">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {file.status ? (
                          <Badge variant="outline">{file.status}</Badge>
                        ) : (
                          "—"
                        )}
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
