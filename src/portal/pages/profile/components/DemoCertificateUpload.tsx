import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DemoCertificateUpload({
  level,
  editing,
  disabled,
}: {
  level: "SSC" | "HSC" | "Language test"
  editing: boolean
  disabled: boolean
}) {
  const [demoFileName, setDemoFileName] = useState("")

  return (
    <div className="min-w-0 space-y-2 border-t pt-3">
      <h4 className="text-sm font-medium">{level} certificate</h4>
      <p aria-live="polite" className="text-sm break-all text-muted-foreground">
        {demoFileName || "No certificate uploaded yet"}
      </p>
      {editing && (
        <DemoCertificatePicker
          level={level}
          disabled={disabled}
          onUpload={setDemoFileName}
        />
      )}
    </div>
  )
}

function DemoCertificatePicker({
  level,
  disabled,
  onUpload,
}: {
  level: "SSC" | "HSC" | "Language test"
  disabled: boolean
  onUpload: (fileName: string) => void
}) {
  const [selectedName, setSelectedName] = useState("")

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-2">
      <Input
        type="file"
        aria-label={`Choose ${level} certificate`}
        accept=".pdf,.jpg,.jpeg,.png"
        className="min-h-11 w-full min-w-0 text-base sm:text-sm"
        onChange={(event) =>
          setSelectedName(event.currentTarget.files?.[0]?.name ?? "")
        }
      />
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full sm:min-h-9 sm:w-auto"
        disabled={disabled || !selectedName}
        onClick={() => onUpload(selectedName)}
      >
        Simulate upload
      </Button>
      <p className="text-xs text-muted-foreground">
        Demo only. Files stay on this device.
      </p>
    </fieldset>
  )
}
