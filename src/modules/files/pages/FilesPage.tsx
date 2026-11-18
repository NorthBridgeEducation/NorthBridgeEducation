
import { useMemo, useState } from "react";
import {
  FileText,
  FileImage,
  FileCheck,
  FileClock,
  FileWarning,
  Upload,
  Search,
  Download,
  Eye,
  Trash2,
  MoreHorizontal,
  FolderOpen,
  Plus,
  Filter,
//   X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FileStatus = "Verified" | "Pending" | "Expired";
type FileCategory =
  | "Passport"
  | "Visa"
  | "Medical"
  | "Contract"
  | "Other";

type FileRecord = {
  id: number;
  name: string;
  candidate: string;
  candidateId: string;
  category: FileCategory;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  status: FileStatus;
};

const initialFiles: FileRecord[] = [
  {
    id: 1,
    name: "Passport_Rahim.pdf",
    candidate: "Abdul Rahim",
    candidateId: "CAN-001",
    category: "Passport",
    size: "2.4 MB",
    uploadedAt: "Nov 09, 2026",
    uploadedBy: "Admin",
    status: "Verified",
  },
  {
    id: 2,
    name: "Visa_Document.pdf",
    candidate: "Abdul Rahim",
    candidateId: "CAN-001",
    category: "Visa",
    size: "1.8 MB",
    uploadedAt: "Nov 08, 2026",
    uploadedBy: "Admin",
    status: "Pending",
  },
  {
    id: 3,
    name: "Medical_Report.pdf",
    candidate: "Mohammad Hasan",
    candidateId: "CAN-002",
    category: "Medical",
    size: "3.1 MB",
    uploadedAt: "Nov 07, 2026",
    uploadedBy: "Manager",
    status: "Verified",
  },
  {
    id: 4,
    name: "Employment_Contract.pdf",
    candidate: "Mohammad Hasan",
    candidateId: "CAN-002",
    category: "Contract",
    size: "1.2 MB",
    uploadedAt: "Nov 06, 2026",
    uploadedBy: "Admin",
    status: "Pending",
  },
  {
    id: 5,
    name: "Passport_Karim.jpg",
    candidate: "Abdul Karim",
    candidateId: "CAN-003",
    category: "Passport",
    size: "840 KB",
    uploadedAt: "Oct 28, 2026",
    uploadedBy: "Staff",
    status: "Expired",
  },
  {
    id: 6,
    name: "Other_Document.pdf",
    candidate: "Abdul Karim",
    candidateId: "CAN-003",
    category: "Other",
    size: "560 KB",
    uploadedAt: "Oct 25, 2026",
    uploadedBy: "Staff",
    status: "Verified",
  },
  {
    id: 7,
    name: "Medical_Report_Rafiq.pdf",
    candidate: "Rafiq Ahmed",
    candidateId: "CAN-004",
    category: "Medical",
    size: "2.1 MB",
    uploadedAt: "Oct 20, 2026",
    uploadedBy: "Manager",
    status: "Verified",
  },
];

const statusStyles: Record<FileStatus, string> = {
  Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Expired: "bg-red-50 text-red-700 border-red-200",
};

const categoryIcons: Record<FileCategory, typeof FileText> = {
  Passport: FileImage,
  Visa: FileText,
  Medical: FileCheck,
  Contract: FileText,
  Other: FileText,
};

export function FilesPage() {
  const [files, setFiles] = useState(initialFiles);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);

  const [newFile, setNewFile] = useState({
    name: "",
    candidate: "",
    category: "Passport" as FileCategory,
  });

  const stats = useMemo(() => ({
    total: files.length,
    verified: files.filter((f) => f.status === "Verified").length,
    pending: files.filter((f) => f.status === "Pending").length,
    expired: files.filter((f) => f.status === "Expired").length,
  }), [files]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(search.toLowerCase()) ||
        file.candidate.toLowerCase().includes(search.toLowerCase()) ||
        file.candidateId.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || file.category === category;

      const matchesStatus =
        status === "all" || file.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [files, search, category, status]);

  const handleUpload = () => {
    if (!newFile.name.trim() || !newFile.candidate.trim()) return;

    const record: FileRecord = {
      id: Date.now(),
      name: newFile.name,
      candidate: newFile.candidate,
      candidateId: "CAN-NEW",
      category: newFile.category,
      size: "1.0 MB",
      uploadedAt: "Nov 10, 2026",
      uploadedBy: "Admin",
      status: "Pending",
    };

    setFiles((prev) => [record, ...prev]);
    setNewFile({
      name: "",
      candidate: "",
      category: "Passport",
    });
    setUploadOpen(false);
  };

  const handleDelete = (id: number) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    setSelectedFile(null);
  };

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
  }: {
    title: string;
    value: number;
    description: string;
    icon: typeof FileText;
  }) => (
    <Card className="shadow-none">
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-3">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and organize candidate documents in one place.
          </p>
        </div>

        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 size-4" />
          Upload Document
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Files"
          value={stats.total}
          description="All uploaded documents"
          icon={FolderOpen}
        />
        <StatCard
          title="Verified"
          value={stats.verified}
          description="Successfully verified"
          icon={FileCheck}
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          description="Awaiting verification"
          icon={FileClock}
        />
        <StatCard
          title="Expired"
          value={stats.expired}
          description="Documents need attention"
          icon={FileWarning}
        />
      </div>

      {/* File List */}
      <Card className="shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">All Documents</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse and manage uploaded candidate files.
              </p>
            </div>
            <Badge variant="secondary">{filteredFiles.length} files</Badge>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by file, candidate or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="mr-2 size-4 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Passport">Passport</SelectItem>
                  <SelectItem value="Visa">Visa</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Document</th>
                  <th className="px-5 py-3 font-medium">Candidate</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Uploaded</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredFiles.map((file) => {
                  const Icon = categoryIcons[file.category];

                  return (
                    <tr
                      key={file.id}
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md border bg-muted/40 p-2">
                            <Icon className="size-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate font-medium">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {file.id === 1 ? "PDF Document" : "Document"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">{file.candidate}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.candidateId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant="outline">{file.category}</Badge>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {file.uploadedAt}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {file.size}
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={statusStyles[file.status]}
                        >
                          {file.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedFile(file)}
                            >
                              <Eye className="mr-2 size-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 size-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(file.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}

                {filteredFiles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <FolderOpen className="mx-auto mb-3 size-8 text-muted-foreground" />
                      <p className="font-medium">No documents found</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try changing your search or filters.
                      </p>
                      {(search || category !== "all" || status !== "all") && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            setCategory("all");
                            setStatus("all");
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a document to the candidate file records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Name</label>
              <Input
                placeholder="e.g. Passport_Rahim.pdf"
                value={newFile.name}
                onChange={(e) =>
                  setNewFile((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Candidate Name</label>
              <Input
                placeholder="Enter candidate name"
                value={newFile.candidate}
                onChange={(e) =>
                  setNewFile((prev) => ({ ...prev, candidate: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Document Category</label>
              <Select
                value={newFile.category}
                onValueChange={(value) =>
                  setNewFile((prev) => ({
                    ...prev,
                    category: value as FileCategory,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Passport">Passport</SelectItem>
                  <SelectItem value="Visa">Visa</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-dashed p-5 text-center">
              <Upload className="mx-auto mb-2 size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Demo upload</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This form adds a demo record. Real file storage is not connected.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!newFile.name.trim() || !newFile.candidate.trim()}
            >
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Details Dialog */}
      <Dialog
        open={!!selectedFile}
        onOpenChange={(open) => !open && setSelectedFile(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              Information about this document.
            </DialogDescription>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="rounded-lg bg-muted p-3">
                  <FileText className="size-6 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedFile.size}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Candidate</span>
                  <span className="font-medium">{selectedFile.candidate}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Candidate ID</span>
                  <span>{selectedFile.candidateId}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Category</span>
                  <span>{selectedFile.category}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Uploaded By</span>
                  <span>{selectedFile.uploadedBy}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Upload Date</span>
                  <span>{selectedFile.uploadedAt}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={statusStyles[selectedFile.status]}
                  >
                    {selectedFile.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFile(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
