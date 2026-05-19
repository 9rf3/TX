"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  from = 0, to, duration = 1.5,
  suffix = "", prefix = "",
  className = "", formatter,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(from);

  useEffect(() => {
    if (!inView) return;

    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayed(Math.round(value));
      },
    });

    return () => controls.stop();
  }, [from, to, duration, inView]);

  const text = formatter ? formatter(displayed) : `${prefix}${displayed.toLocaleString()}${suffix}`;

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3 }}
    >
      {text}
    </motion.span>
  );
}
