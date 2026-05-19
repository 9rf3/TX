"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Users, ChevronRight, UserPlus } from "lucide-react";

interface FriendPresence {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  level: number;
  isOnline: boolean;
  wasRecentlyActive: boolean;
}

export function FriendsOnline() {
  const [friends, setFriends] = useState<FriendPresence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { getFriendsWithPresence } = await import('@/actions/gamification');
        const data = await getFriendsWithPresence();
        setFriends(data as unknown as FriendPresence[]);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const online = friends.filter(f => f.isOnline);
  const recent = friends.filter(f => !f.isOnline && f.wasRecentlyActive);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Friends Online
          {online.length > 0 && (
            <span className="text-xs font-normal text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full">
              {online.length} online
            </span>
          )}
        </h2>
        <Link href="/friends" className="text-sm text-primary-light hover:text-primary flex items-center gap-1 transition-colors">
          All friends <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <Card className="p-6 text-center text-muted text-sm">Loading friends...</Card>
      ) : friends.length === 0 ? (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative z-10 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-primary-light" />
            </div>
            <h3 className="font-semibold text-sm mb-1">No friends yet</h3>
            <p className="text-xs text-muted mb-3">Add friends to see who&apos;s online</p>
            <Link href="/friends" className="text-xs text-primary-light hover:text-primary transition-colors font-medium">
              Find friends →
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {online.slice(0, 5).map(friend => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link href="/friends">
                <Card className="p-3 flex items-center gap-3 hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="relative">
                    <Avatar name={friend.full_name || friend.username || '?'} size="sm" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green border-2 border-surface">
                      <div className="w-full h-full rounded-full bg-accent-green animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate group-hover:text-primary-light transition-colors">
                      {friend.full_name || friend.username || 'Anonymous'}
                    </div>
                    <div className="text-xs text-muted">Lvl {friend.level}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse shrink-0" />
                </Card>
              </Link>
            </motion.div>
          ))}
          {recent.length > 0 && online.length < 5 && (
            <>
              <div className="text-[10px] text-muted uppercase tracking-wider px-1 pt-1">Recently active</div>
              {recent.slice(0, 5 - online.length).map(friend => (
                <Card key={friend.id} className="p-3 flex items-center gap-3 opacity-60">
                  <Avatar name={friend.full_name || friend.username || '?'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{friend.full_name || friend.username || 'Anonymous'}</div>
                    <div className="text-xs text-muted">Lvl {friend.level}</div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
