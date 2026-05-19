"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, BookOpen, Clock, Users, PlayCircle, Star } from "lucide-react";
import type { CourseCategory } from "@/lib/types";
import { useCourses } from "@/lib/hooks/useCourses";

const categories: { id: CourseCategory; label: string }[] = [
  { id: "all", label: "All" }, { id: "development", label: "Development" }, { id: "design", label: "Design" },
  { id: "data-science", label: "Data Science" }, { id: "ai", label: "AI & ML" }, { id: "business", label: "Business" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CoursesPage() {
  const [category, setCategory] = useState<CourseCategory>("all");
  const [search, setSearch] = useState("");
  const { courses, fetchCourses, isLoading } = useCourses();

  useEffect(() => {
    fetchCourses(false); // Only fetch published courses
  }, [fetchCourses]);

  const filteredCourses = courses.filter((c) => {
    const matchCategory = category === "all" || c.category === category;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

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

      <motion.div variants={container} initial="hidden" animate="show" className="pt-4" key={category + search}>
        {isLoading ? (
          <div className="py-20 text-center text-muted">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <motion.div variants={item}>
            <Card hover={false} className="text-center py-16 flex flex-col justify-center items-center">
               <BookOpen className="w-12 h-12 text-muted/30 mx-auto mb-4" />
               <h3 className="font-semibold text-lg text-foreground">No courses found</h3>
               <p className="text-muted-light mt-1 max-w-sm mx-auto">There are no courses available in this category yet. Please check back later.</p>
            </Card>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <motion.div variants={item} key={course.id}>
                <Link href={`/courses/${course.id}`} className="block h-full group">
                  <Card className="h-full flex flex-col p-0 overflow-hidden hover:border-primary/50 transition-all duration-300 group-hover:-translate-y-1">
                    <div className="h-40 relative flex items-center justify-center overflow-hidden" style={{ background: course.gradient || "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      <PlayCircle className="w-12 h-12 text-white/80 group-hover:scale-110 group-hover:text-white transition-all drop-shadow-lg" />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge variant="primary" className="backdrop-blur-md bg-black/30 border-white/10">
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" size="sm" className="bg-secondary/10 text-secondary border-secondary/20 uppercase tracking-wider text-[10px]">
                          {course.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs font-medium text-accent-orange ml-auto">
                          <Star className="w-3.5 h-3.5 fill-current" /> 5.0
                        </div>
                      </div>
                      <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary-light transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-light line-clamp-2 mb-4 flex-1">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3 text-xs text-muted-light font-medium">
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2h</div>
                          <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {course.instructor?.full_name || "Admin"}</div>
                        </div>
                        <div className="font-bold text-primary-light">
                          {course.price === "free" ? "Free" : `$${course.price}`}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
