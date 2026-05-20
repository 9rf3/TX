"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { BookOpen, PlayCircle, ChevronRight, Clock, Shield, Sparkles, Zap } from "lucide-react";
import { useCourses } from "@/lib/hooks/useCourses";
import { useSound } from "@/lib/hooks/useSound";

export function ContinueLearning() {
  const { courses, isLoading } = useCourses();
  const { playClick } = useSound();
  const published = courses.filter(c => c.published);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-light" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Active Campaigns</h2>
            <p className="text-xs text-muted-light">Resume your current learning campaigns and unlock rank bonuses</p>
          </div>
        </div>

        <Link
          href="/courses"
          className="text-xs text-primary-light hover:text-white transition-colors flex items-center gap-0.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl"
        >
          Explore All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-muted text-sm bg-surface">Loading campaign databases...</Card>
      ) : published.length === 0 ? (
        <Card className="relative overflow-hidden group border-white/5 bg-gradient-to-br from-surface to-surface-light !p-8 text-center space-y-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-60" />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-lg">
            <BookOpen className="w-8 h-8 text-primary-light animate-float" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-white text-lg">No Active Campaigns</h3>
            <p className="text-muted-light text-sm max-w-sm mx-auto">
              Ready to acquire legendary skills? Jump into standard courses and start stacking XP and TX Coins.
            </p>
          </div>
          <Link href="/courses" className="inline-block">
            <Button
              onClick={() => playClick()}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/25"
            >
              <PlayCircle className="w-4 h-4" /> Initialize Campaign
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-3">
          {published.slice(0, 3).map((course, idx) => {
            const moduleCount = course.level === "beginner" ? 6 : course.level === "intermediate" ? 9 : 12;
            const progressPct = idx === 0 ? 45 : idx === 1 ? 15 : 0;
            const xpBonus = course.level === "beginner" ? 250 : course.level === "intermediate" ? 500 : 750;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={`/courses/${course.id}`}
                  onClick={() => playClick()}
                  className="block group"
                >
                  <Card className="relative overflow-hidden border-white/5 bg-gradient-to-r from-surface to-[#0f0f1b] group-hover:border-primary/40 transition-all duration-300 group-hover:-translate-y-0.5 !p-4">
                    {/* Glowing highlight */}
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
                      {/* Visual Icon Badge */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0 text-xl font-bold text-white shadow-md">
                        {idx === 0 ? "⚛️" : idx === 1 ? "🛡️" : "🧩"}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5 w-full">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white group-hover:text-primary-light transition-colors truncate max-w-[200px] md:max-w-md">
                            {course.title}
                          </h4>
                          <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary-light">
                            {course.level}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-muted-light">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-muted" /> {moduleCount} modules
                          </span>
                          <span className="flex items-center gap-1 text-primary-light font-bold">
                            <Zap className="w-3.5 h-3.5" /> +{xpBonus} XP Quest Reward
                          </span>
                        </div>

                        <div className="pt-1">
                          <Progress value={progressPct} max={100} size="sm" color="primary" showLabel />
                        </div>
                      </div>

                      <div className="self-end sm:self-center">
                        <span className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <PlayCircle className="w-5 h-5 text-primary-light group-hover:text-white" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}

          {published.length > 3 && (
            <Link href="/courses" className="text-xs font-bold text-primary-light hover:text-white text-center py-2 transition-colors block">
              View {published.length - 3} more campaigns
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
