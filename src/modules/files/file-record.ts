export const FILE_CATEGORIES = [
  "Passport",
  "Visa",
  "Medical",
  "Contract",
  "Academic Transcript",
  "Language Certificate",
  "Other",
] as const

export const FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]
export const FILE_SIZE_LIMIT = 20 * 1024 * 1024
export const FILE_PAGE_SIZE = 50

export type FileRecord = {
  id: string
  owner_id: string | null
  bucket_id: string
  storage_path: string
  file_name: string
  mime_type: string
  size_bytes: number
  category: (typeof FILE_CATEGORIES)[number]
  status: "Pending" | "Verified" | "Expired"
  created_at: string
}

export function formatFileSize(bytes: number) {
  const unit = bytes >= 1024 * 1024 ? "MB" : "KB"
  return unit === "MB"
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`
}

export function downloadFile(url: string) {
  const link = document.createElement("a")
  link.href = url
  link.referrerPolicy = "no-referrer"
  link.click()
}