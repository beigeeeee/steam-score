"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { loginWithPassword } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/app-header";
import { BlurFade } from "@/components/reactbits/blur-fade";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { Magnet } from "@/components/reactbits/magnet";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const lockoutUntil = useRef<number>(0);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Date.now() < lockoutUntil.current) {
      const secs = Math.ceil((lockoutUntil.current - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${secs}s.`);
      return;
    }
    setLoading(true);
    setError("");
    const result = await loginWithPassword(password);
    if (result.error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        lockoutUntil.current = Date.now() + 30000;
        setError("Too many attempts. Try again in 30s.");
      } else {
        setError(result.error);
      }
      setLoading(false);
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <AppHeader backLabel="Home" backHref="/" />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <BlurFade delay={0.1}>
            <div className="text-center space-y-3">
              <motion.div
                className="w-28 h-28 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <svg className="w-16 h-16" viewBox="0 0 48 48" fill="none">
                  {/* Shackle (U-shape) */}
                  <path
                    d="M15 22 L15 16 C15 10.5 19 7 24 7 C29 7 33 10.5 33 16 L33 22"
                    stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none"
                  />
                  {/* Shackle inner highlight */}
                  <path
                    d="M17 22 L17 16.5 C17 12 20 9 24 9 C28 9 31 12 31 16.5 L31 22"
                    stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"
                  />

                  {/* Lock body */}
                  <rect x="10" y="22" width="28" height="20" rx="3" fill="#90a4ae" stroke="#1e293b" strokeWidth="2" />
                  {/* Body top highlight */}
                  <rect x="12" y="23" width="24" height="3" rx="1" fill="#b0bec5" opacity="0.6" />
                  {/* Body shadow */}
                  <rect x="12" y="38" width="24" height="2" rx="1" fill="#78909c" opacity="0.5" />

                  {/* Keyhole outer */}
                  <circle cx="24" cy="31" r="4" fill="#607d8b" stroke="#1e293b" strokeWidth="1.5" />
                  {/* Keyhole inner */}
                  <circle cx="24" cy="31" r="2" fill="#455a64" />
                  {/* Keyhole shine */}
                  <circle cx="23" cy="30" r="0.8" fill="#90a4ae" opacity="0.7" />
                  {/* Keyhole slot */}
                  <rect x="23" y="33" width="2" height="4" rx="0.5" fill="#455a64" />

                  {/* Lock edge screws */}
                  <circle cx="14" cy="26" r="1" fill="#78909c" stroke="#1e293b" strokeWidth="0.5" />
                  <circle cx="34" cy="26" r="1" fill="#78909c" stroke="#1e293b" strokeWidth="0.5" />
                  <circle cx="14" cy="38" r="1" fill="#78909c" stroke="#1e293b" strokeWidth="0.5" />
                  <circle cx="34" cy="38" r="1" fill="#78909c" stroke="#1e293b" strokeWidth="0.5" />
                </svg>
              </motion.div>
              <h1 className="text-2xl font-bold tracking-tight">
                <ShinyText text="STEM" speed={4} />
                <span className="text-muted-foreground">Score</span>
              </h1>
              <p className="text-sm text-muted-foreground">Admin Login</p>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  className="h-12 text-base"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive font-medium"
                >
                  {error}
                </motion.p>
              )}

              <Magnet strength={0.1}>
                <Button
                  type="submit"
                  className="w-full h-12 text-base cursor-pointer shadow-sm shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </Magnet>
            </form>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
