"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Search, BookOpen } from "lucide-react";
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
        className="pt-12" key={category}>
        <motion.div variants={item}>
          <Card hover={false} className="text-center py-16 flex flex-col justify-center items-center">
             <BookOpen className="w-12 h-12 text-muted/30 mx-auto mb-4" />
             <h3 className="font-semibold text-lg text-foreground">No courses found</h3>
             <p className="text-muted-light mt-1 max-w-sm mx-auto">There are no courses available in this category yet. Please check back later.</p>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
