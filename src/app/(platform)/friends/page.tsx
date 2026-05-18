"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Users, UserPlus } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function FriendsPage() {
  const [tab, setTab] = useState("friends");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Users className="w-7 h-7 text-primary" /> Friends</h1>
          <p className="text-muted-light mt-1">0 online • 0 total</p>
        </div>
        <Button variant="ghost" size="sm"><UserPlus className="w-4 h-4" /> Add Friend</Button>
      </motion.div>

      <Tabs
        tabs={[{ id: "friends", label: "Friends" }, { id: "activity", label: "Activity Feed" }, { id: "requests", label: "Requests" }]}
        activeTab={tab} onChange={setTab}
      />

      <motion.div variants={item} className="pt-12">
        <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
           <Users className="w-16 h-16 text-muted/30 mx-auto mb-4" />
           <h3 className="font-semibold text-xl text-foreground">No Data Found</h3>
           <p className="text-muted-light mt-2 max-w-md mx-auto">
              {tab === "friends" && "You haven't added any friends yet. Start connecting with others!"}
              {tab === "activity" && "No recent activity from your friends."}
              {tab === "requests" && "No pending friend requests at this time."}
           </p>
        </Card>
      </motion.div>
    </motion.div>
  );
}
