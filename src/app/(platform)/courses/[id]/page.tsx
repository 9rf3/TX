"use client";
import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, BookOpen } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <motion.div variants={item}>
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-muted-light hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
      </motion.div>

      <motion.div variants={item}>
        <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
           <BookOpen className="w-16 h-16 text-muted/30 mx-auto mb-4" />
           <h3 className="font-semibold text-xl text-foreground">Course Not Found</h3>
           <p className="text-muted-light mt-2 max-w-md mx-auto">The course you are looking for does not exist or has been removed. Please return to the course catalog.</p>
        </Card>
      </motion.div>
    </motion.div>
  );
}
