"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { BlurFade } from "@/components/reactbits/blur-fade";
import { SplitText } from "@/components/reactbits/split-text";
import { Magnet } from "@/components/reactbits/magnet";
import { SpotlightCard } from "@/components/reactbits/spotlight-card";
import { CountUp } from "@/components/reactbits/count-up";

function MicroscopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      {/* Eyepiece */}
      <rect x="19.5" y="3" width="9" height="3.5" rx="1.75" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.2" />
      <rect x="21" y="3.8" width="6" height="1.8" rx="0.9" fill="#cbd5e1" />

      {/* Body tube */}
      <rect x="21" y="6.5" width="6" height="16" rx="1.2" fill="#b0bec5" stroke="#1e293b" strokeWidth="1.2" />
      {/* Tube highlight */}
      <rect x="22" y="7" width="2" height="15" rx="0.8" fill="#e2e8f0" opacity="0.5" />
      {/* Tube band */}
      <rect x="20.5" y="13" width="7" height="1.5" rx="0.5" fill="#78909c" stroke="#1e293b" strokeWidth="0.8" />

      {/* Arm */}
      <path
        d="M21.5 16 C19 19, 16.5 23, 15.5 27 C14.5 31, 14.5 33.5, 14.5 36"
        stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
      <path
        d="M22.5 16 C20 19, 17.5 23, 16.5 27 C15.5 31, 15.5 33.5, 15.5 36"
        stroke="none" fill="#94a3b8" opacity="0.4"
      />

      {/* Nosepiece */}
      <rect x="19" y="22" width="10" height="2.5" rx="1.25" fill="#78909c" stroke="#1e293b" strokeWidth="1.1" />

      {/* Objective lens barrel */}
      <rect x="22" y="24.5" width="4" height="6" rx="1" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.1" />
      {/* Lens barrel highlight */}
      <rect x="23" y="25" width="1" height="5" rx="0.5" fill="#bfdbfe" opacity="0.6" />

      {/* Lens tip */}
      <circle cx="24" cy="32" r="2.8" fill="#60a5fa" stroke="#1e293b" strokeWidth="1.1" />
      <circle cx="24" cy="32" r="1.5" fill="#3b82f6" opacity="0.6" />
      {/* Lens glass shine */}
      <circle cx="23.2" cy="31.2" r="0.6" fill="white" opacity="0.5" />

      {/* Focus knob (coarse) */}
      <ellipse cx="13.5" cy="26" rx="3.2" ry="2.5" fill="#b0bec5" stroke="#1e293b" strokeWidth="1.1" />
      <ellipse cx="13.5" cy="26" rx="1.8" ry="1.2" fill="#90a4ae" />
      {/* Knob grip */}
      <line x1="11.5" y1="25.5" x2="11.5" y2="26.5" stroke="#78909c" strokeWidth="0.6" />
      <line x1="12.5" y1="25" x2="12.5" y2="27" stroke="#78909c" strokeWidth="0.6" />

      {/* Fine focus knob */}
      <ellipse cx="14" cy="31.5" rx="2" ry="1.5" fill="#b0bec5" stroke="#1e293b" strokeWidth="1" />
      <ellipse cx="14" cy="31.5" rx="1" ry="0.7" fill="#90a4ae" />

      {/* Stage */}
      <rect x="8" y="35" width="26" height="3" rx="1" fill="#cfd8dc" stroke="#1e293b" strokeWidth="1.2" />
      <rect x="9" y="35.5" width="24" height="1" rx="0.5" fill="#e2e8f0" opacity="0.4" />

      {/* Stage clips */}
      <path d="M12 33.5 L12 39.5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M30 33.5 L30 39.5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="33.5" x2="13.5" y2="33.5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28.5" y1="33.5" x2="31.5" y2="33.5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />

      {/* Specimen slide */}
      <rect x="18" y="35.3" width="6" height="2.4" rx="0.3" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.5" opacity="0.7" />

      {/* Pillar */}
      <rect x="13" y="38" width="4.5" height="5.5" rx="0.8" fill="#90a4ae" stroke="#1e293b" strokeWidth="1.1" />
      <rect x="14" y="38.5" width="1.5" height="4.5" rx="0.5" fill="#b0bec5" opacity="0.5" />

      {/* Base */}
      <path
        d="M6 43.5 Q6 42 7.5 42 L34.5 42 Q36 42 36 43.5 L36 45 Q36 46 35 46 L7 46 Q6 46 6 45 Z"
        fill="#78909c" stroke="#1e293b" strokeWidth="1.2"
      />
      <path
        d="M8 42.5 L34 42.5"
        stroke="#90a4ae" strokeWidth="0.8" strokeLinecap="round"
      />
    </svg>
  );
}

// ── HERO ──
function Hero() {
  return (
    <section className="min-h-dvh flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.05),transparent_50%)]" />

      <div className="text-center max-w-2xl mx-auto relative z-10 space-y-8">
        <BlurFade delay={0.1}>
          <motion.div
            className="w-36 h-36 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto"
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <MicroscopeIcon className="w-20 h-20" />
          </motion.div>
        </BlurFade>

        <div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <ShinyText text="STEM" speed={4} className="text-5xl md:text-7xl font-bold tracking-tight" />
            <span className="text-muted-foreground">Score</span>
          </h1>
          <BlurFade delay={0.3}>
            <p className="text-xl md:text-2xl text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed text-balance">
              The fastest way to score STEM competitions. QR code in, scores out.
            </p>
          </BlurFade>
        </div>

        <BlurFade delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Magnet strength={0.12}>
              <Link href="/admin/login">
                <Button size="lg" className="h-14 px-8 text-base cursor-pointer shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all">
                  Get Started
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </Link>
            </Magnet>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              See how it works ↓
            </a>
          </div>
        </BlurFade>

        <BlurFade delay={0.7}>
          <div className="flex items-center gap-6 justify-center text-sm text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              No accounts needed
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Free to use
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Works on any phone
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ──
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create an event",
      description: "Admin creates a STEM competition in seconds. Add participants, set up categories.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Share the QR code",
      description: "Print the QR code and display it at the event. That's your entire setup.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Judges scan and score",
      description: "Judges scan the QR code, enter their name, and start scoring. Under 10 seconds.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      ),
    },
    {
      number: "04",
      title: "See results live",
      description: "Leaderboard updates in real-time. Reveal scores at the ceremony like election night.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              From QR scan to scores in seconds
            </h2>
          </div>
        </BlurFade>

        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <BlurFade key={step.number} delay={0.1 + i * 0.1}>
              <SpotlightCard className="rounded-2xl border bg-card h-full">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {step.icon}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </SpotlightCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── STATS ──
function Stats() {
  const ref = useRef(null);
  const stats = [
    { value: 10, suffix: "s", label: "To start scoring" },
    { value: 4, suffix: "", label: "Scoring categories" },
    { value: 0, suffix: "", label: "Accounts needed", special: true },
    { value: 100, suffix: "%", label: "Free forever" },
  ];

  return (
    <section ref={ref} className="py-20 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <BlurFade key={stat.label} delay={0.1 + i * 0.1}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold tabular-nums text-primary">
                  {stat.special ? (
                    "0"
                  ) : (
                    <CountUp value={stat.value} duration={1.5 + i * 0.3} decimals={0} />
                  )}
                  <span className="text-2xl">{stat.suffix}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FEATURES ──
function Features() {
  const features = [
    {
      title: "Tappable scoring",
      description: "1-10 buttons for each category. No sliders, no typing. Tap and go.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
        </svg>
      ),
    },
    {
      title: "Live leaderboard",
      description: "Scores update in real-time. Project on screen. Reveal at the ceremony.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      title: "Score cards",
      description: "Participants get shareable radar charts with judge feedback. Like a badge.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
      ),
    },
    {
      title: "Written feedback",
      description: "Judges leave comments alongside scores. Real feedback, not just numbers.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      title: "Print QR sheet",
      description: "One-click printable QR code. Tape it to a table. Done.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.467a2.625 2.625 0 002.625-2.625V10.5c0-1.38-1.12-2.5-2.5-2.5" />
        </svg>
      ),
    },
    {
      title: "Works offline",
      description: "PWA enabled. Install on your phone. Works even with spotty WiFi.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>
        </BlurFade>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <BlurFade key={feature.title} delay={0.05 + i * 0.06}>
              <SpotlightCard className="rounded-xl border bg-card h-full">
                <div className="p-5 space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </SpotlightCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ──
function CTA() {
  return (
    <section id="get-started" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_60%)]" />

      <div className="max-w-2xl mx-auto text-center relative z-10 space-y-8">
        <BlurFade>
          <MicroscopeIcon className="w-14 h-14 mx-auto" />
        </BlurFade>

        <BlurFade delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            Ready to score your next STEM event?
          </h2>
        </BlurFade>

        <BlurFade delay={0.2}>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Set up in 2 minutes. No credit card. No accounts for judges. Just science.
          </p>
        </BlurFade>

        <BlurFade delay={0.3}>
          <Magnet strength={0.12}>
            <Link href="/admin/login">
              <Button size="lg" className="h-14 px-10 text-base cursor-pointer shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all">
                Start for free
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </Link>
          </Magnet>
        </BlurFade>
      </div>
    </section>
  );
}

// ── FOOTER ──
function Footer() {
  return (
    <footer className="py-8 px-6 border-t">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
        <div className="font-medium">
          <ShinyText text="STEM" speed={5} className="text-xs font-semibold" />
          <span>Score</span>
        </div>
        <p>Built for science fairs, robotics competitions, and hackathons.</p>
      </div>
    </footer>
  );
}

// ── PAGE ──
export default function Home() {
  return (
    <div className="bg-background">
      <Hero />
      <HowItWorks />
      <Stats />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
