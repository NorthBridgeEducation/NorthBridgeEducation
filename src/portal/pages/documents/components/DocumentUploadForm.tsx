import type { FormEventHandler } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FILE_CATEGORIES,
  FILE_TYPES,
  type FileRecord,
} from "@/modules/files/file-record";

type DocumentCategory = FileRecord["category"];

type DocumentUploadFormProps = {
  category: DocumentCategory;
  hasSelectedFile: boolean;
  uploading: boolean;
  onFileChange: (file: File | null) => void;
  onCategoryChange: (category: DocumentCategory) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function DocumentUploadForm({
  category,
  hasSelectedFile,
  uploading,
  onFileChange,
  onCategoryChange,
  onSubmit,
}: DocumentUploadFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border p-5">
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
              onFileChange(event.currentTarget.files?.[0] ?? null);
            }}
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Category</span>
          <select
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            value={category}
            onChange={(event) => {
              onCategoryChange(event.currentTarget.value as DocumentCategory);
            }}
          >
            {FILE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <Button type="submit" disabled={!hasSelectedFile || uploading}>
        {uploading ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}