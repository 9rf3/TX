"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Users, BookOpen, DollarSign, Activity, Shield, Search, Tags, Plus, Eye, Edit, Ban, ArrowRight } from "lucide-react";
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
    return <div className="p-8 text-center text-muted">Loading...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
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
              { icon: <Users className="w-6 h-6 text-primary" />, label: "Total Users", value: isUsersLoading ? "..." : formatNumber(users.length), color: "from-primary/10 to-primary/5" },
              { icon: <Activity className="w-6 h-6 text-accent-green" />, label: "Active Users", value: isUsersLoading ? "..." : formatNumber(users.filter(u => u.isOnline).length), color: "from-accent-green/10 to-accent-green/5" },
              { icon: <BookOpen className="w-6 h-6 text-secondary" />, label: "Total Courses", value: isCoursesLoading ? "..." : formatNumber(courses.length), color: "from-secondary/10 to-secondary/5" },
              { icon: <DollarSign className="w-6 h-6 text-accent-orange" />, label: "Revenue", value: "$0", color: "from-accent-orange/10 to-accent-orange/5" },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted mt-0.5">{stat.label}</div>
              </Card>
            ))}
          </motion.div>

          <motion.div variants={item} className="grid sm:grid-cols-2 gap-4">
            <Link href="/admin/courses">
              <Card className="flex items-center justify-between hover:border-primary/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold">Manage Courses</div>
                    <div className="text-xs text-muted">{courses.length} courses</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted" />
              </Card>
            </Link>
            <Link href="/admin/categories">
              <Card className="flex items-center justify-between hover:border-primary/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Tags className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Manage Categories</div>
                    <div className="text-xs text-muted">Organize courses</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted" />
              </Card>
            </Link>
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
            <Button variant="ghost" size="sm" onClick={() => fetchUsers()}>Refresh</Button>
          </div>

          {isUsersLoading ? (
            <div className="p-12 text-center text-muted">Loading users...</div>
          ) : users.length === 0 ? (
            <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
               <Users className="w-16 h-16 text-muted/30 mx-auto mb-4" />
               <h3 className="font-semibold text-xl text-foreground">No Users Found</h3>
               <p className="text-muted-light mt-2 max-w-md mx-auto">There are currently no registered users matching your search.</p>
            </Card>
          ) : (
            <Card hover={false} className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted">
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Joined</th>
                      <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.full_name || user.email || "Unknown"} size="sm" online={user.isOnline} />
                            <div>
                              <div className="font-medium">{user.full_name || "No Name"}</div>
                              <div className="text-xs text-muted">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><Badge variant={user.isOnline ? "success" : "default"}>{user.isOnline ? "Online" : "Offline"}</Badge></td>
                        <td className="px-5 py-3"><Badge variant={user.role === "admin" ? "danger" : user.role === "teacher" ? "primary" : "default"} className="capitalize">{user.role}</Badge></td>
                        <td className="px-5 py-3 text-muted">{new Date(user.created_at).toLocaleDateString()}</td>
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
          )}
        </motion.div>
      )}

      {tab === "courses" && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">Manage all courses on the platform</p>
            <Link href="/admin/courses">
              <Button size="sm"><ArrowRight className="w-4 h-4 mr-1" /> Course Manager</Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course) => (
              <Link key={course.id} href={`/admin/courses/${course.id}/edit`}>
                <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: course.gradient || "#1e293b" }}>
                      <BookOpen className="w-5 h-5 text-white/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{course.title}</div>
                      <div className="text-xs text-muted truncate">{course.instructor?.full_name || "Unknown"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={course.published ? "success" : "default"} size="sm">{course.published ? "Published" : "Draft"}</Badge>
                    <Badge variant={course.price === "free" ? "success" : "primary"} size="sm">{course.price === "free" ? "Free" : `$${course.price}`}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "categories" && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">Organize courses with categories</p>
            <Link href="/admin/categories">
              <Button size="sm"><Tags className="w-4 h-4 mr-1" /> Manage Categories</Button>
            </Link>
          </div>
        </motion.div>
      )}

      {tab === "moderation" && (
        <motion.div variants={item} className="space-y-4">
          <Card hover={false} className="text-center py-20">
            <Shield className="w-16 h-16 text-muted/30 mx-auto mb-4" />
            <h3 className="font-semibold text-xl text-foreground">All Clear!</h3>
            <p className="text-muted-light mt-2 max-w-md mx-auto">No pending moderation items</p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
