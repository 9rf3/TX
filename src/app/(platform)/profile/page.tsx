"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Zap, Trophy, BookOpen, Flame, Calendar, Star, Award } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function ProfilePage() {
  const { profile, user } = useAuth();
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const username = profile?.username || user?.email?.split('@')[0] || "student";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <motion.div variants={item}>
        <Card hover={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
          <div className="relative flex flex-col md:flex-row items-center gap-6 p-2">
            <div className="relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-surface" />
              ) : (
                <Avatar name={displayName} size="xl" />
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white border-2 border-surface">
                1
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-muted-light">@{username}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <Badge variant="primary" size="md">🌟 New User</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md"><Trophy className="w-3 h-3" /> Unranked</Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Zap className="w-5 h-5 text-primary" />, label: "Total XP", value: "0", color: "primary" },
          { icon: <BookOpen className="w-5 h-5 text-accent-green" />, label: "Courses", value: "0", color: "green" },
          { icon: <Flame className="w-5 h-5 text-accent-orange" />, label: "Streak", value: "0 days", color: "orange" },
          { icon: <Calendar className="w-5 h-5 text-secondary" />, label: "Joined", value: "Just now", color: "cyan" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 flex items-center justify-center">{stat.icon}</div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted">{stat.label}</div>
          </Card>
        ))}
      </motion.div>

      {/* Activity graph */}
      <motion.div variants={item}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Activity</h2>
        <Card hover={false} animate={false} className="flex flex-col items-center justify-center py-12 text-center h-[200px]">
           <Star className="w-12 h-12 text-muted/30 mb-4" />
           <h3 className="font-semibold text-lg text-foreground">No activity yet</h3>
           <p className="text-muted-light mt-1">Start learning to build your activity graph.</p>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Achievements */}
        <motion.div variants={item}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-accent-orange" /> Achievements</h2>
          <Card hover={false} className="text-center py-12 h-[200px] flex flex-col justify-center">
             <Award className="w-10 h-10 text-muted/30 mx-auto mb-3" />
             <p className="text-muted-light">Earn achievements by completing courses and challenges.</p>
          </Card>
        </motion.div>

        {/* Completed courses */}
        <motion.div variants={item}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-accent-green" /> Completed Courses</h2>
          <Card hover={false} className="text-center py-12 h-[200px] flex flex-col justify-center">
             <BookOpen className="w-10 h-10 text-muted/30 mx-auto mb-3" />
             <p className="text-muted">Complete courses to see them here!</p>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
