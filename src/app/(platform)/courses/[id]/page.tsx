"use client";
import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { courses, achievements } from "@/lib/mock-data";
import { formatNumber, getCategoryIcon, getRarityColor } from "@/lib/utils";
import { Star, Users, Clock, Zap, PlayCircle, CheckCircle, Lock, BookOpen, Trophy, ArrowLeft } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const course = courses.find((c) => c.id === id) || courses[0];
  const progress = course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <motion.div variants={item}>
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-muted-light hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div variants={item}>
        <Card className="!p-0 overflow-hidden" hover={false}>
          <div className="relative h-48 md:h-56 flex items-center justify-center" style={{ background: course.gradient }}>
            <span className="text-7xl">{getCategoryIcon(course.category)}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary" size="md">{course.level}</Badge>
                <Badge variant="info" size="md">{course.category}</Badge>
                {course.price === "free" && <Badge variant="success" size="md">Free</Badge>}
              </div>
            </div>
          </div>
          <div className="p-5 md:p-6 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-light">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-accent-orange" /> {course.rating}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {formatNumber(course.students)} students</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.totalLessons} lessons</span>
              <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-primary" /> +{course.xpReward} XP</span>
            </div>
            {progress > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-light">{course.completedLessons} of {course.totalLessons} completed</span>
                  <span className="text-primary-light font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} size="md" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Link href={`/lessons/${course.id}`}>
                <Button size="lg" glow>{progress > 0 ? "Continue Learning" : "Start Course"} <PlayCircle className="w-5 h-5" /></Button>
              </Link>
              <Link href={`/quiz/${course.id}`}>
                <Button variant="outline" size="lg"><Trophy className="w-4 h-4" /> Take Quiz</Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lessons list */}
        <motion.div variants={item} className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Course Content</h2>
          <div className="space-y-2">
            {course.lessons.map((lesson) => (
              <Card key={lesson.id} className="flex items-center gap-4 !py-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${lesson.isCompleted ? "bg-accent-green/15 text-accent-green" : lesson.isLocked ? "bg-white/5 text-muted" : "bg-primary/15 text-primary-light"}`}>
                  {lesson.isCompleted ? <CheckCircle className="w-4 h-4" /> : lesson.isLocked ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${lesson.isLocked ? "text-muted" : ""}`}>{lesson.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                    <span>{lesson.duration}</span>
                    <span className="flex items-center gap-0.5"><Zap className="w-3 h-3" /> +{lesson.xpReward}</span>
                  </div>
                </div>
                <Badge variant={lesson.type === "quiz" ? "warning" : lesson.type === "project" ? "info" : "default"} size="sm">
                  {lesson.type}
                </Badge>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor */}
          <motion.div variants={item}>
            <h2 className="text-lg font-bold mb-4">Instructor</h2>
            <Card hover={false}>
              <div className="flex items-center gap-3">
                <Avatar name={course.instructor.name} size="lg" />
                <div>
                  <div className="font-semibold">{course.instructor.name}</div>
                  <div className="text-xs text-muted">{course.instructor.title}</div>
                </div>
              </div>
              <p className="text-sm text-muted-light mt-3">{course.instructor.bio}</p>
              <div className="flex gap-4 mt-3 text-xs text-muted">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent-orange" /> {course.instructor.rating}</span>
                <span>{formatNumber(course.instructor.students)} students</span>
                <span>{course.instructor.courses} courses</span>
              </div>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={item}>
            <h2 className="text-lg font-bold mb-4">Achievements</h2>
            <div className="space-y-2">
              {achievements.slice(0, 4).map((ach) => (
                <Card key={ach.id} className={`flex items-center gap-3 !py-3 ${!ach.isUnlocked ? "opacity-50" : ""}`}>
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{ach.title}</div>
                    <div className="text-xs" style={{ color: getRarityColor(ach.rarity) }}>{ach.rarity}</div>
                  </div>
                  <Badge variant="primary">+{ach.xpReward}</Badge>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
