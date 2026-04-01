"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/reactbits/blur-fade";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { SplitText } from "@/components/reactbits/split-text";
import { Magnet } from "@/components/reactbits/magnet";
import { SpotlightCard } from "@/components/reactbits/spotlight-card";
import { AppHeader } from "@/components/app-header";
import { toast } from "sonner";
import Link from "next/link";

interface QRSheetProps {
  eventName: string;
  qrToken: string;
  eventId: string;
}

export function QRSheet({ eventName, qrToken, eventId }: QRSheetProps) {
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const scoreUrl = baseUrl ? `${baseUrl}/score/${qrToken}` : `/score/${qrToken}`;

  function handleCopy() {
    navigator.clipboard.writeText(scoreUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const svg = document.querySelector(".qr-code-container svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 560;
    canvas.height = 560;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, 560, 560);
      ctx!.drawImage(img, 0, 0, 560, 560);
      const a = document.createElement("a");
      a.download = `stemscore-qr-${qrToken}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast.success("QR code downloaded!");
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <div className="print:hidden">
        <AppHeader title="QR Code" subtitle={eventName} backLabel="Event" backHref={`/admin/event/${eventId}`} />
      </div>

      <div className="flex-1">
      <div className="p-5 max-w-lg mx-auto print:hidden">
        <BlurFade delay={0.1}>
          <p className="text-sm text-muted-foreground mb-5">
            Print this QR code and display it at the event. Judges scan to start scoring.
          </p>
        </BlurFade>

        <BlurFade delay={0.3}>
          <div className="flex gap-2 flex-wrap">
            <Magnet strength={0.12}>
              <Button onClick={() => window.print()} className="cursor-pointer">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.467a2.625 2.625 0 002.625-2.625V10.5c0-1.38-1.12-2.5-2.5-2.5h-.748a.75.75 0 01-.75-.75V5.625c0-.621-.504-1.125-1.125-1.125H8.758c-.621 0-1.125.504-1.125 1.125V7.25a.75.75 0 01-.75.75H5.5A2.5 2.5 0 003 10.5v4.875A2.625 2.625 0 005.625 18H7.09" />
                </svg>
                Print QR Code
              </Button>
            </Magnet>
            <Button variant="outline" onClick={handleCopy} className="cursor-pointer">
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="outline" onClick={handleDownload} className="cursor-pointer">
              Download PNG
            </Button>
          </div>
        </BlurFade>
      </div>

      {/* Printable QR sheet - full page centered */}
      <div className="flex items-center justify-center p-12 print:p-0 print:min-h-screen">
        <div className="text-center space-y-8">
          {/* Logo with shimmer (screen only, print gets plain text) */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight print:text-4xl">
              <span className="print:hidden">
                <ShinyText text="STEM" speed={4} className="text-3xl font-bold tracking-tight" />
              </span>
              <span className="hidden print:inline">STEM</span>
              <span className="text-muted-foreground print:text-gray-400">Score</span>
            </h2>
            <BlurFade delay={0.2}>
              <p className="text-lg font-medium mt-1 print:text-2xl">{eventName}</p>
            </BlurFade>
          </div>

          {/* QR Code with spotlight hover + entrance animation */}
          <BlurFade delay={0.4}>
            <SpotlightCard
              className="bg-white p-8 rounded-xl inline-block shadow-sm print:shadow-none print:p-10 qr-code-container"
              spotlightColor="rgba(16, 185, 129, 0.12)"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
              >
                {baseUrl ? (
                  <QRCode
                    value={scoreUrl}
                    size={280}
                    level="M"
                    className="print:w-72 print:h-72"
                  />
                ) : (
                  <div className="w-[280px] h-[280px] bg-muted animate-pulse rounded" />
                )}
              </motion.div>
            </SpotlightCard>
          </BlurFade>

          {/* Instructions with split text */}
          <div className="space-y-2">
            <p className="text-lg font-medium print:text-xl print:block">
              <span className="print:hidden">
                <SplitText text="Scan to start judging" delay={0.7} className="text-lg font-medium" />
              </span>
              <span className="hidden print:inline">Scan to start judging</span>
            </p>
            <BlurFade delay={1.0}>
              <p className="text-sm text-muted-foreground print:text-base">
                No account needed. Just scan, enter your name, and score.
              </p>
            </BlurFade>
            <BlurFade delay={1.1}>
              <a
                href={scoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 underline underline-offset-2 mt-6 font-mono print:text-sm print:text-muted-foreground print:no-underline inline-block cursor-pointer"
              >
                {scoreUrl}
              </a>
            </BlurFade>
          </div>

          {/* Animated decorative dots (screen only) */}
          <div className="print:hidden flex justify-center gap-1.5 pt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3 + i * 0.1, type: "spring" }}
              />
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
