"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { formatIDR } from "@/lib/utils/format";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  /** Durasi count-up (detik). */
  duration?: number;
}

function defaultFormat(n: number): string {
  return formatIDR(n);
}

/**
 * Angka count-up: nilai akhir sudah tampil di HTML statis, lalu animasi hanya
 * dipicu saat nilainya berubah — bukan saat mount — agar tidak ada flicker.
 */
export function AnimatedNumber({ value, format = defaultFormat, className, duration = 0.75 }: AnimatedNumberProps) {
  const mv = useMotionValue(value);
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() => format(value));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (reduce) {
      mv.set(value);
      const t = window.setTimeout(() => setDisplay(format(value)), 0);
      return () => window.clearTimeout(t);
    }
    const unsubscribe = mv.on("change", (v) => setDisplay(format(Math.round(v))));
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => {
      controls.stop();
      unsubscribe();
    };
    // `format` sengaja tidak ikut deps agar animasi hanya dipicu perubahan nilai.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce, duration, mounted, mv]);

  return (
    <span className={className} aria-label={format(value)} suppressHydrationWarning>
      {display}
    </span>
  );
}
