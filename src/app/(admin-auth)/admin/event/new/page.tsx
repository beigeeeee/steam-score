"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createEvent } from "@/lib/actions/events";
import { BlurFade } from "@/components/reactbits/blur-fade";
import { Magnet } from "@/components/reactbits/magnet";
import { AppHeader } from "@/components/app-header";
import { toast } from "sonner";
import Link from "next/link";

export default function NewEventPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const name = formData.get("name") as string;
    if (!name?.trim()) { setError("Event name is required"); setLoading(false); return; }
    const month = formData.get("month") as string;
    const day = formData.get("day") as string;
    const year = formData.get("year") as string;
    if (!month || !day || !year) { setError("Event date is required"); setLoading(false); return; }
    formData.set("date", `${year}-${month}-${String(day).padStart(2, "0")}`);
    const result = await createEvent(formData);
    if (result.error) { setError(result.error); setLoading(false); return; }
    toast.success(`${name} created!`);
    router.push(`/admin/event/${result.id}`);
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <AppHeader title="New Event" backLabel="Events" backHref="/admin/dashboard" />

      <div className="flex-1 p-5 max-w-lg mx-auto w-full">
        <BlurFade delay={0.1}>
          <p className="text-sm text-muted-foreground mb-6">
            Set up a new STEM competition for judges to score.
          </p>
        </BlurFade>

        <BlurFade delay={0.2}>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input id="name" name="name" placeholder="Spring Science Fair 2026" required autoFocus className="h-12 text-base" />
            </div>
            <div className="space-y-2">
              <Label>Event Date</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <select name="month" required className="h-12 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
                    <option value="">Month</option>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                      <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input name="day" type="number" min={1} max={31} placeholder="Day" required className="h-12 text-base" />
                </div>
                <div>
                  <Input name="year" type="number" min={2024} max={2099} placeholder="Year" defaultValue={new Date().getFullYear()} required className="h-12 text-base" />
                </div>
              </div>
              <input type="hidden" name="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea id="description" name="description" placeholder="Annual school science fair for grades 6-8..." rows={3} className="resize-none text-base" />
            </div>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            <Magnet strength={0.1}>
              <Button type="submit" className="w-full h-12 text-base cursor-pointer shadow-sm shadow-primary/20" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </Magnet>
          </form>
        </BlurFade>
      </div>
    </div>
  );
}
