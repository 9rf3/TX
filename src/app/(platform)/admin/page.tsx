"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Users, BookOpen, DollarSign, Activity, Shield, Search } from "lucide-react";
import { useRequireRole, ROLES } from "@/lib/role-utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function AdminPage() {
  const { isAuthorized, isLoading } = useRequireRole([ROLES.ADMIN]);
  const [tab, setTab] = useState("overview");

  if (isLoading || !isAuthorized) {
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
        tabs={[{ id: "overview", label: "Overview" }, { id: "users", label: "Users" }, { id: "courses", label: "Courses" }, { id: "moderation", label: "Moderation" }]}
        activeTab={tab} onChange={setTab}
      />

      {tab === "overview" && (
        <>
          {/* Stats cards */}
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-6 h-6 text-primary" />, label: "Total Users", value: "0", color: "from-primary/10 to-primary/5" },
              { icon: <Activity className="w-6 h-6 text-accent-green" />, label: "Active Users", value: "0", color: "from-accent-green/10 to-accent-green/5" },
              { icon: <BookOpen className="w-6 h-6 text-secondary" />, label: "Total Courses", value: "0", color: "from-secondary/10 to-secondary/5" },
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

          <motion.div variants={item} className="pt-8">
            <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
               <Activity className="w-16 h-16 text-muted/30 mx-auto mb-4" />
               <h3 className="font-semibold text-xl text-foreground">No Dashboard Data</h3>
               <p className="text-muted-light mt-2 max-w-md mx-auto">Analytics and chart data will populate here once users begin interacting with the platform.</p>
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
          <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
             <Users className="w-16 h-16 text-muted/30 mx-auto mb-4" />
             <h3 className="font-semibold text-xl text-foreground">No Users Found</h3>
             <p className="text-muted-light mt-2 max-w-md mx-auto">There are currently no registered users matching your search.</p>
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
          <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
             <BookOpen className="w-16 h-16 text-muted/30 mx-auto mb-4" />
             <h3 className="font-semibold text-xl text-foreground">No Courses Found</h3>
             <p className="text-muted-light mt-2 max-w-md mx-auto">There are currently no courses matching your search.</p>
          </Card>
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
