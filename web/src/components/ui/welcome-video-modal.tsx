"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, BookOpen, Volume2, VolumeX, Maximize2, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STORAGE_KEY = "military_dict_welcome_seen";

export function WelcomeVideoModal() {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [neverShow, setNeverShow] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-open on first visit
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function close() {
    if (neverShow) localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    videoRef.current?.pause();
    setPlaying(false);
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  }

  function openFullscreen() {
    videoRef.current?.requestFullscreen?.();
  }

  function reopen() {
    setOpen(true);
    setPlaying(false);
  }

  return (
    <>
      {/* ── Floating re-open button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
            onClick={reopen}
            title="شاهد دليل الاستخدام"
            className={cn(
              "fixed bottom-20 left-6 z-40",
              "flex items-center gap-2 px-4 py-2.5 rounded-full",
              "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
              "hover:bg-primary/90 hover:shadow-primary/50 hover:-translate-y-1",
              "transition-all duration-300 font-semibold text-sm",
              "border border-primary/30"
            )}
          >
            <Play className="h-4 w-4 fill-current" />
            <span className="hidden sm:inline">دليل الاستخدام</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Modal overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="relative w-full max-w-3xl bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-foreground leading-tight">
                      دليل استخدام القاموس العسكري الموحد
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      تعرف على جميع مميزات وإمكانيات النظام
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={close}
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Video player */}
              <div className="relative bg-black group">
                <video
                  ref={videoRef}
                  className="w-full aspect-video object-contain"
                  src="/guide/tutorial.mp4"
                  playsInline
                  onEnded={() => setPlaying(false)}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />

                {/* Play overlay when paused */}
                {!playing && (
                  <button
                    onClick={togglePlay}
                    title="تشغيل الفيديو"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl border-2 border-white/20"
                    >
                      <Play className="h-7 w-7 fill-white text-white ml-1" />
                    </motion.div>
                  </button>
                )}

                {/* Video controls overlay */}
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 flex items-center gap-2 px-4 py-2 bg-linear-to-t from-black/70 to-transparent",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                )}>
                  <button title="تشغيل/إيقاف" onClick={togglePlay} className="text-white hover:text-primary transition-colors p-1">
                    <Play className={cn("h-4 w-4", playing ? "hidden" : "fill-current")} />
                  </button>
                  <button title={muted ? "تفعيل الصوت" : "كتم الصوت"} onClick={toggleMute} className="text-white hover:text-primary transition-colors p-1">
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <button title="ملء الشاشة" onClick={openFullscreen} className="text-white hover:text-primary transition-colors p-1 mr-auto">
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 bg-muted/20 border-t border-border/50">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={neverShow}
                    onChange={(e) => setNeverShow(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="group-hover:text-foreground transition-colors">لا تعرض مجدداً</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={close}
                    className="rounded-full px-4"
                  >
                    تخطي
                  </Button>
                  <Link href="/guide" onClick={close}>
                    <Button variant="outline" size="sm" className="rounded-full px-4 gap-1.5">
                      <BookMarked className="h-3.5 w-3.5" />
                      دليل الاستخدام
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={togglePlay}
                    className="rounded-full px-5 gap-2"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {playing ? "إيقاف" : "تشغيل"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
