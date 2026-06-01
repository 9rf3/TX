"use client";

import { memo } from "react";
import { BookOpen, Code2, HelpCircle, FileText } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";

interface LessonTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const LESSON_TABS = [
  { id: "lesson", label: "Lesson", icon: <BookOpen className="h-4 w-4" /> },
  { id: "practice", label: "Practice", icon: <Code2 className="h-4 w-4" /> },
  { id: "quiz", label: "Quiz", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "notes", label: "Notes", icon: <FileText className="h-4 w-4" /> },
];

export const LessonTabs = memo(function LessonTabs({ activeTab, onChange }: LessonTabsProps) {
  return <Tabs tabs={LESSON_TABS} activeTab={activeTab} onChange={onChange} />;
});
