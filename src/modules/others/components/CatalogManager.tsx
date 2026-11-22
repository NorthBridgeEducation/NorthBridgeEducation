
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Globe2, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Country = {
  id: string;
  name: string;
  is_active: boolean;
};

type University = {
  id: string;
  name: string;
  country_id: string;
  is_active: boolean;
  country?: { id: string; name: string } | null;
};

type CatalogItem = Country | University;

const API = "/api/admin/catalog";

export function CatalogManager() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [type, setType] = useState<"country" | "university">("country");
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  async function loadCatalog() {
    setLoading(true);
    try {
      const response = await fetch(API, { credentials: "include" });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Could not load data.");

      setCountries(result.countries || []);
      setUniversities(result.universities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load catalog.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCatalog();
  }, []);

  const filteredCountries = useMemo(
    () => countries.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    ),
    [countries, search],
  );

  const filteredUniversities = useMemo(
    () => universities.filter((item) =>
      `${item.name} ${item.country?.name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ),
    [universities, search],
  );

  function openCreate(nextType: "country" | "university") {
    setType(nextType);
    setEditing(null);
    setName("");
    setCountryId("");
    setIsActive(true);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(item: CatalogItem, nextType: "country" | "university") {
    setType(nextType);
    setEditing(item);
    setName(item.name);
    setCountryId("country_id" in item ? item.country_id : "");
    setIsActive(item.is_active);
    setError("");
    setDialogOpen(true);
  }

  async function saveItem() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (type === "university" && !countryId) {
      setError("Please select a country.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        type,
        name: name.trim(),
        is_active: isActive,
        ...(type === "university" ? { country_id: countryId } : {}),
      };

      const response = await fetch(API, {
        method: editing ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          ...(editing ? { id: editing.id } : {}),
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Save failed.");

      setDialogOpen(false);
      await loadCatalog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string, itemType: "country" | "university") {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${itemType}?`
    );
    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(
        `${API}?id=${encodeURIComponent(id)}&type=${itemType}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, type: itemType }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Delete failed.");

      await loadCatalog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  function Status({ active }: { active: boolean }) {
    return (
      <Badge variant="outline" className={
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-muted text-muted-foreground"
      }>
        {active ? "Active" : "Inactive"}
      </Badge>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Countries & Universities</h2>
        <p className="text-sm text-muted-foreground">
          Manage the destinations and institutions available in the student portal.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search countries or universities..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Tabs defaultValue="countries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="countries" className="gap-2">
            <Globe2 className="size-4" /> Countries ({countries.length})
          </TabsTrigger>
          <TabsTrigger value="universities" className="gap-2">
            <GraduationCap className="size-4" /> Universities ({universities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="countries">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Countries</CardTitle>
              <Button size="sm" onClick={() => openCreate("country")}>
                <Plus className="mr-2 size-4" /> Add Country
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
              ) : filteredCountries.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No countries found.</p>
              ) : filteredCountries.map((country) => (
                <div key={country.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                  <Globe2 className="size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{country.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {universities.filter((u) => u.country_id === country.id).length} universities
                    </p>
                  </div>
                  <Status active={country.is_active} />
                  <Button size="icon" variant="ghost" onClick={() => openEdit(country, "country")}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteItem(country.id, "country")}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="universities">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Universities</CardTitle>
              <Button size="sm" onClick={() => openCreate("university")}>
                <Plus className="mr-2 size-4" /> Add University
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
              ) : filteredUniversities.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No universities found.</p>
              ) : filteredUniversities.map((university) => (
                <div key={university.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                  <GraduationCap className="size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{university.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {university.country?.name || "Country unavailable"}
                    </p>
                  </div>
                  <Status active={university.is_active} />
                  <Button size="icon" variant="ghost" onClick={() => openEdit(university, "university")}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteItem(university.id, "university")}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "Add"} {type === "country" ? "Country" : "University"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {type === "country" ? "Country Name" : "University Name"}
              </label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter name" />
            </div>

            {type === "university" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select value={countryId} onValueChange={setCountryId}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {countries.filter((country) => country.is_active).map((country) => (
                      <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={isActive ? "active" : "inactive"} onValueChange={(value) => setIsActive(value === "active")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveItem} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
