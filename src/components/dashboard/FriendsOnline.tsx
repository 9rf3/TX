"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Users, ChevronRight, UserPlus, Send, Zap, Crown } from "lucide-react";
import { useSound } from "@/lib/hooks/useSound";

interface FriendPresence {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  level: number;
  isOnline: boolean;
  wasRecentlyActive: boolean;
  total_xp_earned?: number;
}

// Preset gaming style activities
const gamingActivities = [
  "Practicing IELTS 📝",
  "In AI Chat 🤖",
  "Doing React Course ⚛️",
  "Playing PvP ⚔️",
  "In Coding Arena 💻",
  "Reviewing CSS Constellation 🌳",
  "Completing Daily Quest 🎯"
];

export function FriendsOnline() {
  const { playClick, playRewardClaim } = useSound();
  const [friends, setFriends] = useState<FriendPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitedFriends, setInvitedFriends] = useState<Record<string, boolean>>({});

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

  const handleInvite = (friendId: string) => {
    playClick();
    setInvitedFriends(prev => ({ ...prev, [friendId]: true }));
    setTimeout(() => {
      playRewardClaim();
    }, 150);
  };

  const online = friends.filter(f => f.isOnline);
  const recent = friends.filter(f => !f.isOnline && f.wasRecentlyActive);

  // Map activities statically based on user ID so they stay consistent on re-render
  const getActivity = (id: string) => {
    const charCodeSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return gamingActivities[charCodeSum % gamingActivities.length];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-light" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider">Multiplayer Lobby</h2>
            <p className="text-[10px] text-muted-light">Co-op study sessions and live PvP lobbies</p>
          </div>
        </div>

        <Link
          href="/friends"
          className="text-xs text-primary-light hover:text-white transition-colors flex items-center gap-0.5 bg-primary/10 border border-primary/20 px-2 py-1 rounded-xl"
        >
          All Friends <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <Card className="p-6 text-center text-muted text-sm">Loading lobby data...</Card>
      ) : friends.length === 0 ? (
        <Card className="relative overflow-hidden border-dashed border-white/10 bg-white/[0.01] !p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative z-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-primary-light" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Your Squad is Empty</h3>
              <p className="text-xs text-muted-light">Recruit friends to challenge them in real-time speedrun tournaments!</p>
            </div>
            <Link href="/friends">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-light bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-xl cursor-pointer transition duration-300">
                Search Competitors <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {online.slice(0, 5).map(friend => {
            const isInvited = invitedFriends[friend.id];
            const currentActivity = getActivity(friend.id);

            return (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative"
              >
                <Card className="!p-3.5 flex items-center justify-between gap-3 hover:border-primary/40 bg-gradient-to-r from-surface to-surface-light transition-all duration-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      {/* Pulsing online backlight */}
                      <div className="absolute -inset-0.5 rounded-full bg-accent-green opacity-40 blur pointer-events-none" />
                      <Avatar name={friend.full_name || friend.username || '?'} size="sm" className="relative z-10 border border-accent-green/50" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green border-2 border-surface z-20">
                        <div className="w-full h-full rounded-full bg-accent-green animate-ping" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate max-w-[100px]">
                          {friend.full_name || friend.username || 'Anonymous'}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-primary/20 text-primary-light border border-primary/30 font-bold">
                          LVL {friend.level}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-light mt-0.5 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block animate-pulse" />
                        {currentActivity}
                      </div>
                    </div>
                  </div>

                  {/* Study session Invite Button */}
                  <button
                    onClick={() => !isInvited && handleInvite(friend.id)}
                    disabled={isInvited}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isInvited
                        ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                        : "bg-primary/10 text-primary-light hover:bg-primary border border-primary/20 hover:text-white"
                    }`}
                  >
                    {isInvited ? (
                      <span>Invited</span>
                    ) : (
                      <>
                        <Send className="w-3 h-3" /> Invite
                      </>
                    )}
                  </button>
                </Card>
              </motion.div>
            );
          })}

          {recent.length > 0 && online.length < 5 && (
            <div className="space-y-2">
              <div className="text-[9px] uppercase tracking-wider text-muted font-black px-1 pt-2">Recently Active Squads</div>
              {recent.slice(0, 5 - online.length).map(friend => (
                <Card key={friend.id} className="!p-3.5 flex items-center justify-between gap-3 opacity-60 bg-white/[0.01] border-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={friend.full_name || friend.username || '?'} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">
                          {friend.full_name || friend.username || 'Anonymous'}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-white/5 border border-white/10 text-muted">
                          LVL {friend.level}
                        </span>
                      </div>
                      <div className="text-[9px] text-muted mt-0.5 font-semibold">
                        Offline · Last active recently
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
