"use client";
import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Trophy } from "lucide-react";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="p-4">
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-muted-light hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <Card hover={false} className="text-center py-20 max-w-2xl w-full flex flex-col justify-center items-center">
           <Trophy className="w-16 h-16 text-muted/30 mx-auto mb-4" />
           <h3 className="font-semibold text-xl text-foreground">Quiz Not Found</h3>
           <p className="text-muted-light mt-2 max-w-md mx-auto">This quiz is currently unavailable. Please check back later.</p>
        </Card>
      </div>
    </div>
  );
}
