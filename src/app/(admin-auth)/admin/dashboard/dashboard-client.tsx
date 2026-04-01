"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FadeIn } from "@/components/fade-in";
import { deleteEvent } from "@/lib/actions/events";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  date: string;
  status: string;
  qrToken: string;
  participantCount: number;
  scoreCount: number;
}

export function DashboardClient({ events: initialEvents }: { events: Event[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const filtered = events.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.date.includes(search)
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteEvent(deleteTarget.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} deleted`);
      router.refresh();
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  if (events.length === 0) {
    return (
      <FadeIn>
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium">No events yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Create your first event to get started.</p>
          </div>
          <Link href="/admin/event/new">
            <Button className="mt-2 cursor-pointer">Create your first event →</Button>
          </Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="space-y-4">
      <FadeIn>
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10"
        />
      </FadeIn>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No events match &ldquo;{search}&rdquo;
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -200, transition: { duration: 0.25 } }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:bg-muted/50 transition-colors duration-150 group">
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <Link href={`/admin/event/${event.id}`} className="min-w-0 mr-3 flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base truncate">
                            {event.name}
                          </CardTitle>
                          <Badge
                            variant={event.status === "active" ? "default" : "secondary"}
                            className="shrink-0 text-[10px]"
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                          {event.date} · {event.participantCount} participants · {event.scoreCount} scores
                        </CardDescription>
                      </Link>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTarget(event);
                          }}
                          className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer md:opacity-0 md:group-hover:opacity-100"
                          aria-label={`Delete ${event.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                        <Link href={`/admin/event/${event.id}`}>
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and
              all its participants, scores, and judge data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 cursor-pointer"
            >
              {deleting ? "Deleting..." : "Delete Event"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
