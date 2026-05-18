"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Tabs } from "@/components/ui/Tabs";
import { courses } from "@/lib/mock-data";
import { getCategoryIcon, getCategoryLabel, formatNumber } from "@/lib/utils";
import { Star, Users, Clock, Zap, Search } from "lucide-react";
import type { CourseCategory } from "@/lib/types";

const categories: { id: CourseCategory; label: string }[] = [
  { id: "all", label: "All" }, { id: "development", label: "Development" }, { id: "design", label: "Design" },
  { id: "data-science", label: "Data Science" }, { id: "ai", label: "AI & ML" }, { id: "business", label: "Business" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CoursesPage() {
  const [category, setCategory] = useState<CourseCategory>("all");
  const [search, setSearch] = useState("");

  const filtered = courses.filter((c) =>
    (category === "all" || c.category === category) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Explore Courses</h1>
        <p className="text-muted-light mt-1">Discover new skills and earn XP</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <Tabs
          tabs={categories.map((c) => ({ id: c.id, label: c.label }))}
          activeTab={category}
          onChange={(id) => setCategory(id as CourseCategory)}
          className="overflow-x-auto"
        />
      </div>

      <motion.div variants={container} initial="hidden" animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" key={category}>
        {filtered.map((course) => (
          <motion.div variants={item} key={course.id}>
            <Link href={`/courses/${course.id}`} prefetch={true}>
              <Card className="group overflow-hidden !p-0">
                {/* Header */}
                <div className="relative h-36 flex items-center justify-center" style={{ background: course.gradient }}>
                  <span className="text-5xl relative z-10">
                    {getCategoryIcon(course.category)}
                  </span>
                  <div className="absolute top-3 right-3">
                    <Badge variant="primary" size="md">{course.level}</Badge>
                  </div>
                  {course.price === "free" && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="success" size="md">Free</Badge>
                    </div>
                  )}
                </div>
                {/* Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent-orange" /> {course.rating}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {formatNumber(course.students)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                  </div>
                  <h3 className="font-bold text-base group-hover:text-primary-light transition-colors">{course.title}</h3>
                  <p className="text-xs text-muted line-clamp-2">{course.description}</p>

                  {course.completedLessons > 0 ? (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-light">{course.completedLessons}/{course.totalLessons} lessons</span>
                        <span className="text-primary-light">{Math.round((course.completedLessons / course.totalLessons) * 100)}%</span>
                      </div>
                      <Progress value={course.completedLessons} max={course.totalLessons} size="sm" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-primary-light"><Zap className="w-3 h-3" /> +{course.xpReward} XP</span>
                      <span className="text-sm font-bold">
                        {course.price === "free" ? "Free" : `$${course.price}`}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
