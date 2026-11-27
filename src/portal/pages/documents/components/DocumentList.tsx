import { useId } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFileSize, type FileRecord } from "@/modules/files/file-record";

type DocumentListProps = {
  title?: string;
  files: FileRecord[];
  loading: boolean;
  error: string;
  downloadingId: string | null;
  onDownload: (file: FileRecord) => void;
};

export function DocumentList({
  title = "Uploaded Documents",
  files,
  loading,
  error,
  downloadingId,
  onDownload,
}: DocumentListProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading}
      className="overflow-hidden rounded-xl border bg-card"
    >
      <h2 id={titleId} className="border-b px-4 py-3 font-semibold">
        {title}
      </h2>

      {loading && (
        <p role="status" className="p-5 text-sm text-muted-foreground">
          Loading documents…
        </p>
      )}

      {!loading && error && (
        <p role="alert" className="p-5 text-sm text-destructive">
          {error}
        </p>
      )}

      {!loading && !error && files.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          No document found.
        </p>
      )}

      {!loading && !error && files.length > 0 && (
        <ul className="divide-y">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="break-all text-sm font-medium">{file.file_name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {file.category} · {formatFileSize(file.size_bytes)} ·{" "}
                  {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">{file.status}</Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={downloadingId !== null}
                  aria-label={`Download ${file.file_name}`}
                  onClick={() => onDownload(file)}
                >
                  {downloadingId === file.id ? "Preparing…" : "Download"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}