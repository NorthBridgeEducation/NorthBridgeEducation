import { useEffect, useState, type FormEvent } from "react";
import { Download, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import {
  downloadFile,
  FILE_SIZE_LIMIT,
  FILE_TYPES,
  formatFileSize,
} from "@/modules/files/file-record";

const categories = [
  "SSC Certificate",
  "HSC Certificate",
  "Passport",
  "NID",
] as const;
type Category = (typeof categories)[number];

const columns = "id, category, file_name, bucket_id, storage_path, size_bytes";

type UploadedDocument = {
  id: string;
  category: string;
  file_name: string;
  bucket_id: string;
  storage_path: string;
  size_bytes: number;
};

export function DraftDocumentsStep({
  userId,
  readOnly,
  onBack,
}: {
  userId: string;
  readOnly: boolean;
  onBack: () => void;
}) {
  const [category, setCategory] = useState<Category>("SSC Certificate");
  const [selected, setSelected] = useState<{ file: File; id: string } | null>(
    null,
  );
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [listError, setListError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const result = await supabase
        .from("available_files")
        .select(columns)
        .eq("owner_id", userId)
        .in("category", [...categories])
        .order("created_at", { ascending: false })
        .abortSignal(controller.signal);

      if (controller.signal.aborted) return;

      if (result.error) {
        setListError("Could not load your uploaded documents.");
      } else {
        setDocuments((previous) => [
          ...previous,
          ...result.data.filter(
            (row) => !previous.some(({ id }) => id === row.id),
          ),
        ]);
      }
      setLoading(false);
    }

    void load();
    return () => controller.abort();
  }, [userId]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || uploading || readOnly) return;

    const form = event.currentTarget;
    const { file, id } = selected;
    const path = userId + "/documents/" + id;

    setError("");
    setNotice("");

    if (
      !FILE_TYPES.includes(file.type) ||
      file.size < 1 ||
      file.size > FILE_SIZE_LIMIT
    ) {
      setError("Choose a PDF, JPG, PNG or WEBP file up to 20 MB.");
      return;
    }

    if ([...file.name].length > 255) {
      setError("Choose a filename of 255 characters or fewer.");
      return;
    }

    setUploading(true);
    try {
      const reservation = await supabase.from("files").insert({
        id,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        category,
      });

      if (reservation.error && reservation.error.code !== "23505") {
        throw reservation.error;
      }

      const result = await supabase.storage
        .from("files")
        .upload(path, file, { contentType: file.type, upsert: false });

      const { data, error: lookupError } = await supabase
        .from("available_files")
        .select(columns)
        .eq("owner_id", userId)
        .eq("id", id)
        .maybeSingle();

      if (lookupError || !data) {
        throw (
          result.error ??
          lookupError ??
          new Error("Upload could not be verified.")
        );
      }

      setDocuments((previous) => [
        data,
        ...previous.filter((row) => row.id !== id),
      ]);
      setSelected(null);
      form.reset();
      setNotice(data.category + " uploaded.");
    } catch {
      setError("Could not upload the document. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function download(row: UploadedDocument) {
    setDownloading(row.id);
    setError("");
    setNotice("");
    try {
      const { data, error } = await supabase.storage
        .from(row.bucket_id)
        .createSignedUrl(row.storage_path, 60, { download: row.file_name });

      if (error) throw error;
      downloadFile(data.signedUrl);
    } catch {
      setError("Could not download this document.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <section className="space-y-5 rounded-xl border bg-card p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          {readOnly
            ? "Review the documents you uploaded."
            : "Optional. Your draft is saved even if you leave this step without uploading."}
        </p>
      </div>

      {!readOnly && (
        <form onSubmit={upload} className="space-y-4 rounded-lg border p-4">
          <fieldset
            disabled={uploading}
            className="grid min-w-0 gap-4 sm:grid-cols-2"
          >
            <label className="block min-w-0 space-y-1.5 text-sm font-medium">
              <span>Document type</span>
              <select
                value={category}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                onChange={(event) => {
                  setCategory(event.currentTarget.value as Category);
                  const id = crypto.randomUUID();
                  setSelected((previous) =>
                    previous ? { ...previous, id } : null,
                  );
                  setError("");
                  setNotice("");
                }}
              >
                {categories.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>

            <label className="block min-w-0 space-y-1.5 text-sm font-medium">
              <span>File</span>
              <Input
                type="file"
                accept={FILE_TYPES.join(",")}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  setSelected(file ? { file, id: crypto.randomUUID() } : null);
                  setError("");
                  setNotice("");
                }}
              />
            </label>
          </fieldset>

          <p className="text-sm text-muted-foreground">
            PDF, JPG, PNG or WEBP · Up to 20 MB
          </p>
          <Button type="submit" disabled={!selected || uploading}>
            <Upload className="size-4" aria-hidden="true" />
            {uploading ? "Uploading…" : "Upload document"}
          </Button>
        </form>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold">Uploaded documents</h3>
        {loading && (
          <p role="status" className="text-sm">
            Loading documents…
          </p>
        )}
        {listError && (
          <p role="alert" className="text-sm text-destructive">
            {listError}
          </p>
        )}
        {!loading && !listError && documents.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No documents uploaded yet.
          </p>
        )}
        {documents.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {documents.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0">
                  <p className="break-all text-sm font-medium">
                    {row.file_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {row.category} · {formatFileSize(row.size_bytes)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={downloading !== null}
                  onClick={() => void download(row)}
                >
                  <Download className="size-4" aria-hidden="true" />
                  {downloading === row.id ? "Preparing…" : "Download"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={onBack}
      >
        Back to Other Info
      </Button>
    </section>
  );
}
