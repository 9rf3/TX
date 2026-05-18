"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress, XPRing } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { currentUser, courses, dailyChallenges, leaderboard, weeklyStats } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { Flame, Target, BookOpen, Trophy, TrendingUp, ChevronRight, Zap, Star, Clock } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const recentCourses = courses.filter((c) => c.completedLessons > 0 && c.completedLessons < c.totalLessons);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, <span className="gradient-text">{currentUser.name.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-muted-light mt-1">Continue your learning journey. You&apos;re doing great!</p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <XPRing xp={currentUser.xp} xpToNext={currentUser.xpToNext} level={currentUser.level} size={72} />
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Total XP</div>
            <div className="text-xl font-bold">{formatNumber(currentUser.xp)}</div>
            <div className="text-xs text-primary-light">{currentUser.xpToNext - currentUser.xp} to next</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-2xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center">
            <Flame className="w-8 h-8 text-accent-orange" />
          </div>
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Streak</div>
            <div className="text-xl font-bold">{currentUser.streak} days</div>
            <div className="text-xs text-accent-orange">🔥 On fire!</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-accent-green" />
          </div>
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Courses</div>
            <div className="text-xl font-bold">{currentUser.completedCourses}/{currentUser.totalCourses}</div>
            <div className="text-xs text-accent-green">67% complete</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Rank</div>
            <div className="text-xl font-bold">#{currentUser.rank}</div>
            <div className="text-xs text-secondary">Top 5%</div>
          </div>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue learning */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Continue Learning</h2>
              <Link href="/courses" prefetch={true} className="text-sm text-primary-light hover:text-primary flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="space-y-3">
              {recentCourses.map((course) => (
                <Link href={`/courses/${course.id}`} prefetch={true} key={course.id}>
                  <Card className="flex items-center gap-4 group">
                    <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-2xl" style={{ background: course.gradient }}>
                      {course.category === "development" ? "💻" : course.category === "design" ? "🎨" : "📊"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary-light transition-colors">{course.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" />{course.xpReward} XP</span>
                      </div>
                      <Progress value={course.completedLessons} max={course.totalLessons} size="sm" className="mt-2" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary-light shrink-0 transition-colors" />
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Weekly stats */}
          <motion.div variants={item}>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-primary" /> Weekly Progress</h2>
            <Card animate={false} hover={false}>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyStats}>
                    <defs>
                      <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Area type="monotone" dataKey="xp" stroke="#8b5cf6" strokeWidth={2} fill="url(#xpGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          {/* Daily challenges */}
          <motion.div variants={item}>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Target className="w-5 h-5 text-accent-orange" /> Daily Challenges</h2>
            <div className="space-y-3">
              {dailyChallenges.map((ch) => (
                <Card key={ch.id} className={ch.isCompleted ? "opacity-60" : ""}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{ch.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{ch.title}</h3>
                        <Badge variant={ch.isCompleted ? "success" : "primary"}>
                          +{ch.xpReward} XP
                        </Badge>
                      </div>
                      <p className="text-xs text-muted mt-0.5">{ch.description}</p>
                      <Progress value={ch.progress} max={ch.maxProgress} size="sm" color={ch.isCompleted ? "green" : "primary"} className="mt-2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Leaderboard preview */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-accent-orange" /> Leaderboard</h2>
              <Link href="/leaderboard" prefetch={true} className="text-sm text-primary-light hover:text-primary flex items-center gap-1">See all <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <Card animate={false} hover={false}>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div key={entry.rank} className={`flex items-center gap-3 p-2 rounded-xl ${entry.user.id === currentUser.id ? "bg-primary/10 border border-primary/20" : ""}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${entry.rank <= 3 ? "bg-gradient-to-br from-accent-orange to-amber-400 text-white" : "bg-white/10 text-muted-light"}`}>
                      {entry.rank}
                    </div>
                    <Avatar name={entry.user.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{entry.user.name}</div>
                      <div className="text-xs text-muted">Lvl {entry.level}</div>
                    </div>
                    <div className="text-sm font-semibold text-primary-light">{formatNumber(entry.xp)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
