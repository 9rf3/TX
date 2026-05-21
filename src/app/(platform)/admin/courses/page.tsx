"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GamePanel } from "@/components/ui/GamePanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCourses } from "@/lib/hooks/useCourses";
import { useRequireRole, ROLES } from "@/lib/role-utils";
import { BookOpen, Plus, Search, Edit, Trash2, Eye } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function AdminCoursesPage() {
  const { isAuthorized, isLoading: isRoleLoading } = useRequireRole([ROLES.ADMIN]);
  const { courses, fetchCourses, deleteCourse, isLoading } = useCourses();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isAuthorized) fetchCourses(true);
  }, [isAuthorized, fetchCourses]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(id);
    } catch {
      alert("Failed to delete course");
    }
  };

  if (isRoleLoading || !isAuthorized) {
    return (
      <div className="relative min-h-screen bg-[#070b16] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <BookOpen className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-light text-sm">Loading courses...</p>
        </div>
      </div>
    );
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-full overflow-hidden bg-[#070b16] px-3 py-4 text-foreground sm:px-4 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.12),transparent_40%),radial-gradient(circle_at_85%_16%,rgba(6,182,212,0.08),transparent_38%)]" />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 max-w-7xl mx-auto space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-primary" /> Courses
            </h1>
            <p className="text-muted-light mt-1">Manage all courses on the platform</p>
          </div>
          <Link href="/admin/courses/new">
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Course</Button>
          </Link>
        </motion.div>

        <motion.div variants={item} className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[8px] bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all"
          />
        </motion.div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-light">Loading courses...</div>
        ) : filtered.length === 0 ? (
          <motion.div variants={item}>
            <GamePanel className="text-center py-20 flex flex-col justify-center items-center">
              <BookOpen className="w-16 h-16 text-muted/30 mx-auto mb-4" />
              <h3 className="font-bold text-xl text-white">
                {search ? "No courses match your search" : "No Courses Yet"}
              </h3>
              <p className="text-muted-light mt-2 max-w-md mx-auto text-sm">
                {search ? "Try a different search term." : "Click 'New Course' to create your first course."}
              </p>
            </GamePanel>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((course) => (
              <motion.div key={course.id} variants={item}>
                <GamePanel className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                  <div className="grid h-12 w-12 place-items-center rounded-[8px] text-xl shrink-0" style={{ background: course.gradient || "#1e293b" }}>
                    <BookOpen className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">{course.title}</div>
                    <div className="text-xs text-muted-light truncate mt-0.5">
                      {course.instructor?.full_name || "Unknown"} &middot; {new Date(course.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={course.published ? "success" : "default"}>
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant={course.price === "free" ? "success" : "primary"}>
                      {course.price === "free" ? "Free" : `$${course.price}`}
                    </Badge>
                    <div className="flex gap-1">
                      <Link href={`/courses/${course.id}`} className="p-2 rounded-lg hover:bg-white/5 text-muted-light hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/courses/${course.id}/edit`} className="p-2 rounded-lg hover:bg-white/5 text-muted-light hover:text-white transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(course.id, course.title)} className="p-2 rounded-lg hover:bg-accent-red/10 text-muted-light hover:text-accent-red transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GamePanel>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
