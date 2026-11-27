import { useState } from "react";

import { Input } from "@/components/ui/input";

type DemoCertificateUploadProps = {
  level: "SSC" | "HSC";
  editing: boolean;
  disabled: boolean;
};

function CertificatePicker({
  level,
  disabled,
}: {
  level: "SSC" | "HSC";
  disabled: boolean;
}) {
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <label className="block space-y-1.5 text-sm font-medium">
        <span>{level} certificate</span>
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={disabled}
          onChange={(event) => {
            setFileName(event.currentTarget.files?.[0]?.name ?? "");
          }}
        />
      </label>

      <p role="status" className="break-words text-sm text-muted-foreground">
        {fileName ? `Selected file: ${fileName}` : "Choose a PDF, JPG, or PNG file."}
      </p>
    </div>
  );
}

export function DemoCertificateUpload({
  level,
  editing,
  disabled,
}: DemoCertificateUploadProps) {
  if (!editing) return null;

  return <CertificatePicker level={level} disabled={disabled} />;
}