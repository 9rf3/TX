"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { FastForward, ArrowRight } from "lucide-react";
import { GamePanel, PanelHeader, NeonButton } from "@/components/ui/GamePanel";

interface NextLessonPanelProps {
  lessonNumber: string;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
}

export const NextLessonPanel = memo(function NextLessonPanel({
  lessonNumber,
  title,
  description,
  href,
  onClick,
}: NextLessonPanelProps) {
  return (
    <GamePanel className="group/next p-5">
      <PanelHeader icon={<FastForward className="h-4 w-4" />} title="Next Up" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="space-y-3"
      >
        {/* Lesson info */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-light">
            Lesson {lessonNumber}
          </span>
          <h3 className="mt-1 text-base font-bold text-white">{title}</h3>
        </div>

        <p className="text-sm leading-relaxed text-muted-light">{description}</p>

        {/* CTA */}
        <NeonButton href={href} onClick={onClick} className="group/btn w-full">
          Next Lesson
          <motion.span
            className="inline-block"
            animate={{ x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowRight className="h-4 w-4" />
          </motion.span>
        </NeonButton>
      </motion.div>
    </GamePanel>
  );
});
