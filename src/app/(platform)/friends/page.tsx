"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { friends, activityFeed } from "@/lib/mock-data";
import { getTimeAgo, formatNumber } from "@/lib/utils";
import { Users, UserPlus, MessageCircle, Search, Trophy, BookOpen, Flame, Zap, Star } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const typeIcons: Record<string, React.ReactNode> = {
  course_complete: <BookOpen className="w-4 h-4 text-accent-green" />,
  achievement: <Trophy className="w-4 h-4 text-accent-orange" />,
  level_up: <Star className="w-4 h-4 text-primary" />,
  streak: <Flame className="w-4 h-4 text-accent-orange" />,
  quiz: <Zap className="w-4 h-4 text-secondary" />,
};

export default function FriendsPage() {
  const [tab, setTab] = useState("friends");
  const onlineFriends = friends.filter((f) => f.status === "online");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Users className="w-7 h-7 text-primary" /> Friends</h1>
          <p className="text-muted-light mt-1">{onlineFriends.length} online • {friends.length} total</p>
        </div>
        <Button variant="ghost" size="sm"><UserPlus className="w-4 h-4" /> Add Friend</Button>
      </motion.div>

      <Tabs
        tabs={[{ id: "friends", label: "Friends" }, { id: "activity", label: "Activity Feed" }, { id: "requests", label: "Requests" }]}
        activeTab={tab} onChange={setTab}
      />

      {tab === "friends" && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search */}
          <motion.div variants={item} className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input placeholder="Search friends..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </motion.div>

          {friends.map((friend) => (
            <motion.div variants={item} key={friend.user.id}>
              <Card className="flex items-center gap-4">
                <Avatar name={friend.user.name} size="lg" online={friend.status === "online"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{friend.user.name}</span>
                    <Badge variant={friend.status === "online" ? "success" : "default"} size="sm">{friend.status}</Badge>
                  </div>
                  <div className="text-xs text-muted mt-0.5">{friend.lastActivity}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                    <span>Lvl {friend.user.level}</span>
                    <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-primary" /> {formatNumber(friend.user.xp)}</span>
                    <span>{friend.mutualFriends} mutual</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm"><MessageCircle className="w-4 h-4" /></Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-3">
          {activityFeed.map((act) => (
            <motion.div variants={item} key={act.id}>
              <Card className="flex items-center gap-4 !py-3">
                <Avatar name={act.user.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-semibold">{act.user.name}</span>{" "}
                    <span className="text-muted">{act.action}</span>{" "}
                    <span className="font-medium text-primary-light">{act.target}</span>
                  </div>
                  <div className="text-xs text-muted mt-0.5">{getTimeAgo(act.timestamp)}</div>
                </div>
                <div className="shrink-0">{typeIcons[act.type]}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "requests" && (
        <Card hover={false} className="text-center py-12">
          <UserPlus className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No pending friend requests</p>
        </Card>
      )}
    </motion.div>
  );
}
