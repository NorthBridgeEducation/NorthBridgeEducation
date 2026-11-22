
const demoDocuments = [
  {
    id: "1",
    name: "Passport.pdf",
    type: "Passport",
    size: "2.4 MB",
    date: "Nov 20, 2026",
    status: "Verified",
  },
  {
    id: "2",
    name: "Academic_Transcript.pdf",
    type: "Academic Transcript",
    size: "1.8 MB",
    date: "Nov 19, 2026",
    status: "Under Review",
  },
  {
    id: "3",
    name: "IELTS_Certificate.pdf",
    type: "Language Certificate",
    size: "950 KB",
    date: "Nov 18, 2026",
    status: "Pending",
  },
];

export function DocumentsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload, view and manage your submitted documents.
        </p>
      </div>

      {/* Upload area */}
      <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <span className="text-2xl">📄</span>
        </div>

        <div>
          <h2 className="font-semibold">Upload your documents</h2>
          <p className="text-sm text-muted-foreground mt-1">
            PDF, JPG, PNG or WEBP. Maximum file size 20 MB.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Choose Files
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length) {
                alert(
                  `Selected: ${files.map((file) => file.name).join(", ")}`
                );
              }
            }}
          />
        </label>
      </div>

      {/* Document summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total Documents</p>
          <p className="mt-2 text-2xl font-semibold">3</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Verified</p>
          <p className="mt-2 text-2xl font-semibold text-green-600">1</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Under Review</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">1</p>
        </div>
      </div>

      {/* Documents list */}
      <div className="rounded-xl border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Uploaded Documents</h2>
          <p className="text-sm text-muted-foreground">
            Your submitted files and their review status.
          </p>
        </div>

        <div className="divide-y">
          {demoDocuments.map((document) => (
            <div
              key={document.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                  📎
                </div>

                <div>
                  <p className="font-medium">{document.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {document.type} · {document.size} · {document.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    document.status === "Verified"
                      ? "bg-green-100 text-green-700"
                      : document.status === "Under Review"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {document.status}
                </span>

                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => alert(`Demo preview: ${document.name}`)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
