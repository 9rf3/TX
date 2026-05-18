"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { courses } from "@/lib/mock-data";
import { PlayCircle, ChevronLeft, ChevronRight, FileText, Sparkles, Send, Zap, CheckCircle, X } from "lucide-react";
import Link from "next/link";

export default function LessonPage() {
  const course = courses[0];
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showAI, setShowAI] = useState(false);
  const [notes, setNotes] = useState("");
  const lesson = course.lessons[currentLesson];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Video area */}
        <div className="relative aspect-video bg-black/50 flex items-center justify-center border-b border-border shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative text-center space-y-4">
            <motion.div whileHover={{ scale: 1.1 }} className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur flex items-center justify-center cursor-pointer neon-glow mx-auto">
              <PlayCircle className="w-10 h-10 text-primary-light" />
            </motion.div>
            <p className="text-muted-light text-sm">Click to play lesson video</p>
          </div>
          {/* Progress overlay */}
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={currentLesson + 1} max={course.totalLessons} size="sm" color="primary" />
          </div>
        </div>

        {/* Lesson info */}
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">Lesson {currentLesson + 1}/{course.totalLessons}</Badge>
                <Badge variant="info">{lesson.duration}</Badge>
                <Badge variant="success"><Zap className="w-3 h-3" /> +{lesson.xpReward} XP</Badge>
              </div>
              <h1 className="text-xl md:text-2xl font-bold">{lesson.title}</h1>
              <p className="text-muted-light mt-1">{lesson.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAI(!showAI)} className="shrink-0 hidden md:flex">
              <Sparkles className="w-4 h-4" /> AI Help
            </Button>
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3"><FileText className="w-5 h-5 text-primary" /> Notes</h2>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes for this lesson..."
              className="w-full h-32 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))} disabled={currentLesson === 0}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span className="text-sm text-muted">{currentLesson + 1} of {course.totalLessons}</span>
            {currentLesson < course.totalLessons - 1 ? (
              <Button onClick={() => setCurrentLesson(currentLesson + 1)}>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Link href={`/quiz/${course.id}`}>
                <Button glow>Take Quiz <Zap className="w-4 h-4" /></Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* AI sidebar */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ width: 0, opacity: 0 }} animate={{ width: 360, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="hidden md:flex flex-col border-l border-border bg-surface overflow-hidden shrink-0"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
              <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Helper</h3>
              <button onClick={() => setShowAI(false)} className="p-1 rounded-lg hover:bg-white/5 text-muted cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="glass rounded-2xl p-3 text-sm">
                <p>👋 Hi! I can help you understand this lesson. Ask me anything about <strong className="text-primary-light">{lesson.title}</strong>!</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Explain this concept", "Give me an example", "Quiz me"].map((q) => (
                  <button key={q} className="px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary-light border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input placeholder="Ask AI..." className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all" />
                <Button size="sm"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
