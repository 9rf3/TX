"use client";

import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface WorkspaceTab {
  id: string;
  label: string;
  icon: ReactNode;
}

interface WorkspaceTabsProps {
  tabs: WorkspaceTab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const WorkspaceTabs = memo(function WorkspaceTabs({
  tabs,
  activeTab,
  onChange,
}: WorkspaceTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "text-white"
                : "text-muted-light hover:text-white"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="workspace-active-tab"
                className="absolute inset-0 rounded-lg border border-primary/30 bg-primary/15 shadow-[0_0_18px_rgba(139,92,246,0.18)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
});
