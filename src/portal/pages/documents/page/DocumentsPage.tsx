import { Button } from "@/components/ui/button";

import { DocumentList } from "../components/DocumentList";
import { DocumentUploadForm } from "../components/DocumentUploadForm";
import { usePortalDocuments } from "../hooks/usePortalDocuments";

type DocumentsState = ReturnType<typeof usePortalDocuments>;
type CertificateCategory = NonNullable<
  Parameters<typeof usePortalDocuments>[0]
>;

function DocumentBlock({
  title,
  documents,
}: {
  title: string;
  documents: DocumentsState;
}) {
  return (
    <div className="min-w-0 space-y-3">
      <DocumentList
        title={title}
        files={documents.files}
        loading={documents.loading}
        error={documents.listError}
        downloadingId={documents.downloadingId}
        onDownload={(file) => void documents.downloadDocument(file)}
      />

      {(documents.page > 0 || documents.hasMore) && (
        <nav aria-label={`${title} pages`} className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={documents.loading || documents.page === 0}
            onClick={() => documents.changePage(documents.page - 1)}
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={documents.loading || !documents.hasMore}
            onClick={() => documents.changePage(documents.page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}

function CertificateBlock({ category }: { category: CertificateCategory }) {
  const documents = usePortalDocuments(category);

  return (
    <div className="min-w-0 space-y-3">
      <DocumentBlock title={category} documents={documents} />

      {documents.actionError && (
        <p role="alert" className="text-sm text-destructive">
          {documents.actionError}
        </p>
      )}
    </div>
  );
}

export function DocumentsPage() {
  const documents = usePortalDocuments();
  const showCertificates = documents.documentFilter === "certificates";

  return (
    <section className="mx-auto w-full max-w-4xl space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">My Documents</h1>

      <div
        role="group"
        aria-label="Filter documents"
        className="flex flex-wrap gap-2"
      >
        <Button
          type="button"
          size="sm"
          variant={showCertificates ? "default" : "outline"}
          aria-pressed={showCertificates}
          onClick={() => documents.changeDocumentFilter("certificates")}
        >
          SSC &amp; HSC
        </Button>

        <Button
          type="button"
          size="sm"
          variant={showCertificates ? "outline" : "default"}
          aria-pressed={!showCertificates}
          onClick={() => documents.changeDocumentFilter("all")}
        >
          All Documents
        </Button>
      </div>

      {showCertificates ? (
        <section aria-labelledby="certificate-title" className="space-y-3">
          <h2 id="certificate-title" className="text-lg font-semibold">
            SSC &amp; HSC Certificates
          </h2>

          <div className="grid items-start gap-4 md:grid-cols-2">
            <CertificateBlock
              key={`ssc-${documents.revision}`}
              category="SSC Certificate"
            />
            <CertificateBlock
              key={`hsc-${documents.revision}`}
              category="HSC Certificate"
            />
          </div>
        </section>
      ) : (
        <DocumentBlock title="Uploaded Documents" documents={documents} />
      )}

      <DocumentUploadForm
        category={documents.category}
        hasSelectedFile={documents.hasSelectedFile}
        uploading={documents.uploading}
        onFileChange={documents.selectFile}
        onCategoryChange={documents.setCategory}
        onSubmit={(event) => void documents.uploadDocument(event)}
      />

      {documents.actionError && (
        <p role="alert" className="text-sm text-destructive">
          {documents.actionError}
        </p>
      )}
    </section>
  );
}