"use client";
import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, BookOpen, Clock, Users, PlayCircle, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CourseData } from "@/lib/hooks/useCourses";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("courses")
        .select("*, instructor:profiles(*)")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        setCourse(data as unknown as CourseData);
      }
      setIsLoading(false);
    };
    fetchCourse();
  }, [id]);

  if (isLoading) {
    return <div className="p-12 text-center text-muted">Loading course...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <motion.div variants={item}>
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-muted-light hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
      </motion.div>

      {!course ? (
        <motion.div variants={item}>
          <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
             <BookOpen className="w-16 h-16 text-muted/30 mx-auto mb-4" />
             <h3 className="font-semibold text-xl text-foreground">Course Not Found</h3>
             <p className="text-muted-light mt-2 max-w-md mx-auto">The course you are looking for does not exist or has been removed. Please return to the course catalog.</p>
          </Card>
        </motion.div>
      ) : (
        <>
          <motion.div variants={item}>
            <div className="rounded-3xl overflow-hidden relative" style={{ background: course.gradient || "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-5xl shrink-0 bg-white/10 backdrop-blur-md shadow-2xl border border-white/20">
                  {course.category === "development" ? "💻" : course.category === "design" ? "🎨" : "📚"}
                </div>
                <div className="flex-1 space-y-4">
                  <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{course.title}</h1>
                  <p className="text-white/80 max-w-2xl text-lg">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {course.instructor?.full_name || "Admin"}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 2h</span>
                    <span className="flex items-center gap-1.5 text-accent-orange"><Star className="w-4 h-4 fill-current" /> 5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <h3 className="text-lg font-bold mb-4">About this course</h3>
                <p className="text-muted-light leading-relaxed">{course.description}</p>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="sticky top-24">
                <div className="text-3xl font-bold mb-6 text-center text-primary-light">
                  {course.price === "free" ? "Free" : `$${course.price}`}
                </div>
                <Button className="w-full mb-3" size="lg">Start Course</Button>
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Level</span>
                    <span className="font-medium capitalize">{course.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Category</span>
                    <span className="font-medium capitalize">{course.category}</span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
