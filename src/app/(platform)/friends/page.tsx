"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Users, UserPlus, Search, MessageCircle, Check, X } from "lucide-react";
import { useFriends } from "@/lib/hooks/useFriends";
import { useUsers } from "@/lib/hooks/useUsers";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function FriendsPage() {
  const [tab, setTab] = useState("friends");
  const { friendships, requests, fetchFriends, fetchRequests, sendRequest, acceptRequest, rejectRequest, isLoading: isFriendsLoading } = useFriends();
  const { users, fetchUsers } = useUsers();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
    fetchUsers(); // Used for search
  }, [fetchFriends, fetchRequests, fetchUsers]);

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest(userId);
      alert("Friend request sent!");
    } catch (err: any) {
      alert("Failed to send request: " + err.message);
    }
  };

  const searchResults = users.filter(u => 
    searchQuery.trim().length > 0 && 
    (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Users className="w-7 h-7 text-primary" /> Friends</h1>
          <p className="text-muted-light mt-1">{friendships.filter(f => f.friend?.isOnline).length} online • {friendships.length} total</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsSearching(!isSearching)}>
          <UserPlus className="w-4 h-4 mr-2" /> Add Friend
        </Button>
      </motion.div>

      {isSearching && (
        <motion.div variants={item} className="mb-6">
          <Card className="p-4 border-primary/30">
            <h3 className="font-bold mb-3">Search Users</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            
            {searchQuery && searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.full_name || u.email || "User"} size="sm" />
                      <div>
                        <div className="font-medium text-sm">{u.full_name || u.email}</div>
                        <div className="text-xs text-muted">@{u.username || "user"}</div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleSendRequest(u.id)}>Add</Button>
                  </div>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No users found</p>
            )}
          </Card>
        </motion.div>
      )}

      <Tabs
        tabs={[{ id: "friends", label: "Friends" }, { id: "requests", label: `Requests (${requests.length})` }]}
        activeTab={tab} onChange={setTab}
      />

      {tab === "friends" && (
        <div className="pt-4">
          {isFriendsLoading ? (
            <div className="py-12 text-center text-muted">Loading friends...</div>
          ) : friendships.length === 0 ? (
            <motion.div variants={item}>
              <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
                 <Users className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                 <h3 className="font-semibold text-xl text-foreground">No Friends Yet</h3>
                 <p className="text-muted-light mt-2 max-w-md mx-auto">
                    You haven't added any friends yet. Click "Add Friend" to search for people you know!
                 </p>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {friendships.map((f) => (
                <motion.div variants={item} key={f.id}>
                  <Card className="flex items-center gap-4">
                    <Avatar name={f.friend?.full_name || f.friend?.email || "Unknown"} size="lg" online={f.friend?.isOnline} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{f.friend?.full_name || f.friend?.email}</span>
                        {f.friend?.isOnline && <Badge variant="success" size="sm">Online</Badge>}
                      </div>
                      <div className="text-xs text-muted mt-0.5">Joined {new Date(f.friend?.created_at || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <Button variant="ghost" size="sm"><MessageCircle className="w-4 h-4" /></Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div className="pt-4 space-y-3">
          {requests.length === 0 ? (
            <Card hover={false} className="text-center py-12">
              <UserPlus className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted">No pending friend requests</p>
            </Card>
          ) : (
            requests.map(req => (
              <motion.div variants={item} key={req.id}>
                <Card className="flex items-center justify-between !py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={req.sender?.full_name || req.sender?.email || "User"} size="md" />
                    <div>
                      <div className="font-medium text-sm">{req.sender?.full_name || req.sender?.email}</div>
                      <div className="text-xs text-muted">Sent a friend request</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => acceptRequest(req.id)}><Check className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-accent-red hover:text-accent-red hover:bg-accent-red/10" onClick={() => rejectRequest(req.id)}><X className="w-4 h-4" /></Button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
