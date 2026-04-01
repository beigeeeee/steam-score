"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateParticipant } from "@/lib/actions/events";
import { toast } from "sonner";

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

interface EditParticipantDialogProps {
  eventId: string;
  participant: Participant;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: Participant) => void;
}

export function EditParticipantDialog({
  eventId,
  participant,
  open,
  onClose,
  onSaved,
}: EditParticipantDialogProps) {
  const [name, setName] = useState(participant.name);
  const [projectTitle, setProjectTitle] = useState(participant.projectTitle || "");
  const [grade, setGrade] = useState(participant.grade || "");
  const [parentEmail, setParentEmail] = useState(participant.parentEmail || "");
  const [needsOutlet, setNeedsOutlet] = useState(participant.needsOutlet || false);
  const [projectCategory, setProjectCategory] = useState(participant.projectCategory || "");
  const [table, setTable] = useState(participant.table?.toString() || "");
  const [location, setLocation] = useState(participant.location?.toString() || "");
  const [isTeam, setIsTeam] = useState(participant.type === "team");
  const [members, setMembers] = useState<string[]>(
    participant.members && participant.members.length > 0
      ? participant.members
      : [""]
  );
  const [saving, setSaving] = useState(false);

  function updateMember(index: number, value: string) {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addMember() {
    if (members.length >= 4) return;
    setMembers((prev) => [...prev, ""]);
  }

  function removeMember(index: number) {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);

    const cleanMembers = isTeam ? members.filter((m) => m.trim()) : [];

    const result = await updateParticipant(eventId, participant.id, {
      name: name.trim(),
      projectTitle: projectTitle.trim(),
      grade: grade.trim(),
      type: isTeam ? "team" : "individual",
      members: cleanMembers,
      parentEmail: parentEmail.trim(),
      needsOutlet,
      projectCategory: projectCategory.trim(),
      table: table ? Number(table) : undefined,
      location: location ? Number(location) : undefined,
    });

    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`${name} updated`);
    onSaved({
      ...participant,
      name: name.trim(),
      projectTitle: projectTitle.trim(),
      grade: grade.trim(),
      type: isTeam ? "team" : "individual",
      members: cleanMembers,
      parentEmail: parentEmail.trim(),
      needsOutlet,
      projectCategory: projectCategory.trim(),
      table: table ? Number(table) : undefined,
      location: location ? Number(location) : undefined,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {isTeam ? "Team" : "Participant"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Type toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
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
              Team
            </button>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">{isTeam ? "Team Name" : "Name"}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <Label className="text-xs">Project Title</Label>
            <Input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className="h-10" />
          </div>

          {/* Grade (individuals only) */}
          {!isTeam && (
            <div className="space-y-1.5">
              <Label className="text-xs">Grade</Label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} className="h-10" placeholder="e.g. 3" />
            </div>
          )}

          {/* Team members */}
          {isTeam && (
            <div className="space-y-2">
              <Label className="text-xs">Team Members</Label>
              {members.map((member, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={member}
                    onChange={(e) => updateMember(i, e.target.value)}
                    placeholder={`Member ${i + 1}`}
                    className="h-9 text-sm"
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {members.length < 4 && (
                <button type="button" onClick={addMember} className="text-xs text-primary font-medium cursor-pointer hover:underline">
                  + Add member
                </button>
              )}
            </div>
          )}

          {/* Email + Table + Location */}
          <div className="grid grid-cols-[1fr_70px_70px] gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Parent Email</Label>
              <Input value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} type="email" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Table</Label>
              <Input value={table} onChange={(e) => setTable(e.target.value)} type="number" min={1} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} type="number" min={1} className="h-10" />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs">Project Category</Label>
            <Input value={projectCategory} onChange={(e) => setProjectCategory(e.target.value)} className="h-10" />
          </div>

          {/* Outlet */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={needsOutlet}
              onChange={(e) => setNeedsOutlet(e.target.checked)}
              className="h-4 w-4 rounded border-input cursor-pointer accent-primary"
            />
            <Label className="text-xs cursor-pointer">Needs electrical outlet</Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 cursor-pointer">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
