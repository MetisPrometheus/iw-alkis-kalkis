"use client";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Small client-side motion primitives. Server components stay server and
 * wrap their static markup in these; every effect renders a static fallback
 * when the user prefers reduced motion.
 */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Number that counts up ("odometer settle") when it scrolls into view.
 * SSR/no-JS renders the final value, so SEO and reduced-motion are safe.
 */
export function AnimatedNumber({
  value,
  className,
  duration = 0.9,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-32px" });
  const formatted = value.toLocaleString("nb-NO");

  useEffect(() => {
    const node = ref.current;
    if (reduce || !inView || !node) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString("nb-NO");
      },
      onComplete: () => {
        node.textContent = formatted;
      },
    });
    return () => controls.stop();
  }, [value, formatted, duration, reduce, inView]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {formatted}
    </span>
  );
}

/** Fade/lift-in on scroll, once. Pass a per-item delay for stagger. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Horizontal bar that grows to `pct` % width on reveal — used for the
 * kr-per-liter-alcohol-vs-median viz on product cards.
 */
export function BarFill({
  pct,
  className,
  delay = 0,
}: {
  pct: number;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const width = `${Math.min(100, Math.max(0, pct))}%`;
  if (reduce) return <div className={className} style={{ width }} />;
  return (
    <motion.div
      className={className}
      initial={{ width: 0 }}
      whileInView={{ width }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    />
  );
}

/** Press-down scale wrapper for tappable blocks (links, buttons). */
export function Tappable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} whileTap={{ scale: 0.975 }}>
      {children}
    </motion.div>
  );
}
