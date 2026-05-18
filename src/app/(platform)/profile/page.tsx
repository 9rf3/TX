"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { currentUser, achievements, courses } from "@/lib/mock-data";
import { formatNumber, getRarityColor } from "@/lib/utils";
import { Zap, Trophy, BookOpen, Flame, Calendar, Star, Award } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function ProfilePage() {
  const completedCourses = courses.filter((c) => c.completedLessons === c.totalLessons);
  const contributionData = Array.from({ length: 52 * 7 }, () => Math.random());

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <motion.div variants={item}>
        <Card hover={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
          <div className="relative flex flex-col md:flex-row items-center gap-6 p-2">
            <div className="relative">
              <Avatar name={currentUser.name} size="xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white border-2 border-surface">
                {currentUser.level}
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold">{currentUser.name}</h1>
              <p className="text-muted-light">@{currentUser.username}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                {currentUser.badges.map((badge) => (
                  <Badge key={badge.id} variant="primary" size="md">{badge.icon} {badge.title}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md"><Trophy className="w-3 h-3" /> Rank #{currentUser.rank}</Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Zap className="w-5 h-5 text-primary" />, label: "Total XP", value: formatNumber(currentUser.xp), color: "primary" },
          { icon: <BookOpen className="w-5 h-5 text-accent-green" />, label: "Courses", value: `${currentUser.completedCourses}`, color: "green" },
          { icon: <Flame className="w-5 h-5 text-accent-orange" />, label: "Streak", value: `${currentUser.streak} days`, color: "orange" },
          { icon: <Calendar className="w-5 h-5 text-secondary" />, label: "Joined", value: "Sep 2025", color: "cyan" },
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
        <Card hover={false} animate={false}>
          <div className="flex gap-[3px] overflow-x-auto pb-2">
            {Array.from({ length: 52 }, (_, week) => (
              <div key={week} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, day) => {
                  const val = contributionData[week * 7 + day];
                  return (
                    <div key={day}
                      className="w-3 h-3 rounded-[2px]"
                      style={{
                        backgroundColor: val > 0.8 ? "rgba(139,92,246,0.8)" : val > 0.5 ? "rgba(139,92,246,0.5)" : val > 0.2 ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.05)",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Achievements */}
        <motion.div variants={item}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-accent-orange" /> Achievements</h2>
          <div className="space-y-2">
            {achievements.map((ach) => (
              <Card key={ach.id} className={`flex items-center gap-3 !py-3 ${!ach.isUnlocked ? "opacity-40" : ""}`}>
                <span className="text-2xl">{ach.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{ach.title}</div>
                  <div className="text-xs text-muted">{ach.description}</div>
                  {!ach.isUnlocked && <Progress value={ach.progress} max={ach.maxProgress} size="sm" className="mt-1.5" />}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold" style={{ color: getRarityColor(ach.rarity) }}>{ach.rarity}</div>
                  <div className="text-xs text-muted">+{ach.xpReward} XP</div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Completed courses */}
        <motion.div variants={item}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-accent-green" /> Completed Courses</h2>
          <div className="space-y-2">
            {completedCourses.length > 0 ? completedCourses.map((course) => (
              <Card key={course.id} className="flex items-center gap-3 !py-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: course.gradient }}>
                  {course.category === "development" ? "💻" : "🎨"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{course.title}</div>
                  <div className="text-xs text-muted">{course.totalLessons} lessons • {course.duration}</div>
                </div>
                <Badge variant="success">✓</Badge>
              </Card>
            )) : (
              <Card hover={false} className="text-center py-8">
                <p className="text-muted">Complete courses to see them here!</p>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
