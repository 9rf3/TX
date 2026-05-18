"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Progress, XPRing } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { Flame, Target, BookOpen, Trophy, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { profile, user } = useAuth();
  
  const firstName = profile?.full_name ? profile.full_name.split(" ")[0] : user?.email?.split('@')[0] || "Student";
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p className="text-muted-light mt-1">Continue your learning journey. You&apos;re doing great!</p>
      </motion.div>

      {/* Stats row - Placeholders for real data */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <XPRing xp={0} xpToNext={1000} level={1} size={72} />
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Total XP</div>
            <div className="text-xl font-bold">0</div>
            <div className="text-xs text-primary-light">1000 to next</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-2xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center">
            <Flame className="w-8 h-8 text-accent-orange" />
          </div>
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Streak</div>
            <div className="text-xl font-bold">0 days</div>
            <div className="text-xs text-muted">Start learning!</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-accent-green" />
          </div>
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Courses</div>
            <div className="text-xl font-bold">0/0</div>
            <div className="text-xs text-muted">No courses yet</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Rank</div>
            <div className="text-xl font-bold">Unranked</div>
            <div className="text-xs text-muted">Complete lessons to rank</div>
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
            <Card hover={false} className="text-center py-12">
               <BookOpen className="w-12 h-12 text-muted/30 mx-auto mb-4" />
               <h3 className="font-semibold text-lg text-foreground">No active courses</h3>
               <p className="text-muted-light mt-1 max-w-sm mx-auto">You haven&apos;t started any courses yet. Browse our catalog to begin your journey.</p>
               <Link href="/courses" className="mt-4 inline-block px-4 py-2 bg-primary/10 text-primary-light rounded-xl hover:bg-primary/20 transition-colors text-sm font-medium">Explore Courses</Link>
            </Card>
          </motion.div>

          {/* Weekly stats */}
          <motion.div variants={item}>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-primary" /> Weekly Progress</h2>
            <Card animate={false} hover={false} className="flex flex-col items-center justify-center py-12 text-center h-[200px]">
               <TrendingUp className="w-12 h-12 text-muted/30 mb-4" />
               <h3 className="font-semibold text-lg text-foreground">No activity data yet</h3>
               <p className="text-muted-light mt-1">Complete lessons to see your progress chart.</p>
            </Card>
          </motion.div>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          {/* Daily challenges */}
          <motion.div variants={item}>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Target className="w-5 h-5 text-accent-orange" /> Daily Challenges</h2>
            <Card hover={false} className="text-center py-8">
               <Target className="w-8 h-8 text-muted/30 mx-auto mb-3" />
               <p className="text-muted-light text-sm">No challenges available today.</p>
            </Card>
          </motion.div>

          {/* Leaderboard preview */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-accent-orange" /> Leaderboard</h2>
              <Link href="/leaderboard" prefetch={true} className="text-sm text-primary-light hover:text-primary flex items-center gap-1">See all <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <Card animate={false} hover={false}>
              <div className="space-y-3">
                 <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-white/10 text-muted-light">
                      -
                    </div>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{profile?.full_name || user?.email?.split('@')[0]}</div>
                      <div className="text-xs text-muted">Lvl 1</div>
                    </div>
                    <div className="text-sm font-semibold text-primary-light">0</div>
                  </div>
                  <div className="text-center pt-4 pb-2">
                    <p className="text-xs text-muted">No other leaderboard data yet.</p>
                  </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
