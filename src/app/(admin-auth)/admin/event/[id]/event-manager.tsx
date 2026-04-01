"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addParticipant, deleteParticipant } from "@/lib/actions/events";
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
  const [memberInputs, setMemberInputs] = useState(["", ""]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
      if (members.length > 3) {
        toast.error("A team can have no more than 3 members");
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
      setMemberInputs(["", ""]);
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
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    const firstLine = lines[0].toLowerCase();
    const hasHeader =
      firstLine.includes("name") ||
      firstLine.includes("team") ||
      firstLine.includes("project") ||
      firstLine.includes("title");

    const dataLines = hasHeader ? lines.slice(1) : lines;
    let added = 0;
    let failed = 0;

    for (const line of dataLines) {
      const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      const name = parts[0];
      const projectTitle = parts[1] || name;
      const grade = parts[2] || "";
      // 4th column onwards = team members (optional)
      const members = parts.slice(3).filter(Boolean);

      if (!name) continue;

      const formData = new FormData();
      formData.set("name", name);
      formData.set("projectTitle", projectTitle);
      formData.set("grade", grade);
      if (members.length > 0) {
        formData.set("type", "team");
        formData.set("members", members.join(","));
      }

      const result = await addParticipant(eventId, formData);
      if (result.error) {
        failed++;
      } else {
        setParticipants((prev) => [
          ...prev,
          { id: result.id!, name, projectTitle, grade, type: members.length > 0 ? "team" : "individual", members },
        ]);
        added++;
      }
    }

    if (added > 0) {
      toast.success(`${added} participant${added !== 1 ? "s" : ""} imported`);
      router.refresh();
    }
    if (failed > 0) toast.error(`${failed} row${failed !== 1 ? "s" : ""} failed`);
    if (added === 0 && failed === 0) toast.error("No participants found in CSV.");

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
    if (memberInputs.length >= 3) return;
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
              Team (up to 3)
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
              {!isTeam && (
                <div className="space-y-1.5">
                  <Label htmlFor="grade" className="text-xs">Grade</Label>
                  <Input id="grade" name="grade" placeholder="e.g. 6th" className="h-10" />
                </div>
              )}
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
                    {memberInputs.length < 3 && (
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
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground/70">CSV format:</span>{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-[10px]">Name, Project, Grade, Member1, Member2, Member3</code>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Members are optional. Individual: <code className="bg-muted px-1 py-0.5 rounded">Sarah Chen, Volcano Sim, 6th</code>
              </p>
            </div>
          </BlurFade>
        </div>
      </FadeIn>

      {/* Participant List */}
      <div>
        <h2 className="text-sm font-semibold mb-3">
          Participants ({participants.length})
        </h2>
        {participants.length === 0 ? (
          <FadeIn>
            <p className="text-sm text-muted-foreground py-8 text-center">
              No participants yet. Add one above or import a CSV.
            </p>
          </FadeIn>
        ) : (
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
                      <span className="font-medium text-sm truncate">{p.name}</span>
                      {p.type === "team" ? (
                        <span className="shrink-0 text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          Team
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          Solo
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {p.projectTitle}
                      {p.grade && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground/70">· {p.grade} grade</span>
                      )}
                      {p.projectCategory && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground/70">
                          · {p.projectCategory.split(", ").length > 2
                            ? `${p.projectCategory.split(", ").slice(0, 2).join(", ")} +${p.projectCategory.split(", ").length - 2}`
                            : p.projectCategory}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {p.type === "team" && p.members && p.members.length > 0 && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-muted-foreground/50 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          <span className="text-[10px] text-muted-foreground/70 truncate">
                            {p.members.join(", ")}
                          </span>
                        </div>
                      )}
                      {p.table && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                          Table {p.table}
                        </span>
                      )}
                      {p.location && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                          Loc {p.location}
                        </span>
                      )}
                      {p.needsOutlet && (
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                          Outlet
                        </span>
                      )}
                      {p.parentEmail && (
                        <span className="text-[10px] text-muted-foreground/50 truncate max-w-[150px]">
                          {p.parentEmail}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(p)}
                    className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer md:opacity-0 md:group-hover:opacity-100"
                    aria-label={`Remove ${p.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
