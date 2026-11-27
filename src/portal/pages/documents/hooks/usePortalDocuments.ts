import { useEffect, useState, type FormEvent } from "react";

import { supabase } from "@/lib/supabase/client";
import {
  downloadFile,
  FILE_PAGE_SIZE,
  FILE_SIZE_LIMIT,
  FILE_TYPES,
  type FileRecord,
} from "@/modules/files/file-record";

type DocumentCategory = FileRecord["category"];
type DocumentFilter = "certificates" | "all";
type CertificateCategory = "SSC Certificate" | "HSC Certificate";

type SelectedDocument = {
  file: File;
  id: string;
};

const certificateCategories: readonly string[] = [
  "SSC Certificate",
  "HSC Certificate",
];

export function usePortalDocuments(certificateCategory?: CertificateCategory) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [revision, setRevision] = useState(0);
  const [documentFilter, setDocumentFilter] =
    useState<DocumentFilter>("certificates");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [actionError, setActionError] = useState("");

  const [selected, setSelected] = useState<SelectedDocument | null>(null);
  const [category, setCategory] = useState<DocumentCategory>("Other");
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const listEnabled =
    certificateCategory !== undefined || documentFilter === "all";

  useEffect(() => {
    if (!listEnabled) return;

    const controller = new AbortController();
    const offset = page * FILE_PAGE_SIZE;

    async function loadFiles() {
      try {
        let query = supabase.from("available_files").select("*");

        if (certificateCategory) {
          query = query.eq("category", certificateCategory);
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(offset, offset + FILE_PAGE_SIZE)
          .abortSignal(controller.signal);

        if (controller.signal.aborted) return;
        if (error) throw error;

        setFiles(data.slice(0, FILE_PAGE_SIZE));
        setHasMore(data.length > FILE_PAGE_SIZE);
        setListError("");
      } catch {
        if (controller.signal.aborted) return;

        setFiles([]);
        setHasMore(false);
        setListError("Could not load your documents.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadFiles();

    return () => controller.abort();
  }, [page, revision, certificateCategory, listEnabled]);

  function selectFile(file: File | null) {
    setSelected(file ? { file, id: crypto.randomUUID() } : null);
    setActionError("");
  }

  function changeDocumentFilter(nextFilter: DocumentFilter) {
    if (nextFilter === documentFilter) return;

    setLoading(true);
    setHasMore(false);
    setPage(0);
    setDocumentFilter(nextFilter);
  }

  function changePage(nextPage: number) {
    if (loading || nextPage < 0 || nextPage === page) return;
    if (nextPage > page && !hasMore) return;

    setLoading(true);
    setPage(nextPage);
  }

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || uploading) return;

    const form = event.currentTarget;
    const { file, id } = selected;
    setActionError("");

    if (
      !FILE_TYPES.includes(file.type) ||
      file.size < 1 ||
      file.size > FILE_SIZE_LIMIT
    ) {
      setActionError(
        "Choose a PDF, JPG, PNG or WEBP file between 1 byte and 20 MB.",
      );
      return;
    }

    if ([...file.name].length > 255) {
      setActionError("Choose a filename of 255 characters or fewer.");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sign in to upload documents.");
      }

      const path = `${user.id}/documents/${id}`;

      const { error: reservationError } = await supabase.from("files").insert({
        id,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        category,
      });

      if (reservationError && reservationError.code !== "23505") {
        throw new Error("Could not prepare the upload. Try again.");
      }

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        const { data: completed } = await supabase
          .from("available_files")
          .select("id")
          .eq("id", id)
          .maybeSingle();

        if (!completed) {
          throw new Error("Could not upload the file. Try again.");
        }
      }

      form.reset();
      setSelected(null);
      setCategory("Other");

      if (!certificateCategories.includes(category)) {
        setDocumentFilter("all");
      }

      setLoading(true);
      setPage(0);
      setRevision((previous) => previous + 1);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not upload the file.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function downloadDocument(file: FileRecord) {
    if (downloadingId !== null) return;

    setDownloadingId(file.id);
    setActionError("");

    try {
      const { data, error } = await supabase.storage
        .from(file.bucket_id)
        .createSignedUrl(file.storage_path, 60, { download: file.file_name });

      if (error) throw error;

      downloadFile(data.signedUrl);
    } catch {
      setActionError("Could not download this document.");
    } finally {
      setDownloadingId(null);
    }
  }

  return {
    files,
    page,
    hasMore,
    revision,
    documentFilter,
    loading,
    listError,
    actionError,
    category,
    hasSelectedFile: selected !== null,
    uploading,
    downloadingId,
    selectFile,
    setCategory,
    changeDocumentFilter,
    changePage,
    uploadDocument,
    downloadDocument,
  };
}