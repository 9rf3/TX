"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { GamePanel, PanelHeader } from "@/components/ui/GamePanel";
import { Users, BookOpen, DollarSign, Activity, Shield, Search, Tags, Plus, Eye, Edit, Ban, ArrowRight, TrendingUp } from "lucide-react";
import { useRequireRole, ROLES } from "@/lib/role-utils";
import { useUsers } from "@/lib/hooks/useUsers";
import { useCourses } from "@/lib/hooks/useCourses";
import { formatNumber } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function AdminPage() {
  const { isAuthorized, isLoading: isRoleLoading } = useRequireRole([ROLES.ADMIN]);
  const [tab, setTab] = useState("overview");

  const { users, fetchUsers, isLoading: isUsersLoading } = useUsers();
  const { courses, fetchCourses, isLoading: isCoursesLoading } = useCourses();

  useEffect(() => {
    if (isAuthorized) {
      if (tab === "users" && users.length === 0) fetchUsers();
      if (tab === "courses" && courses.length === 0) fetchCourses(true);
      if (tab === "overview") {
        if (users.length === 0) fetchUsers();
        if (courses.length === 0) fetchCourses(true);
      }
    }
  }, [isAuthorized, tab, fetchUsers, fetchCourses]);

  if (isRoleLoading || !isAuthorized) {
    return (
      <div className="relative min-h-screen bg-[#070b16] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <Shield className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-light text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#070b16] px-3 py-4 text-foreground sm:px-4 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.12),transparent_40%),radial-gradient(circle_at_85%_16%,rgba(6,182,212,0.08),transparent_38%)]" />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 max-w-7xl mx-auto space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Shield className="w-7 h-7 text-primary" /> Admin Panel</h1>
            <p className="text-muted-light mt-1">Manage your platform</p>
          </div>
          <Badge variant="danger" size="md">Admin Access</Badge>
        </motion.div>

        <Tabs
          tabs={[{ id: "overview", label: "Overview" }, { id: "users", label: "Users" }, { id: "courses", label: "Courses" }, { id: "categories", label: "Categories" }, { id: "moderation", label: "Moderation" }]}
          activeTab={tab} onChange={setTab}
        />

        {tab === "overview" && (
          <>
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Users className="w-6 h-6 text-primary" />, label: "Total Users", value: isUsersLoading ? "..." : formatNumber(users.length), color: "text-primary" },
                { icon: <Activity className="w-6 h-6 text-accent-green" />, label: "Active Users", value: isUsersLoading ? "..." : formatNumber(users.filter(u => u.isOnline).length), color: "text-accent-green" },
                { icon: <BookOpen className="w-6 h-6 text-secondary" />, label: "Total Courses", value: isCoursesLoading ? "..." : formatNumber(courses.length), color: "text-secondary" },
                { icon: <DollarSign className="w-6 h-6 text-accent-orange" />, label: "Revenue", value: "$0", color: "text-accent-orange" },
              ].map((stat) => (
                <GamePanel key={stat.label} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`grid h-10 w-10 place-items-center rounded-[8px] border border-current/25 bg-white/5 ${stat.color}`}>
                      {stat.icon}
                    </span>
                    <span className="rounded-full border border-accent-green/25 bg-accent-green/10 px-2 py-0.5 text-[10px] font-bold text-accent-green flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Live
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-light">{stat.label}</div>
                </GamePanel>
              ))}
            </motion.div>

            <motion.div variants={item} className="grid sm:grid-cols-2 gap-4">
              <Link href="/admin/courses">
                <GamePanel className="flex items-center justify-between p-4 hover:border-primary/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-[8px] border border-secondary/25 bg-secondary/10 text-secondary">
                      <BookOpen className="w-6 h-6" />
                    </span>
                    <div>
                      <div className="font-bold text-white">Manage Courses</div>
                      <div className="text-xs text-muted-light">{courses.length} courses</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-light" />
                </GamePanel>
              </Link>
              <Link href="/admin/categories">
                <GamePanel className="flex items-center justify-between p-4 hover:border-primary/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-[8px] border border-primary/25 bg-primary/10 text-primary-light">
                      <Tags className="w-6 h-6" />
                    </span>
                    <div>
                      <div className="font-bold text-white">Manage Categories</div>
                      <div className="text-xs text-muted-light">Organize courses</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-light" />
                </GamePanel>
              </Link>
            </motion.div>
          </>
        )}

        {tab === "users" && (
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[8px] bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all" />
              </div>
              <Button variant="ghost" size="sm" onClick={() => fetchUsers()}>Refresh</Button>
            </div>

            {isUsersLoading ? (
              <GamePanel className="p-12 text-center">
                <p className="text-muted-light">Loading users...</p>
              </GamePanel>
            ) : users.length === 0 ? (
              <GamePanel className="text-center py-20 flex flex-col justify-center items-center">
                <Users className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-white">No Users Found</h3>
                <p className="text-muted-light mt-2 max-w-md mx-auto text-sm">There are currently no registered users matching your search.</p>
              </GamePanel>
            ) : (
              <GamePanel className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-muted-light">
                        <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider">User</th>
                        <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider">Role</th>
                        <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider">Joined</th>
                        <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={user.full_name || user.email || "Unknown"} size="sm" online={user.isOnline} />
                              <div>
                                <div className="font-bold text-white text-sm">{user.full_name || "No Name"}</div>
                                <div className="text-xs text-muted-light">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3"><Badge variant={user.isOnline ? "success" : "default"}>{user.isOnline ? "Online" : "Offline"}</Badge></td>
                          <td className="px-5 py-3"><Badge variant={user.role === "admin" ? "danger" : user.role === "teacher" ? "primary" : "default"} className="capitalize">{user.role}</Badge></td>
                          <td className="px-5 py-3 text-muted-light text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1">
                              <button className="p-1.5 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer"><Eye className="w-4 h-4" /></button>
                              <button className="p-1.5 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer"><Edit className="w-4 h-4" /></button>
                              <button className="p-1.5 rounded-lg hover:bg-accent-red/10 text-muted-light hover:text-accent-red cursor-pointer"><Ban className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GamePanel>
            )}
          </motion.div>
        )}

        {tab === "courses" && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-light">Manage all courses on the platform</p>
              <Link href="/admin/courses">
                <Button size="sm"><ArrowRight className="w-4 h-4 mr-1" /> Course Manager</Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.slice(0, 6).map((course) => (
                <Link key={course.id} href={`/admin/courses/${course.id}/edit`}>
                  <GamePanel className="p-4 hover:border-primary/40 transition-colors cursor-pointer h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="grid h-10 w-10 place-items-center rounded-[8px] text-lg shrink-0" style={{ background: course.gradient || "#1e293b" }}>
                        <BookOpen className="w-5 h-5 text-white/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{course.title}</div>
                        <div className="text-xs text-muted-light truncate">{course.instructor?.full_name || "Unknown"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${course.published ? "border-accent-green/25 bg-accent-green/10 text-accent-green" : "border-white/10 bg-white/5 text-muted-light"}`}>
                        {course.published ? "Published" : "Draft"}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${course.price === "free" ? "border-accent-green/25 bg-accent-green/10 text-accent-green" : "border-primary/25 bg-primary/10 text-primary-light"}`}>
                        {course.price === "free" ? "Free" : `$${course.price}`}
                      </span>
                    </div>
                  </GamePanel>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "categories" && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-light">Organize courses with categories</p>
              <Link href="/admin/categories">
                <Button size="sm"><Tags className="w-4 h-4 mr-1" /> Manage Categories</Button>
              </Link>
            </div>
          </motion.div>
        )}

        {tab === "moderation" && (
          <motion.div variants={item} className="space-y-4">
            <GamePanel className="text-center py-20">
              <Shield className="w-16 h-16 text-muted/30 mx-auto mb-4" />
              <h3 className="font-bold text-xl text-white">All Clear!</h3>
              <p className="text-muted-light mt-2 max-w-md mx-auto text-sm">No pending moderation items</p>
            </GamePanel>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
