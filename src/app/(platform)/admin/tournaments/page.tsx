"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireRole, ROLES } from "@/lib/role-utils";
import { useTournaments } from "@/components/providers/TournamentProvider";
import { GamePanel, PanelHeader } from "@/components/ui/GamePanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { 
  Trophy, Plus, Trash2, Edit, Check, X, Shield, 
  RotateCcw, Sparkles, UserPlus, FileSpreadsheet, Calendar, 
  Timer, Layers, Palette, Users, Coins, Search, Eye, AlertTriangle, Play, HelpCircle
} from "lucide-react";
import { TournamentCard, LeaderboardUser, RecentTournamentEntry, Difficulty, TournamentStatus } from "@/components/tournaments/data";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

// Predefined gorgeous gaming gradients
const PRESETS_GRADIENTS = [
  { name: "Purple Abyss", value: "linear-gradient(145deg, #0f172a 0%, #1a0b2e 40%, #0c1a2e 100%)" },
  { name: "Electric Blue", value: "linear-gradient(145deg, #0a1628 0%, #0c1a3d 40%, #091230 100%)" },
  { name: "Amber Forge", value: "linear-gradient(145deg, #1a1006 0%, #2a1a0a 40%, #1a1206 100%)" },
  { name: "Neon Cyber", value: "linear-gradient(145deg, #09090e 0%, #1f083a 50%, #09090e 100%)" },
  { name: "Deep Crimson", value: "linear-gradient(145deg, #1c0a0a 0%, #300f1c 50%, #0c0812 100%)" },
];

const PRESETS_AVATARS = [
  "from-amber-500 to-orange-600",
  "from-purple-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-green-500 to-emerald-600",
  "from-indigo-500 to-violet-600",
  "from-pink-500 to-rose-600",
];

const PRESETS_TIERS = [
  { name: "Legend", color: "#F59E0B" },
  { name: "Master", color: "#8B5CF6" },
  { name: "Elite", color: "#3B82F6" },
  { name: "Diamond", color: "#06B6D4" },
  { name: "Platinum", color: "#10B981" },
  { name: "Gold", color: "#EAB308" },
  { name: "Silver", color: "#94A3B8" },
  { name: "Bronze", color: "#B45309" },
];

export default function AdminTournamentsPage() {
  const { isAuthorized, isLoading: isRoleLoading } = useRequireRole([ROLES.ADMIN]);
  const {
    tournaments,
    leaderboard,
    recentHistory,
    isHydrated,
    addTournament,
    updateTournament,
    deleteTournament,
    addLeaderboardUser,
    updateLeaderboardUser,
    deleteLeaderboardUser,
    addHistoryEntry,
    deleteHistoryEntry,
    resetToDefaults,
  } = useTournaments();

  // Navigation & filtering states
  const [activeTab, setActiveTab] = useState("tournaments");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [tModalOpen, setTModalOpen] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  
  const [lModalOpen, setLModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);

  const [hModalOpen, setHModalOpen] = useState(false);

  // Forms dynamic inputs state
  const [tForm, setTForm] = useState({
    title: "",
    category: "",
    status: "UPCOMING" as TournamentStatus,
    endTime: "",
    participants: 0,
    maxParticipants: 1000,
    prizePool: 5000,
    difficulty: "Medium" as Difficulty,
    iconName: "code" as "code" | "zap" | "brain" | "mic" | "globe" | "shield",
    gradient: PRESETS_GRADIENTS[0].value,
    overlayPattern: "radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 60%)",
  });

  const [lForm, setLForm] = useState({
    username: "",
    tier: "Elite",
    tierColor: "#3B82F6",
    xp: 2500,
    initials: "",
    avatarGradient: PRESETS_AVATARS[0],
  });

  const [hForm, setHForm] = useState({
    name: "",
    date: "",
    rank: "#1",
    xp: "+350 XP",
    status: "Won" as "Won" | "Lost",
  });

  // Self dismiss toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Pre-fill datetime-local string
  const formatDatetimeLocal = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const tzoffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
      return localISOTime;
    } catch {
      return "";
    }
  };

  // Open Tournament Create/Edit Form
  const openTournamentForm = (tour?: TournamentCard) => {
    if (tour) {
      setEditingTournamentId(tour.id);
      setTForm({
        title: tour.title,
        category: tour.category,
        status: tour.status,
        endTime: formatDatetimeLocal(tour.endTime),
        participants: tour.participants,
        maxParticipants: tour.maxParticipants,
        prizePool: tour.prizePool,
        difficulty: tour.difficulty,
        iconName: tour.iconName,
        gradient: tour.gradient,
        overlayPattern: tour.overlayPattern || "",
      });
    } else {
      setEditingTournamentId(null);
      setTForm({
        title: "",
        category: "",
        status: "UPCOMING",
        endTime: formatDatetimeLocal(new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString()),
        participants: 0,
        maxParticipants: 1000,
        prizePool: 5000,
        difficulty: "Medium",
        iconName: "code",
        gradient: PRESETS_GRADIENTS[0].value,
        overlayPattern: "radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 60%)",
      });
    }
    setTModalOpen(true);
  };

  // Handle Tournament Submit
  const handleTournamentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tForm.title.trim() || !tForm.category.trim()) {
      alert("Title and Category are required");
      return;
    }

    const payload = {
      status: tForm.status,
      title: tForm.title.trim(),
      category: tForm.category.trim(),
      endTime: tForm.endTime ? new Date(tForm.endTime).toISOString() : new Date().toISOString(),
      participants: Number(tForm.participants),
      maxParticipants: Number(tForm.maxParticipants),
      prizePool: Number(tForm.prizePool),
      prizeDisplay: `${Number(tForm.prizePool).toLocaleString()} TX`,
      difficulty: tForm.difficulty,
      iconName: tForm.iconName,
      gradient: tForm.gradient,
      overlayPattern: tForm.overlayPattern,
    };

    if (editingTournamentId) {
      updateTournament(editingTournamentId, payload);
      triggerToast(`Successfully updated tournament "${payload.title}"`);
    } else {
      addTournament(payload);
      triggerToast(`Successfully created tournament "${payload.title}"`);
    }
    setTModalOpen(false);
  };

  // Open Leaderboard User Form
  const openLeaderboardForm = (user?: LeaderboardUser) => {
    if (user) {
      setEditingUsername(user.username);
      setLForm({
        username: user.username,
        tier: user.tier,
        tierColor: user.tierColor,
        xp: user.xp,
        initials: user.initials,
        avatarGradient: user.avatarGradient,
      });
    } else {
      setEditingUsername(null);
      setLForm({
        username: "",
        tier: "Elite",
        tierColor: "#3B82F6",
        xp: 2500,
        initials: "",
        avatarGradient: PRESETS_AVATARS[0],
      });
    }
    setLModalOpen(true);
  };

  // Handle Leaderboard Submit
  const handleLeaderboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lForm.username.trim()) {
      alert("Username is required");
      return;
    }

    const initials = lForm.initials.trim() 
      ? lForm.initials.trim().slice(0, 2).toUpperCase()
      : lForm.username.trim().slice(0, 2).toUpperCase();

    const payload = {
      username: lForm.username.trim(),
      tier: lForm.tier,
      tierColor: lForm.tierColor,
      xp: Number(lForm.xp),
      xpDisplay: Number(lForm.xp).toLocaleString(),
      initials,
      avatarGradient: lForm.avatarGradient,
    };

    if (editingUsername) {
      updateLeaderboardUser(editingUsername, payload);
      triggerToast(`Updated user "@${payload.username}"`);
    } else {
      // Check if user already exists
      if (leaderboard.some(u => u.username.toLowerCase() === payload.username.toLowerCase())) {
        alert("A user with this username already exists on the leaderboard.");
        return;
      }
      addLeaderboardUser({
        ...payload,
        rank: leaderboard.length + 1, // Will be sorted by XP in the context provider
      });
      triggerToast(`Added user "@${payload.username}" to leaderboards`);
    }
    setLModalOpen(false);
  };

  // Open History Log Form
  const openHistoryForm = () => {
    // Set some nice defaults
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const defaultDate = `${months[today.getMonth()]} ${today.getDate()}`;
    
    setHForm({
      name: "",
      date: defaultDate,
      rank: "#1",
      xp: "+350 XP",
      status: "Won",
    });
    setHModalOpen(true);
  };

  // Handle History Submit
  const handleHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hForm.name.trim()) {
      alert("Match name is required");
      return;
    }

    const payload = {
      name: hForm.name.trim(),
      date: hForm.date.trim() || "Today",
      rank: hForm.rank.trim() || "#1",
      xp: hForm.xp.trim().startsWith("+") ? hForm.xp.trim() : `+${hForm.xp.trim()}`,
      status: hForm.status,
    };

    addHistoryEntry(payload);
    triggerToast(`Logged match history entry for "${payload.name}"`);
    setHModalOpen(false);
  };

  // Confirm delete tournament
  const handleDeleteTournament = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete tournament "${title}"?\nThis action cannot be undone.`)) return;
    deleteTournament(id);
    triggerToast(`Deleted tournament "${title}"`);
  };

  // Confirm delete leaderboard user
  const handleDeleteLeaderboard = (username: string) => {
    if (!confirm(`Remove "${username}" from the leaderboard?`)) return;
    deleteLeaderboardUser(username);
    triggerToast(`Removed user "@${username}"`);
  };

  // Confirm delete history entry
  const handleDeleteHistory = (id: number, name: string) => {
    if (!confirm(`Delete match log for "${name}"?`)) return;
    deleteHistoryEntry(id);
    triggerToast(`Deleted match log for "${name}"`);
  };

  // Reset to default
  const handleResetToDefaults = () => {
    if (!confirm("Are you sure you want to RESET all tournaments, leaderboards, and matches to initial mock data?\nAll your custom entries will be lost.")) return;
    resetToDefaults();
    triggerToast("System state reset to defaults");
  };

  // Role authorization render loading guards
  if (isRoleLoading || !isAuthorized) {
    return (
      <div className="relative min-h-screen bg-[#070b16] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <Shield className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-light text-sm">Authenticating Admin credentials...</p>
        </div>
      </div>
    );
  }

  // Calculate live statistics
  const totalPrize = tournaments.reduce((acc, curr) => acc + curr.prizePool, 0);
  const liveCount = tournaments.filter(t => t.status === "LIVE").length;
  const upcomingCount = tournaments.filter(t => t.status === "UPCOMING").length;
  const totalParticipants = tournaments.reduce((acc, curr) => acc + curr.participants, 0);

  // Filters search queries
  const filteredTournaments = tournaments.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeaderboard = leaderboard.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = recentHistory.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.rank.includes(searchQuery)
  );

  return (
    <div className="relative min-h-full overflow-hidden bg-[#070b16] px-3 py-4 text-foreground sm:px-4 md:px-6">
      {/* Background gradients glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.15),transparent_45%),radial-gradient(circle_at_85%_16%,rgba(6,182,212,0.1),transparent_40%)]" />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* Banner Section */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Trophy className="w-7 h-7 text-primary animate-pulse-glow" /> Tournament Center
            </h1>
            <p className="text-muted-light mt-1">Full control panel for tournaments, leaderboards, and logs</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="danger" size="md">ADMIN PRIVILEGES</Badge>
            {!isHydrated && <Badge variant="warning" size="md">HYDRATING...</Badge>}
          </div>
        </motion.div>

        {/* Global Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-xl bg-primary/20 border border-primary/45 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2.5 text-sm text-white">
                <Sparkles className="w-5 h-5 text-primary-light animate-spin" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-muted-light hover:text-white cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Metrics Grid */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Calendar className="w-6 h-6 text-primary" />, label: "Total Tournaments", value: tournaments.length, detail: `${liveCount} Live / ${upcomingCount} Upcoming`, color: "border-primary/20 bg-primary/5 text-primary-light" },
            { icon: <Users className="w-6 h-6 text-accent-green" />, label: "Active Players", value: totalParticipants.toLocaleString(), detail: "Across all nodes", color: "border-accent-green/20 bg-accent-green/5 text-accent-green" },
            { icon: <Coins className="w-6 h-6 text-accent-orange" />, label: "Total Prize Pool", value: `${totalPrize.toLocaleString()} TX`, detail: "Distributed coins", color: "border-accent-orange/20 bg-accent-orange/5 text-accent-orange" },
            { icon: <Trophy className="w-6 h-6 text-secondary" />, label: "Leaderboard Users", value: leaderboard.length, detail: "Global tracked users", color: "border-secondary/20 bg-secondary/5 text-secondary" },
          ].map((stat, i) => (
            <GamePanel key={i} className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className={`grid h-10 w-10 place-items-center rounded-xl border ${stat.color}`}>
                  {stat.icon}
                </span>
                <span className="rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] font-bold text-muted-light uppercase tracking-wider">
                  STAT
                </span>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-white">{stat.value}</div>
                <div className="mt-0.5 text-xs text-muted-light font-medium">{stat.label}</div>
                <div className="mt-1 text-[10px] text-muted">{stat.detail}</div>
              </div>
            </GamePanel>
          ))}
        </motion.div>

        {/* Navigation Tabs and Search */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: "tournaments", label: "Tournaments", icon: <Calendar className="w-4 h-4" /> },
              { id: "leaderboard", label: "Leaderboards", icon: <Trophy className="w-4 h-4" /> },
              { id: "history", label: "Match History", icon: <FileSpreadsheet className="w-4 h-4" /> },
              { id: "controls", label: "System Controls", icon: <RotateCcw className="w-4 h-4" /> },
            ]}
            activeTab={activeTab}
            onChange={(id) => {
              setActiveTab(id);
              setSearchQuery("");
            }}
          />

          {activeTab !== "controls" && (
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          )}
        </motion.div>

        {/* Dynamic Tab Panes */}
        <AnimatePresence mode="wait">
          {activeTab === "tournaments" && (
            <motion.div
              key="tournaments-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Active Tournaments ({filteredTournaments.length})</h3>
                  <p className="text-xs text-muted-light">Create, modify or close dynamic tournament challenges</p>
                </div>
                <Button size="sm" onClick={() => openTournamentForm()} className="h-9">
                  <Plus className="w-4 h-4 mr-1" /> Add Tournament
                </Button>
              </div>

              {filteredTournaments.length === 0 ? (
                <GamePanel className="text-center py-16 flex flex-col justify-center items-center">
                  <Calendar className="w-12 h-12 text-muted/20 mb-3" />
                  <h4 className="font-bold text-base text-white">No Tournaments Found</h4>
                  <p className="text-xs text-muted-light mt-1 max-w-sm">
                    {searchQuery ? "Try a different search keyword." : "Click 'Add Tournament' to seed your first customized tournament."}
                  </p>
                </GamePanel>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredTournaments.map((tour) => (
                    <GamePanel key={tour.id} className="relative p-0 hover:border-primary/30 transition-all duration-300">
                      {/* Background Preset Glow Overlay */}
                      <div 
                        className="absolute inset-0 opacity-40 pointer-events-none" 
                        style={{ background: tour.overlayPattern || "none" }}
                      />
                      
                      {/* Gradient Header Slice */}
                      <div 
                        className="h-1.5 w-full shrink-0" 
                        style={{ background: tour.gradient || "linear-gradient(to right, #7c3aed, #06b6d4)" }}
                      />

                      <div className="p-4 space-y-3 relative z-10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] text-muted-light uppercase tracking-wider bg-white/5 border border-white/5 rounded px-2 py-0.5 font-bold">
                              {tour.category}
                            </span>
                            <h4 className="font-black text-sm text-white mt-1.5">{tour.title}</h4>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge 
                              variant={tour.status === "LIVE" ? "success" : tour.status === "UPCOMING" ? "info" : "default"}
                              className="uppercase"
                            >
                              {tour.status}
                            </Badge>
                            <Badge variant={tour.difficulty === "Elite" ? "danger" : tour.difficulty === "Hard" ? "warning" : tour.difficulty === "Medium" ? "primary" : "default"}>
                              {tour.difficulty}
                            </Badge>
                          </div>
                        </div>

                        {/* Tournament Details summary */}
                        <div className="grid grid-cols-3 gap-2.5 pt-1.5 border-t border-white/5 text-[11px]">
                          <div>
                            <div className="text-muted font-medium">Prize Pool</div>
                            <div className="text-accent-orange font-bold text-xs mt-0.5 flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5" />
                              {tour.prizeDisplay || `${tour.prizePool.toLocaleString()} TX`}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted font-medium">Participants</div>
                            <div className="text-white font-bold text-xs mt-0.5">
                              {tour.participants} <span className="text-[9px] text-muted font-normal">/ {tour.maxParticipants}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-muted font-medium">Ends/Starts</div>
                            <div className="text-white font-bold text-[10px] mt-0.5 truncate" title={new Date(tour.endTime).toLocaleString()}>
                              {new Date(tour.endTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                          <span className="text-[10px] text-muted font-mono select-all">
                            ID: {tour.id}
                          </span>

                          <div className="flex gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openTournamentForm(tour)}
                              className="px-2.5 py-1.5 h-8 text-[11px] rounded-lg"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteTournament(tour.id, tour.title)}
                              className="px-2.5 py-1.5 h-8 text-[11px] rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </GamePanel>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Leaderboard Records ({filteredLeaderboard.length})</h3>
                  <p className="text-xs text-muted-light">Manage mock users and ranking XP on the tournaments tab</p>
                </div>
                <Button size="sm" onClick={() => openLeaderboardForm()} className="h-9">
                  <UserPlus className="w-4 h-4 mr-1" /> Add Ranked User
                </Button>
              </div>

              {filteredLeaderboard.length === 0 ? (
                <GamePanel className="text-center py-16 flex flex-col justify-center items-center">
                  <Trophy className="w-12 h-12 text-muted/20 mb-3" />
                  <h4 className="font-bold text-base text-white">No Leaderboard Data</h4>
                  <p className="text-xs text-muted-light mt-1 max-w-sm">
                    {searchQuery ? "No matches found." : "Seed users using 'Add Ranked User' or sync defaults."}
                  </p>
                </GamePanel>
              ) : (
                <GamePanel className="!p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-muted-light uppercase tracking-wider font-bold">
                          <th className="px-5 py-3.5 text-[10px]">Rank</th>
                          <th className="px-5 py-3.5 text-[10px]">User Profile</th>
                          <th className="px-5 py-3.5 text-[10px]">Tier Badge</th>
                          <th className="px-5 py-3.5 text-[10px]">XP Accumulated</th>
                          <th className="px-5 py-3.5 text-[10px] text-right">Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredLeaderboard.map((user, idx) => (
                          <tr key={user.username} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3 font-mono font-bold text-white">
                              #{user.rank || idx + 1}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.avatarGradient || "from-violet-500 to-indigo-600"} flex items-center justify-center font-black text-white text-xs shadow-inner`}>
                                  {user.initials || "U"}
                                </div>
                                <span className="font-bold text-white text-sm">@{user.username}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span 
                                className="px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase"
                                style={{ 
                                  color: user.tierColor, 
                                  borderColor: `${user.tierColor}33`, 
                                  backgroundColor: `${user.tierColor}10` 
                                }}
                              >
                                {user.tier}
                              </span>
                            </td>
                            <td className="px-5 py-3 font-bold text-accent-orange">
                              {user.xpDisplay || user.xp.toLocaleString()} XP
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="inline-flex gap-1.5">
                                <button 
                                  onClick={() => openLeaderboardForm(user)}
                                  className="p-2 rounded-lg hover:bg-white/5 text-muted-light hover:text-white transition-colors cursor-pointer"
                                  title="Edit rank stats"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLeaderboard(user.username)}
                                  className="p-2 rounded-lg hover:bg-accent-red/10 text-muted-light hover:text-accent-red transition-colors cursor-pointer"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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

          {activeTab === "history" && (
            <motion.div
              key="history-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Recent Match History Logs ({filteredHistory.length})</h3>
                  <p className="text-xs text-muted-light">Feed recent outcomes displaying on the tournaments dashboard widget</p>
                </div>
                <Button size="sm" onClick={() => openHistoryForm()} className="h-9">
                  <Plus className="w-4 h-4 mr-1" /> Log Recent Match
                </Button>
              </div>

              {filteredHistory.length === 0 ? (
                <GamePanel className="text-center py-16 flex flex-col justify-center items-center">
                  <FileSpreadsheet className="w-12 h-12 text-muted/20 mb-3" />
                  <h4 className="font-bold text-base text-white">No Match Logs Available</h4>
                  <p className="text-xs text-muted-light mt-1 max-w-sm">
                    {searchQuery ? "No matched match log items." : "Click 'Log Recent Match' to submit a finished outcome."}
                  </p>
                </GamePanel>
              ) : (
                <GamePanel className="!p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-muted-light uppercase tracking-wider font-bold">
                          <th className="px-5 py-3.5 text-[10px]">Tournament Name</th>
                          <th className="px-5 py-3.5 text-[10px]">Date Completed</th>
                          <th className="px-5 py-3.5 text-[10px]">Platform Rank</th>
                          <th className="px-5 py-3.5 text-[10px]">XP Boost</th>
                          <th className="px-5 py-3.5 text-[10px]">Result Outcome</th>
                          <th className="px-5 py-3.5 text-[10px] text-right">Delete Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3 font-bold text-white">
                              {item.name}
                            </td>
                            <td className="px-5 py-3 text-muted-light font-medium">
                              {item.date}
                            </td>
                            <td className="px-5 py-3 font-mono font-bold text-white">
                              {item.rank}
                            </td>
                            <td className="px-5 py-3 font-bold text-primary-light">
                              {item.xp}
                            </td>
                            <td className="px-5 py-3">
                              <Badge variant={item.status === "Won" ? "success" : "danger"}>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button 
                                onClick={() => handleDeleteHistory(item.id, item.name)}
                                className="p-2 rounded-lg hover:bg-accent-red/10 text-muted-light hover:text-accent-red transition-colors cursor-pointer"
                                title="Remove log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

          {activeTab === "controls" && (
            <motion.div
              key="controls-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {/* Danger Zone */}
              <div className="md:col-span-1 space-y-4">
                <GamePanel className="border-accent-red/30 p-5 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-accent-red">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                      <h4 className="font-bold text-sm uppercase tracking-wider text-white">Danger Zone</h4>
                    </div>
                    <p className="text-xs text-muted-light leading-relaxed">
                      Restore tournaments, leaderboards, and logs back to default pre-seeded entries.
                      <span className="text-accent-red block mt-2 font-bold">This overrides all your local custom CRUD records persistently.</span>
                    </p>
                  </div>

                  <Button 
                    variant="danger" 
                    onClick={handleResetToDefaults}
                    className="w-full flex items-center justify-center gap-2 cursor-pointer h-10 rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Local State Defaults
                  </Button>
                </GamePanel>
              </div>

              {/* Developer State Inspector */}
              <div className="md:col-span-2 space-y-4">
                <GamePanel className="p-5 space-y-3 h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-primary-light">
                      <Layers className="w-5 h-5" />
                      <h4 className="font-bold text-sm uppercase tracking-wider text-white">State / Storage Inspector</h4>
                    </div>
                    <p className="text-xs text-muted-light">
                      Real-time client-hydration snapshot of tournaments schema stored on local storage namespace.
                    </p>
                  </div>

                  <div className="flex-1 mt-3 bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[10px] text-green-400 overflow-y-auto max-h-[300px]">
                    <span className="text-muted block mb-1.5">{"// twokax_tournaments_list active object payload"}</span>
                    <pre>{JSON.stringify({
                      totalTournaments: tournaments.length,
                      totalLeaderboard: leaderboard.length,
                      recentHistory: recentHistory.length,
                      firstItem: tournaments[0] || null
                    }, null, 2)}</pre>
                  </div>
                </GamePanel>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* ========================================================== */}
      {/* 1. TOURNAMENT FORM MODAL                                   */}
      {/* ========================================================== */}
      <AnimatePresence>
        {tModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0e1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Top Slice border */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent-pink to-secondary shrink-0" />
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-light" />
                  {editingTournamentId ? "Edit Tournament" : "New Tournament"}
                </h3>
                <button 
                  onClick={() => setTModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-muted-light hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content body scrollable */}
              <form onSubmit={handleTournamentSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input 
                      label="Tournament Name" 
                      placeholder="e.g. Frontend Masters Duel"
                      value={tForm.title}
                      onChange={e => setTForm({ ...tForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <Input 
                      label="Category" 
                      placeholder="e.g. Next.js App Router"
                      value={tForm.category}
                      onChange={e => setTForm({ ...tForm, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-medium text-muted-light block mb-1.5">Status</label>
                    <select
                      value={tForm.status}
                      onChange={e => setTForm({ ...tForm, status: e.target.value as TournamentStatus })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="UPCOMING" className="bg-[#0e1220] text-white">UPCOMING</option>
                      <option value="LIVE" className="bg-[#0e1220] text-white">LIVE</option>
                      <option value="COMPLETED" className="bg-[#0e1220] text-white">COMPLETED</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <Input 
                      label="End Date / Time" 
                      type="datetime-local"
                      value={tForm.endTime}
                      onChange={e => setTForm({ ...tForm, endTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <Input 
                      label="Prize Pool (TX Coins)" 
                      type="number"
                      min={0}
                      value={tForm.prizePool}
                      onChange={e => setTForm({ ...tForm, prizePool: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <Input 
                      label="Starting / Active Players" 
                      type="number"
                      min={0}
                      value={tForm.participants}
                      onChange={e => setTForm({ ...tForm, participants: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <Input 
                      label="Maximum Capacity" 
                      type="number"
                      min={10}
                      value={tForm.maxParticipants}
                      onChange={e => setTForm({ ...tForm, maxParticipants: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-medium text-muted-light block mb-1.5">Difficulty</label>
                    <select
                      value={tForm.difficulty}
                      onChange={e => setTForm({ ...tForm, difficulty: e.target.value as Difficulty })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="Easy" className="bg-[#0e1220] text-white">Easy</option>
                      <option value="Medium" className="bg-[#0e1220] text-white">Medium</option>
                      <option value="Hard" className="bg-[#0e1220] text-white">Hard</option>
                      <option value="Elite" className="bg-[#0e1220] text-white">Elite</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-medium text-muted-light block mb-1.5">Icon Theme</label>
                    <select
                      value={tForm.iconName}
                      onChange={e => setTForm({ ...tForm, iconName: e.target.value as "code" | "zap" | "brain" | "mic" | "globe" | "shield" })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="code" className="bg-[#0e1220] text-white">Code (zap)</option>
                      <option value="zap" className="bg-[#0e1220] text-white">Action (zap)</option>
                      <option value="brain" className="bg-[#0e1220] text-white">AI / Mind (brain)</option>
                      <option value="mic" className="bg-[#0e1220] text-white">Speeches (mic)</option>
                      <option value="globe" className="bg-[#0e1220] text-white">Web / Network (globe)</option>
                      <option value="shield" className="bg-[#0e1220] text-white">Security / Shield</option>
                    </select>
                  </div>

                  {/* Gradient preset selectors */}
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-light block mb-2">Background Gradient Preset</label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESETS_GRADIENTS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTForm({ ...tForm, gradient: p.value })}
                          className={`h-8 rounded-lg border flex items-center justify-center relative cursor-pointer overflow-hidden transition-all ${
                            tForm.gradient === p.value ? "border-primary shadow-[0_0_10px_rgba(139,92,246,0.3)] scale-[1.03]" : "border-white/10 hover:border-white/20"
                          }`}
                          title={p.name}
                        >
                          <div className="absolute inset-0" style={{ background: p.value }} />
                          {tForm.gradient === p.value && (
                            <Check className="w-3.5 h-3.5 text-white relative z-10 drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gradient Manual input override */}
                  <div className="col-span-2">
                    <Input 
                      label="Gradient String (Advanced Customization)" 
                      value={tForm.gradient}
                      onChange={e => setTForm({ ...tForm, gradient: e.target.value })}
                      placeholder="linear-gradient(...)"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-white/10 shrink-0">
                  <Button 
                    variant="ghost" 
                    type="button"
                    onClick={() => setTModalOpen(false)}
                    className="h-10 px-5 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="h-10 px-6 rounded-xl"
                  >
                    {editingTournamentId ? "Save Changes" : "Create Tournament"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* 2. LEADERBOARD USER MODAL                                  */}
      {/* ========================================================== */}
      <AnimatePresence>
        {lModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0e1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Top Slice border */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent-pink to-secondary shrink-0" />
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary-light" />
                  {editingUsername ? "Edit Ranked User" : "Add Ranked User"}
                </h3>
                <button 
                  onClick={() => setLModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-muted-light hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content body scrollable */}
              <form onSubmit={handleLeaderboardSubmit} className="p-6 space-y-4">
                
                <Input 
                  label="Username" 
                  placeholder="e.g. MasterCoder"
                  value={lForm.username}
                  onChange={e => setLForm({ ...lForm, username: e.target.value })}
                  disabled={!!editingUsername}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-light block mb-1.5">League Tier</label>
                    <select
                      value={lForm.tier}
                      onChange={e => {
                        const tier = e.target.value;
                        const match = PRESETS_TIERS.find(t => t.name === tier);
                        setLForm({ 
                          ...lForm, 
                          tier, 
                          tierColor: match ? match.color : lForm.tierColor 
                        });
                      }}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      {PRESETS_TIERS.map(t => (
                        <option key={t.name} value={t.name} className="bg-[#0e1220] text-white">
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Input 
                      label="XP Score" 
                      type="number"
                      min={0}
                      value={lForm.xp}
                      onChange={e => setLForm({ ...lForm, xp: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Input 
                      label="Initials (e.g. CN)" 
                      placeholder="Auto"
                      value={lForm.initials}
                      onChange={e => setLForm({ ...lForm, initials: e.target.value })}
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-light block mb-1.5">Tier Color HEX</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={lForm.tierColor}
                        onChange={e => setLForm({ ...lForm, tierColor: e.target.value })}
                        className="w-10 h-10 rounded bg-transparent cursor-pointer border-none shrink-0"
                      />
                      <input 
                        type="text"
                        value={lForm.tierColor}
                        onChange={e => setLForm({ ...lForm, tierColor: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar Gradient Presets */}
                <div>
                  <label className="text-sm font-medium text-muted-light block mb-2">Avatar Profile Gradient</label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESETS_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLForm({ ...lForm, avatarGradient: av })}
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${av} flex items-center justify-center relative cursor-pointer transition-all border-2 ${
                          lForm.avatarGradient === av ? "border-primary scale-[1.05]" : "border-white/5 hover:border-white/10"
                        }`}
                      >
                        {lForm.avatarGradient === av && (
                          <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-white/10 shrink-0">
                  <Button 
                    variant="ghost" 
                    type="button"
                    onClick={() => setLModalOpen(false)}
                    className="h-10 px-5 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="h-10 px-6 rounded-xl"
                  >
                    {editingUsername ? "Update Details" : "Add Ranked User"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* 3. LOG MATCH HISTORY MODAL                                 */}
      {/* ========================================================== */}
      <AnimatePresence>
        {hModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#0e1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Top Slice border */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent-pink to-secondary shrink-0" />
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary-light" />
                  Log Recent Match
                </h3>
                <button 
                  onClick={() => setHModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-muted-light hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content body */}
              <form onSubmit={handleHistorySubmit} className="p-6 space-y-4">
                
                <Input 
                  label="Tournament / Challenge Name" 
                  placeholder="e.g. Next.js Blitz Arena"
                  value={hForm.name}
                  onChange={e => setHForm({ ...hForm, name: e.target.value })}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input 
                      label="Date Tag (e.g. May 22)" 
                      value={hForm.date}
                      onChange={e => setHForm({ ...hForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Input 
                      label="My Rank Earned" 
                      placeholder="e.g. #3"
                      value={hForm.rank}
                      onChange={e => setHForm({ ...hForm, rank: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Input 
                      label="XP Received (e.g. +350 XP)" 
                      value={hForm.xp}
                      onChange={e => setHForm({ ...hForm, xp: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-light block mb-1.5">Match Outcome</label>
                    <select
                      value={hForm.status}
                      onChange={e => setHForm({ ...hForm, status: e.target.value as "Won" | "Lost" })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="Won" className="bg-[#0e1220] text-white">Won (Victory)</option>
                      <option value="Lost" className="bg-[#0e1220] text-white">Lost (Defeat)</option>
                    </select>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-white/10 shrink-0">
                  <Button 
                    variant="ghost" 
                    type="button"
                    onClick={() => setHModalOpen(false)}
                    className="h-10 px-5 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="h-10 px-6 rounded-xl"
                  >
                    Log Completed Match
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
