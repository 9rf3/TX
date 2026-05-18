"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { adminStats, monthlyStats, leaderboard, courses } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { Users, BookOpen, DollarSign, Activity, TrendingUp, Shield, Search, MoreHorizontal, Ban, Edit, Eye } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const pieData = [
  { name: "Development", value: 45, color: "#8b5cf6" },
  { name: "Design", value: 25, color: "#ec4899" },
  { name: "Data Science", value: 20, color: "#06b6d4" },
  { name: "Business", value: 10, color: "#f59e0b" },
];

export default function AdminPage() {
  const [tab, setTab] = useState("overview");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Shield className="w-7 h-7 text-primary" /> Admin Panel</h1>
          <p className="text-muted-light mt-1">Manage your platform</p>
        </div>
        <Badge variant="danger" size="md">Admin Access</Badge>
      </motion.div>

      <Tabs
        tabs={[{ id: "overview", label: "Overview" }, { id: "users", label: "Users" }, { id: "courses", label: "Courses" }, { id: "moderation", label: "Moderation" }]}
        activeTab={tab} onChange={setTab}
      />

      {tab === "overview" && (
        <>
          {/* Stats cards */}
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-6 h-6 text-primary" />, label: "Total Users", value: formatNumber(adminStats.totalUsers), growth: adminStats.userGrowth, color: "from-primary/10 to-primary/5" },
              { icon: <Activity className="w-6 h-6 text-accent-green" />, label: "Active Users", value: formatNumber(adminStats.activeUsers), growth: adminStats.engagementRate, color: "from-accent-green/10 to-accent-green/5" },
              { icon: <BookOpen className="w-6 h-6 text-secondary" />, label: "Total Courses", value: adminStats.totalCourses.toString(), growth: adminStats.courseGrowth, color: "from-secondary/10 to-secondary/5" },
              { icon: <DollarSign className="w-6 h-6 text-accent-orange" />, label: "Revenue", value: `$${formatNumber(adminStats.totalRevenue)}`, growth: adminStats.revenueGrowth, color: "from-accent-orange/10 to-accent-orange/5" },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>{stat.icon}</div>
                  <Badge variant="success" size="sm"><TrendingUp className="w-3 h-3" /> +{stat.growth}%</Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted mt-0.5">{stat.label}</div>
              </Card>
            ))}
          </motion.div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <h2 className="text-lg font-bold mb-4">User Growth</h2>
              <Card hover={false} animate={false}>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyStats}>
                      <defs>
                        <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
                      <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} fill="url(#userGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <h2 className="text-lg font-bold mb-4">Revenue</h2>
              <Card hover={false} animate={false}>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyStats}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
                      <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Category distribution */}
          <motion.div variants={item}>
            <h2 className="text-lg font-bold mb-4">Course Distribution</h2>
            <Card hover={false} animate={false}>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-[200px] h-[200px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {pieData.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm flex-1">{d.name}</span>
                      <span className="text-sm font-semibold">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {tab === "users" && (
        <motion.div variants={item}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all" />
            </div>
            <Button variant="ghost" size="sm">Export</Button>
          </div>
          <Card hover={false} animate={false} className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Level</th>
                    <th className="px-5 py-3 font-medium">XP</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((entry) => (
                    <tr key={entry.rank} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={entry.user.name} size="sm" online={entry.user.isOnline} />
                          <div><div className="font-medium">{entry.user.name}</div><div className="text-xs text-muted">@{entry.user.username}</div></div>
                        </div>
                      </td>
                      <td className="px-5 py-3">{entry.level}</td>
                      <td className="px-5 py-3 text-primary-light">{formatNumber(entry.xp)}</td>
                      <td className="px-5 py-3"><Badge variant={entry.user.isOnline ? "success" : "default"}>{entry.user.isOnline ? "Online" : "Offline"}</Badge></td>
                      <td className="px-5 py-3"><Badge variant="primary">Student</Badge></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-muted cursor-pointer"><Eye className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-muted cursor-pointer"><Edit className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-accent-red/10 text-muted hover:text-accent-red cursor-pointer"><Ban className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {tab === "courses" && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input placeholder="Search courses..." className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all" />
            </div>
            <Button size="sm">+ Add Course</Button>
          </div>
          <div className="space-y-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: course.gradient }}>
                  {course.category === "development" ? "💻" : course.category === "design" ? "🎨" : course.category === "ai" ? "🤖" : "📊"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{course.title}</div>
                  <div className="text-xs text-muted">{course.instructor.name} • {course.totalLessons} lessons • {formatNumber(course.students)} students</div>
                </div>
                <Badge variant={course.price === "free" ? "success" : "primary"}>{course.price === "free" ? "Free" : `$${course.price}`}</Badge>
                <button className="p-2 rounded-lg hover:bg-white/5 text-muted cursor-pointer"><MoreHorizontal className="w-4 h-4" /></button>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "moderation" && (
        <motion.div variants={item} className="space-y-4">
          <Card hover={false} className="text-center py-12">
            <Shield className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-semibold text-lg">All Clear!</h3>
            <p className="text-muted mt-1">No pending moderation items</p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
