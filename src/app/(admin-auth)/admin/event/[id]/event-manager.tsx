"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addParticipant, deleteParticipant } from "@/lib/actions/events";
import { EditParticipantDialog } from "@/components/edit-participant-dialog";
import { FadeIn } from "@/components/fade-in";
import { BlurFade } from "@/components/reactbits/blur-fade";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Participant {
  id: string;
  name: string;
  projectTitle: string;
  grade?: string;
  type?: string;
  members?: string[];
  parentEmail?: string;
  needsOutlet?: boolean;
  projectCategory?: string;
  table?: number;
  location?: number;
}

export function EventManager({
  eventId,
  initialParticipants,
}: {
  eventId: string;
  initialParticipants: Participant[];
}) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isTeam, setIsTeam] = useState(false);
  const [memberInputs, setMemberInputs] = useState(["", "", ""]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "team">("list");
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = [
    "Science",
    "Technology",
    "Engineering",
    "Mathematics",
  ];

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }
  const router = useRouter();

  async function handleAdd(formData: FormData) {
    setAdding(true);

    if (isTeam) {
      const members = memberInputs.filter((m) => m.trim());
      if (members.length === 0) {
        toast.error("Add at least one team member");
        setAdding(false);
        return;
      }
      if (members.length > 4) {
        toast.error("A team can have no more than 4 members");
        setAdding(false);
        return;
      }
      formData.set("type", "team");
      formData.set("members", members.join(","));
    } else {
      formData.set("type", "individual");
    }

    formData.set("projectCategory", selectedCategories.join(", "));

    const result = await addParticipant(eventId, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      const name = formData.get("name") as string;
      const projectTitle = formData.get("projectTitle") as string;
      const grade = (formData.get("grade") as string) || "";
      const parentEmail = (formData.get("parentEmail") as string) || "";
      const needsOutlet = formData.get("needsOutlet") === "true";
      const projectCategory = (formData.get("projectCategory") as string) || "";
      const table = formData.get("table") ? Number(formData.get("table")) : undefined;
      const location = formData.get("location") ? Number(formData.get("location")) : undefined;
      const members = isTeam ? memberInputs.filter((m) => m.trim()) : [];
      setParticipants((prev) => [
        ...prev,
        { id: result.id!, name, projectTitle, grade, type: isTeam ? "team" : "individual", members, parentEmail, needsOutlet, projectCategory, table, location },
      ]);
      toast.success(`${name} added`);
      setMemberInputs(["", "", ""]);
      setSelectedCategories([]);
      router.refresh();
    }
    setAdding(false);
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const text = await file.text();
    const lines = text.split("\n").map((l) => l.trimEnd()).filter(Boolean);

    if (lines.length < 2) {
      toast.error("File is empty or has no data rows.");
      setImporting(false);
      return;
    }

    // CSV parser that handles quoted fields with commas inside
    function parseCSVLine(line: string): string[] {
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if ((ch === "," || ch === "\t") && !inQuotes) {
          fields.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      fields.push(current.trim());
      return fields;
    }

    const firstLine = lines[0];
    const headerFields = parseCSVLine(firstLine);

    // Parse header to find column indices
    const headers = headerFields.map((h) => h.toLowerCase().replace(/[()]/g, ""));

    console.log("[CSV Import] Headers:", headers);

    const colMap = {
      email: headers.findIndex((h) => h.includes("email")),
      power: headers.findIndex((h) => h.includes("power") || h.includes("outlet")),
      location: headers.findIndex((h) => h === "location"),
      table: headers.findIndex((h) => h === "table"),
      names: headers.findIndex((h) => h.includes("participantname") || h === "name" || h === "names"),
      teamCount: headers.findIndex((h) => h.includes("teamcount") || h.includes("team count") || h === "count"),
      grade: headers.findIndex((h) => h.includes("grade")),
      teacher: headers.findIndex((h) => h.includes("teacher")),
      project: headers.findIndex((h) => h.includes("project name")),
      category: headers.findIndex((h) => h.includes("category")),
    };

    console.log("[CSV Import] Column map:", colMap);

    const hasKnownHeaders = colMap.names !== -1 || colMap.email !== -1;

    const dataLines = hasKnownHeaders ? lines.slice(1) : (
      firstLine.toLowerCase().includes("name") || firstLine.toLowerCase().includes("email")
        ? lines.slice(1)
        : lines
    );

    let added = 0;
    let failed = 0;
    let skipped = 0;

    for (const line of dataLines) {
      if (!line.trim()) continue;

      const parts = parseCSVLine(line);

      // Parse columns
      const participantNames = hasKnownHeaders
        ? (colMap.names !== -1 ? parts[colMap.names] || "" : "")
        : (parts[0] || "");
      const projectTitle = hasKnownHeaders
        ? (colMap.project !== -1 ? parts[colMap.project] || "" : "")
        : (parts[1] || "");
      const grade = hasKnownHeaders
        ? (colMap.grade !== -1 ? parts[colMap.grade] || "" : "")
        : (parts[2] || "");
      const parentEmail = hasKnownHeaders
        ? (colMap.email !== -1 ? parts[colMap.email] || "" : "")
        : "";
      const powerVal = hasKnownHeaders
        ? (colMap.power !== -1 ? parts[colMap.power] || "" : "")
        : "";
      const needsOutlet = powerVal.toLowerCase() === "yes";
      const location = hasKnownHeaders && colMap.location !== -1 && parts[colMap.location]
        ? Number(parts[colMap.location]) || undefined
        : undefined;
      const table = hasKnownHeaders && colMap.table !== -1 && parts[colMap.table]
        ? Number(parts[colMap.table]) || undefined
        : undefined;
      const projectCategory = hasKnownHeaders
        ? (colMap.category !== -1 ? parts[colMap.category] || "" : "")
        : "";
      const teamCount = hasKnownHeaders && colMap.teamCount !== -1
        ? Number(parts[colMap.teamCount]) || 1
        : 1;

      if (!participantNames.trim()) { skipped++; continue; }

      // Split names by comma — the CSV parser already extracted the quoted field correctly
      // so "Aadhi Om Prakash, Ahir Rakshit" is now the raw string with commas
      const nameList = participantNames.split(",").map((n) => n.trim()).filter(Boolean);
      const isTeamEntry = teamCount > 1 || nameList.length > 1;
      const members = isTeamEntry ? nameList : [];

      console.log(`[CSV Import] "${participantNames}" → teamCount=${teamCount}, nameList=${nameList.length}, isTeam=${isTeamEntry}`, members);

      // Team name: use project name if it's real, otherwise Team#Location
      const displayName = isTeamEntry
        ? (projectTitle && projectTitle.toLowerCase() !== "tbd" && projectTitle.trim() !== ""
          ? projectTitle
          : `Team#${location || "?"}`)
        : nameList[0];

      const formData = new FormData();
      formData.set("name", displayName);
      formData.set("projectTitle", projectTitle || "");
      formData.set("grade", grade);
      formData.set("parentEmail", parentEmail);
      formData.set("needsOutlet", needsOutlet ? "true" : "false");
      formData.set("projectCategory", projectCategory);
      if (location) formData.set("location", String(location));
      if (table) formData.set("table", String(table));
      if (isTeamEntry) {
        formData.set("type", "team");
        formData.set("members", members.join(","));
      }

      const result = await addParticipant(eventId, formData);
      if (result.error) {
        failed++;
      } else {
        setParticipants((prev) => [
          ...prev,
          {
            id: result.id!,
            name: displayName,
            projectTitle: projectTitle || "",
            grade,
            type: isTeamEntry ? "team" : "individual",
            members,
            parentEmail,
            needsOutlet,
            projectCategory,
            table,
            location,
          },
        ]);
        added++;
      }
    }

    const msg = [`${added} imported`];
    if (failed > 0) msg.push(`${failed} failed`);
    if (skipped > 0) msg.push(`${skipped} skipped`);

    if (added > 0) {
      toast.success(msg.join(", "));
      router.refresh();
    } else {
      toast.error(msg.join(", ") || "No participants found.");
    }

    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDelete(participant: Participant) {
    setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
    const undoTimeout = setTimeout(() => {
      deleteParticipant(eventId, participant.id);
    }, 4000);

    toast(`${participant.name} removed`, {
      action: {
        label: "Undo",
        onClick: () => {
          clearTimeout(undoTimeout);
          setParticipants((prev) => {
            if (prev.find((p) => p.id === participant.id)) return prev;
            return [...prev, participant];
          });
        },
      },
      duration: 4000,
    });
  }

  function updateMember(index: number, value: string) {
    setMemberInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addMemberSlot() {
    if (memberInputs.length >= 4) return;
    setMemberInputs((prev) => [...prev, ""]);
  }

  function removeMemberSlot(index: number) {
    if (memberInputs.length <= 1) return;
    setMemberInputs((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-8">
      {/* Add Participant Form */}
      <FadeIn>
        <div>
          <h2 className="text-sm font-semibold mb-3">Add Participant</h2>

          {/* Individual / Team toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4 w-fit">
            <button
              type="button"
              onClick={() => setIsTeam(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                !isTeam ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setIsTeam(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                isTeam ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              Team (up to 4)
            </button>
          </div>

          <form action={handleAdd} className="space-y-3">
            <div className={`grid ${isTeam ? "grid-cols-2" : "grid-cols-[1fr_1fr_80px]"} gap-3`}>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  {isTeam ? "Team Name" : "Name"}
                </Label>
                <Input id="name" name="name" placeholder={isTeam ? "e.g. Team Rocket" : "e.g. Sarah Chen"} required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="projectTitle" className="text-xs">Project Title</Label>
                <Input id="projectTitle" name="projectTitle" placeholder="e.g. Volcano Simulation" required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grade" className="text-xs">Grade</Label>
                <Input id="grade" name="grade" placeholder={isTeam ? "Highest grade" : "e.g. 6th"} className="h-10" />
                {isTeam && (
                  <p className="text-[10px] text-muted-foreground">Use the highest grade number in the team</p>
                )}
              </div>
            </div>

            {/* Team members */}
            <AnimatePresence>
              {isTeam && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-1">
                    <Label className="text-xs text-muted-foreground">Team Members</Label>
                    {memberInputs.map((member, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={member}
                          onChange={(e) => updateMember(i, e.target.value)}
                          placeholder={`Member ${i + 1} name`}
                          className="h-9 text-sm"
                        />
                        {memberInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMemberSlot(i)}
                            className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {memberInputs.length < 4 && (
                      <button
                        type="button"
                        onClick={addMemberSlot}
                        className="text-xs text-primary font-medium cursor-pointer hover:underline"
                      >
                        + Add member
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Additional fields */}
            <div className="grid grid-cols-[1fr_80px_80px] gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="parentEmail" className="text-xs">Parent Email <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="parentEmail" name="parentEmail" type="email" placeholder="parent@email.com" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="table" className="text-xs">Table #</Label>
                <Input id="table" name="table" type="number" min={1} placeholder="1" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs">Location #</Label>
                <Input id="location" name="location" type="number" min={1} placeholder="1" className="h-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Project Categories <span className="text-muted-foreground font-normal">(optional, select all that apply)</span></Label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => {
                  const selected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-input hover:border-primary/50"
                      }`}
                    >
                      {selected && "✓ "}{cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="needsOutlet" name="needsOutlet" value="true" className="h-4 w-4 rounded border-input cursor-pointer accent-primary" />
              <Label htmlFor="needsOutlet" className="text-xs cursor-pointer">Needs electrical outlet</Label>
            </div>

            <div className="flex gap-2 items-center">
              <Button type="submit" disabled={adding} size="sm" className="cursor-pointer">
                {adding ? "Adding..." : isTeam ? "+ Add Team" : "+ Add Participant"}
              </Button>
              <span className="text-xs text-muted-foreground">or</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleCSVImport}
                className="hidden"
                id="csv-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={importing}
                onClick={() => fileInputRef.current?.click()}
              >
                {importing ? "Importing..." : (
                  <>
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Import CSV
                  </>
                )}
              </Button>
            </div>
          </form>

          <BlurFade delay={0.2}>
            <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-1">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground/70">Supports two formats:</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                <span className="font-medium">STEM Fair</span> (tab-separated): Email, Power, Location, Table, Names, TeamCount, Grade, Teacher, Project, Category
              </p>
              <p className="text-[10px] text-muted-foreground">
                <span className="font-medium">Simple</span> (comma-separated): <code className="bg-muted px-1 py-0.5 rounded">Name, Project, Grade</code>
              </p>
            </div>
          </BlurFade>
        </div>
      </FadeIn>

      {/* Participant List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">
            Participants ({participants.length})
            <span className="text-muted-foreground font-normal ml-1">
              · {participants.filter((p) => p.type === "team").length} teams
              · {participants.filter((p) => p.type !== "team").length} individual
            </span>
          </h2>
          {/* View toggle */}
          <div className="flex gap-0.5 p-0.5 bg-muted rounded-md">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded cursor-pointer transition-colors ${viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              aria-label="List view"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("team")}
              className={`p-1.5 rounded cursor-pointer transition-colors ${viewMode === "team" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              aria-label="Team view"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </button>
          </div>
        </div>

        {participants.length === 0 ? (
          <FadeIn>
            <p className="text-sm text-muted-foreground py-8 text-center">
              No participants yet. Add one above or import a CSV.
            </p>
          </FadeIn>
        ) : viewMode === "team" ? (
          /* ── TEAM VIEW ── */
          <div className="space-y-4">
            {/* Teams */}
            {participants.filter((p) => p.type === "team").length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Teams ({participants.filter((p) => p.type === "team").length})
                </p>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {participants.filter((p) => p.type === "team").map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -200, transition: { duration: 0.25 } }}
                        className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] group hover:bg-primary/[0.04] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{p.name}</span>
                              <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                {p.members?.length || 0} members
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {p.projectTitle && <span>{p.projectTitle}</span>}
                              {p.grade && <span className="ml-1.5">· Grade {p.grade}</span>}
                              {p.projectCategory && <span className="ml-1.5">· {p.projectCategory}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingParticipant(p)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                              aria-label={`Edit ${p.name}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              aria-label={`Remove ${p.name}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {/* Member list */}
                        <div className="space-y-1 ml-1">
                          {p.members?.map((member, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                                {member.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs">{member}</span>
                            </div>
                          ))}
                        </div>
                        {/* Badges */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {p.location && (
                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">Loc {p.location}</span>
                          )}
                          {p.table && (
                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">Table {p.table}</span>
                          )}
                          {p.needsOutlet && (
                            <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">Outlet</span>
                          )}
                          {p.parentEmail && (
                            <span className="text-[10px] text-muted-foreground/50 truncate max-w-[180px]">{p.parentEmail}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Individuals */}
            {participants.filter((p) => p.type !== "team").length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Individual ({participants.filter((p) => p.type !== "team").length})
                </p>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {participants.filter((p) => p.type !== "team").map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -200, transition: { duration: 0.25 } }}
                        className="flex items-center justify-between p-3 rounded-lg border group hover:bg-muted/30 transition-colors"
                      >
                        <div className="min-w-0 mr-3">
                          <div className="font-medium text-sm">{p.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {p.projectTitle && <span>{p.projectTitle}</span>}
                            {p.grade && <span className="ml-1.5">· Grade {p.grade}</span>}
                            {p.projectCategory && <span className="ml-1.5">· {p.projectCategory}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {p.location && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">Loc {p.location}</span>}
                            {p.table && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">Table {p.table}</span>}
                            {p.needsOutlet && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">Outlet</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(p)}
                          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          aria-label={`Remove ${p.name}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {participants.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -200, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 rounded-lg border group hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 mr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{p.name}</span>
                      {p.type === "team" ? (
                        <span className="shrink-0 text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          Team · {p.members?.length || 0}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          Solo
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.projectTitle && <span>{p.projectTitle}</span>}
                      {p.grade && <span className="ml-1.5">· Grade {p.grade}</span>}
                      {p.projectCategory && <span className="ml-1.5">· {p.projectCategory}</span>}
                    </div>
                    {/* Team members shown inline */}
                    {p.type === "team" && p.members && p.members.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {p.members.map((member, i) => (
                          <span key={i} className="text-[10px] bg-primary/5 text-primary/80 px-2 py-0.5 rounded-full">
                            {member}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {p.location && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">Loc {p.location}</span>}
                      {p.table && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">Table {p.table}</span>}
                      {p.needsOutlet && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">Outlet</span>}
                      {p.parentEmail && <span className="text-[10px] text-muted-foreground/50 truncate max-w-[150px]">{p.parentEmail}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingParticipant(p)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      aria-label={`Edit ${p.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      aria-label={`Remove ${p.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      {editingParticipant && (
        <EditParticipantDialog
          eventId={eventId}
          participant={editingParticipant}
          open={!!editingParticipant}
          onClose={() => setEditingParticipant(null)}
          onSaved={(updated) => {
            setParticipants((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
