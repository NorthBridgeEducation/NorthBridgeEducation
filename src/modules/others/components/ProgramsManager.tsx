
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type University = {
  id: string;
  name: string;
  is_active: boolean;
  country?: { id: string; name: string } | null;
};

type Program = {
  id: string;
  name: string;
  degree_level: string;
  description: string | null;
  university_id: string;
  is_active: boolean;
  university?: University | null;
};

const API = "/api/admin/programs";
const LEVELS = ["Bachelor", "Master", "PhD", "Diploma", "Other"];

export function ProgramsManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [name, setName] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("Bachelor");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [programResponse, catalogResponse] = await Promise.all([
        fetch(API, { credentials: "include" }),
        fetch("/api/admin/catalog", { credentials: "include" }),
      ]);

      const [programResult, catalogResult] = await Promise.all([
        programResponse.json(),
        catalogResponse.json(),
      ]);

      if (!programResponse.ok) {
        throw new Error(programResult.message || "Could not load programs.");
      }

      if (!catalogResponse.ok) {
        throw new Error(catalogResult.message || "Could not load universities.");
      }

      setPrograms(programResult.programs || []);
      setUniversities(catalogResult.universities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredPrograms = useMemo(() => {
    const term = search.toLowerCase();

    return programs.filter((program) =>
      [
        program.name,
        program.degree_level,
        program.university?.name || "",
        program.university?.country?.name || "",
      ].join(" ").toLowerCase().includes(term)
    );
  }, [programs, search]);

  function openCreate() {
    setEditing(null);
    setName("");
    setUniversityId("");
    setDegreeLevel("Bachelor");
    setDescription("");
    setIsActive(true);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(program: Program) {
    setEditing(program);
    setName(program.name);
    setUniversityId(program.university_id);
    setDegreeLevel(program.degree_level);
    setDescription(program.description || "");
    setIsActive(program.is_active);
    setError("");
    setDialogOpen(true);
  }

  async function saveProgram() {
    if (!name.trim() || !universityId || !degreeLevel) {
      setError("Program name, university and degree level are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(API, {
        method: editing ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editing ? { id: editing.id } : {}),
          name: name.trim(),
          university_id: universityId,
          degree_level: degreeLevel,
          description: description.trim() || null,
          is_active: isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not save program.");
      }

      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save program.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProgram(program: Program) {
    if (!window.confirm(`Delete "${program.name}"?`)) return;

    setError("");

    try {
      const response = await fetch(
        `${API}?id=${encodeURIComponent(program.id)}`,
        { method: "DELETE", credentials: "include" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete program.");
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete program.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Programs Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage programs offered by each university.
          </p>
        </div>

        <Button onClick={openCreate} disabled={universities.length === 0}>
          <Plus className="mr-2 size-4" />
          Add Program
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search programs, universities or countries..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            Programs ({programs.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading programs...
            </p>
          ) : filteredPrograms.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No programs found.
            </p>
          ) : (
            filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
              >
                <GraduationCap className="size-5 text-muted-foreground" />

                <div className="min-w-0 flex-1">
                  <p className="font-medium">{program.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {program.university?.name || "University unavailable"}
                    {" · "}
                    {program.university?.country?.name || "Country unavailable"}
                    {" · "}
                    {program.degree_level}
                  </p>
                  {program.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {program.description}
                    </p>
                  )}
                </div>

                <Badge variant="outline">
                  {program.is_active ? "Active" : "Inactive"}
                </Badge>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(program)}
                >
                  <Pencil className="size-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => deleteProgram(program)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Program" : "Add Program"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Program Name</label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Computer Science"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">University</label>
              <Select value={universityId} onValueChange={setUniversityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities
                    .filter((university) => university.is_active)
                    .map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name}
                        {university.country?.name
                          ? ` — ${university.country.name}`
                          : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Degree Level</label>
              <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select degree level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional program details"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(value) => setIsActive(value === "active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveProgram} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Program" : "Create Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
