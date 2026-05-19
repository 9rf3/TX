"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { BookOpen, PlayCircle, ChevronRight, Clock } from "lucide-react";
import { useCourses } from "@/lib/hooks/useCourses";

export function ContinueLearning() {
  const { courses, isLoading } = useCourses();
  const published = courses.filter(c => c.published);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Continue Learning
        </h2>
        <Link href="/courses" className="text-sm text-primary-light hover:text-primary flex items-center gap-1 transition-colors">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-muted text-sm">Loading courses...</Card>
      ) : published.length === 0 ? (
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative z-10 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-primary-light" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">No active courses</h3>
            <p className="text-muted-light text-sm max-w-sm mx-auto mb-5">
              Start your learning journey. Every course you begin appears here.
            </p>
            <Link href="/courses">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25">
                <PlayCircle className="w-4 h-4 mr-2" /> Explore Courses
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {published.slice(0, 3).map((course, idx) => {
            const moduleCount = 0;
            const progressPct = 0;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/courses/${course.id}`} className="block group">
                  <Card className="relative overflow-hidden hover:border-primary/40 transition-all duration-300 group-hover:-translate-y-0.5">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent" />
                    <div className="relative z-10 p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 bg-primary/10 border border-primary/20">
                        <BookOpen className="w-5 h-5 text-primary-light" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary-light transition-colors">{course.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {moduleCount} modules
                          </span>
                          <span className="capitalize">{course.level}</span>
                        </div>
                        <div className="mt-2">
                          <Progress value={progressPct} max={100} size="sm" color="primary" showLabel />
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <PlayCircle className="w-5 h-5 text-primary-light" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
          {published.length > 3 && (
            <Link href="/courses" className="text-sm text-primary-light hover:text-primary text-center py-2 transition-colors">
              View {published.length - 3} more courses
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
