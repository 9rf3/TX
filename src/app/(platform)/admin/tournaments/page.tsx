"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireRole, ROLES } from "@/lib/role-utils";
import { useTournaments } from "@/components/providers/TournamentProvider";
import { GamePanel } from "@/components/ui/GamePanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import {
  Trophy, Plus, Trash2, Edit, Check, X, Shield,
  Calendar, Users, Coins, Search, AlertTriangle, Loader2,
  HelpCircle, Clock, ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createTournament, updateTournament, deleteTournament,
  addQuestion, updateQuestion, deleteQuestion, updateTournamentStatus,
  getRegistrations,
} from "@/actions/admin/tournaments";
import { getTournamentQuestions } from "@/actions/tournaments";
import type { Tournament, TournamentQuestion, TournamentStatus, TournamentType, QuestionType } from "@/lib/types";

/* ==================================================================== */
/*  Admin Tournaments Page                                               */
/* ==================================================================== */

export default function AdminTournamentsPage() {
  const { isAuthorized, isLoading: isRoleLoading } = useRequireRole([ROLES.ADMIN]);
  const { tournaments, isLoading, refetch } = useTournaments();

  const [activeTab, setActiveTab] = useState("tournaments");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", type: "solo" as TournamentType, description: "",
    max_participants: 1000,
    registration_open_at: "", registration_close_at: "",
    start_at: "", end_at: "",
    coin_pool: 5000, xp_pool: 10000,
  });

  const [questions, setQuestions] = useState<TournamentQuestion[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [registrations, setRegistrations] = useState<unknown[]>([]);
  const [showRegistrations, setShowRegistrations] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const resetForm = () => {
    setFormData({
      title: "", type: "solo", description: "",
      max_participants: 1000,
      registration_open_at: "", registration_close_at: "",
      start_at: "", end_at: "",
      coin_pool: 5000, xp_pool: 10000,
    });
    setEditingId(null);
  };

  const openEdit = (t: Tournament) => {
    setFormData({
      title: t.title, type: t.type, description: t.description ?? "",
      max_participants: t.max_participants,
      registration_open_at: t.registration_open_at ? t.registration_open_at.slice(0, 16) : "",
      registration_close_at: t.registration_close_at ? t.registration_close_at.slice(0, 16) : "",
      start_at: t.start_at.slice(0, 16),
      end_at: t.end_at.slice(0, 16),
      coin_pool: t.rewards_config?.coin_pool ?? 5000,
      xp_pool: t.rewards_config?.xp_pool ?? 10000,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("form");
    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        description: formData.description || undefined,
        max_participants: formData.max_participants,
        registration_open_at: formData.registration_open_at ? new Date(formData.registration_open_at).toISOString() : undefined,
        registration_close_at: formData.registration_close_at ? new Date(formData.registration_close_at).toISOString() : undefined,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        rewards_config: { coin_pool: formData.coin_pool, xp_pool: formData.xp_pool },
      };

      if (editingId) {
        await updateTournament(editingId, payload);
        triggerToast(`Updated "${payload.title}"`);
      } else {
        await createTournament(payload);
        triggerToast(`Created "${payload.title}"`);
      }
      setShowForm(false);
      resetForm();
      refetch();
    } catch (e) {
      triggerToast(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await deleteTournament(id);
      triggerToast(`Deleted "${title}"`);
      refetch();
    } catch (e) {
      triggerToast(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id: string, status: TournamentStatus) => {
    setActionLoading(`${id}-status`);
    try {
      await updateTournamentStatus(id, status);
      triggerToast(`Status changed to ${status}`);
      refetch();
    } catch (e) {
      triggerToast(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const loadQuestions = async (t: Tournament) => {
    setSelectedTournament(t);
    try {
      const qs = await getTournamentQuestions(t.id);
      setQuestions(qs);
      setShowQuestions(true);
    } catch (e) {
      triggerToast(`Error loading questions: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  const loadRegistrations = async (t: Tournament) => {
    setSelectedTournament(t);
    try {
      const regs = await getRegistrations(t.id);
      setRegistrations(regs);
      setShowRegistrations(true);
    } catch (e) {
      triggerToast(`Error loading registrations: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  const filtered = tournaments.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status.includes(searchQuery.toLowerCase()),
  );

  if (isRoleLoading) {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-light animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center">
        <p className="text-muted-light">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#070b16] px-3 py-4 sm:px-4 md:px-6 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.15),transparent_45%)]" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Trophy className="w-7 h-7 text-primary" /> Tournament Center
            </h1>
            <p className="text-muted-light mt-1">Full control panel for tournaments, questions, and participants</p>
          </div>
          <Badge variant="danger" size="md">ADMIN PRIVILEGES</Badge>
        </div>

        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-xl bg-primary/20 border border-primary/45 flex items-center justify-between shadow-lg"
            >
              <span className="text-sm text-white">{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-muted-light hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Calendar className="w-6 h-6 text-primary" />, label: "Total", value: tournaments.length, color: "border-primary/20 bg-primary/5 text-primary-light" },
            { icon: <Users className="w-6 h-6 text-accent-green" />, label: "Live", value: tournaments.filter((t) => t.status === "live" || t.status === "registration_open").length, color: "border-accent-green/20 bg-accent-green/5 text-accent-green" },
            { icon: <Coins className="w-6 h-6 text-accent-orange" />, label: "Prize Pool", value: `${tournaments.reduce((a, t) => a + (t.rewards_config?.coin_pool ?? 0), 0).toLocaleString()} TX`, color: "border-accent-orange/20 bg-accent-orange/5 text-accent-orange" },
            { icon: <Trophy className="w-6 h-6 text-secondary" />, label: "Completed", value: tournaments.filter((t) => t.status === "completed").length, color: "border-secondary/20 bg-secondary/5 text-secondary" },
          ].map((stat) => (
            <GamePanel key={stat.label} className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className={`grid h-10 w-10 place-items-center rounded-xl border ${stat.color}`}>{stat.icon}</span>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-white">{stat.value}</div>
                <div className="mt-0.5 text-xs text-muted-light font-medium">{stat.label}</div>
              </div>
            </GamePanel>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: "tournaments", label: "Tournaments", icon: <Calendar className="w-4 h-4" /> },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tournaments..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
              />
            </div>
            <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Create
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-light animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <GamePanel className="text-center py-16">
            <Calendar className="w-12 h-12 text-muted/20 mx-auto mb-3" />
            <h4 className="font-bold text-base text-white">
              {searchQuery ? "No matches found" : "No tournaments yet"}
            </h4>
            <p className="text-xs text-muted-light mt-1">Click "Create" to add your first tournament.</p>
          </GamePanel>
        ) : (
          <div className="grid gap-4">
            {filtered.map((t) => (
              <GamePanel key={t.id} className="relative p-5 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        t.status === "live" ? "text-accent-red bg-accent-red/15 border-accent-red/20" :
                        t.status === "registration_open" ? "text-accent-green bg-accent-green/15 border-accent-green/20" :
                        t.status === "completed" ? "text-muted-light bg-white/5 border-white/10" :
                        "text-secondary bg-secondary/15 border-secondary/20"
                      )}>
                        {t.status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />}
                        {t.status}
                      </span>
                      <Badge variant="primary" size="sm">{t.type}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-white">{t.title}</h3>
                    {t.description && <p className="text-xs text-muted-light mt-1 line-clamp-1">{t.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-muted">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(t.start_at).toLocaleDateString()} - {new Date(t.end_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-accent-orange" />{t.rewards_config?.coin_pool?.toLocaleString() ?? 0} TX</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => loadRegistrations(t)} className="h-8 text-[11px]">
                      <Users className="w-3.5 h-3.5 mr-1" /> Participants
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => loadQuestions(t)} className="h-8 text-[11px]">
                      <HelpCircle className="w-3.5 h-3.5 mr-1" /> Questions
                    </Button>

                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value as TournamentStatus)}
                      className="text-[11px] rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-muted-light focus:outline-none focus:border-primary/50"
                      disabled={actionLoading === `${t.id}-status`}
                    >
                      <option value="upcoming">upcoming</option>
                      <option value="registration_open">registration_open</option>
                      <option value="live">live</option>
                      <option value="completed">completed</option>
                    </select>

                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)} className="h-8 text-[11px]">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(t.id, t.title)} className="h-8 text-[11px]" disabled={actionLoading === t.id}>
                      {actionLoading === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              </GamePanel>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0e1220] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent-pink to-secondary" />
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">{editingId ? "Edit Tournament" : "Create Tournament"}</h3>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                <div>
                  <label className="text-sm font-medium text-muted-light block mb-1.5">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as TournamentType })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option value="solo">Solo</option>
                    <option value="pvp">PvP</option>
                    <option value="team">Team</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-light block mb-1.5">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 h-20 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Registration Opens" type="datetime-local" value={formData.registration_open_at} onChange={(e) => setFormData({ ...formData, registration_open_at: e.target.value })} />
                  <Input label="Registration Closes" type="datetime-local" value={formData.registration_close_at} onChange={(e) => setFormData({ ...formData, registration_close_at: e.target.value })} />
                  <Input label="Start Time" type="datetime-local" value={formData.start_at} onChange={(e) => setFormData({ ...formData, start_at: e.target.value })} required />
                  <Input label="End Time" type="datetime-local" value={formData.end_at} onChange={(e) => setFormData({ ...formData, end_at: e.target.value })} required />
                  <Input label="Max Participants" type="number" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })} />
                  <Input label="Coin Pool" type="number" value={formData.coin_pool} onChange={(e) => setFormData({ ...formData, coin_pool: Number(e.target.value) })} />
                </div>
                <Input label="XP Pool" type="number" value={formData.xp_pool} onChange={(e) => setFormData({ ...formData, xp_pool: Number(e.target.value) })} />

                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" disabled={actionLoading === "form"}>
                    {actionLoading === "form" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    {editingId ? "Save Changes" : "Create Tournament"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Questions Modal */}
      <AnimatePresence>
        {showQuestions && selectedTournament && (
          <QuestionsModal
            tournament={selectedTournament}
            questions={questions}
            onClose={() => { setShowQuestions(false); setSelectedTournament(null); }}
            onRefresh={async () => {
              const qs = await getTournamentQuestions(selectedTournament.id);
              setQuestions(qs);
            }}
            triggerToast={triggerToast}
          />
        )}
      </AnimatePresence>

      {/* Registrations Modal */}
      <AnimatePresence>
        {showRegistrations && selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#0e1220] border border-white/10 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent-pink to-secondary" />
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">
                  Participants — {selectedTournament.title}
                </h3>
                <button onClick={() => { setShowRegistrations(false); setSelectedTournament(null); }}
                  className="p-1 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {registrations.length === 0 ? (
                  <p className="text-sm text-muted-light text-center py-8">No registrations yet.</p>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-muted-light uppercase tracking-wider font-bold">
                        <th className="px-3 py-3">User</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Score</th>
                        <th className="px-3 py-3">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(registrations as { id: string; user_id: string; status: string; score: number; registered_at: string; profiles?: { username: string | null; full_name: string | null; avatar_url: string | null } }[]).map((r) => (
                        <tr key={r.id} className="hover:bg-white/[0.02]">
                          <td className="px-3 py-3 font-medium text-white">{r.profiles?.username || r.profiles?.full_name || r.user_id.slice(0, 8)}</td>
                          <td className="px-3 py-3"><Badge variant={r.status === "confirmed" ? "success" : r.status === "disqualified" ? "danger" : "primary"} size="sm">{r.status}</Badge></td>
                          <td className="px-3 py-3 font-bold text-accent-orange">{r.score}</td>
                          <td className="px-3 py-3 text-muted-light">{new Date(r.registered_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==================================================================== */
/*  Questions Modal                                                       */
/* ==================================================================== */

function QuestionsModal({
  tournament, questions, onClose, onRefresh, triggerToast,
}: {
  tournament: Tournament;
  questions: TournamentQuestion[];
  onClose: () => void;
  onRefresh: () => Promise<void>;
  triggerToast: (msg: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "multiple_choice" as QuestionType, question_text: "", points: 100, order_index: questions.length });
  const [qData, setQData] = useState("{}");
  const [evalVec, setEvalVec] = useState("{}");

  const resetForm = () => {
    setForm({ type: "multiple_choice", question_text: "", points: 100, order_index: questions.length });
    setQData("{}");
    setEvalVec("{}");
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedData: Record<string, unknown>;
      let parsedEval: Record<string, unknown>;
      try { parsedData = JSON.parse(qData); } catch { triggerToast("Invalid question data JSON"); return; }
      try { parsedEval = JSON.parse(evalVec); } catch { triggerToast("Invalid evaluation vector JSON"); return; }

      if (editId) {
        await updateQuestion(editId, { type: form.type, data: parsedData, evaluation_vector: parsedEval, points: form.points, order_index: form.order_index });
        triggerToast("Question updated");
      } else {
        await addQuestion({ tournament_id: tournament.id, type: form.type, data: parsedData, evaluation_vector: parsedEval, points: form.points, order_index: form.order_index });
        triggerToast("Question added");
      }
      setShowAdd(false);
      resetForm();
      await onRefresh();
    } catch (e) {
      triggerToast(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id);
      triggerToast("Question deleted");
      await onRefresh();
    } catch (e) {
      triggerToast(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#0e1220] border border-white/10 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent-pink to-secondary" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-base font-bold text-white">Questions — {tournament.title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-light">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
            <Button size="sm" onClick={() => { resetForm(); setShowAdd(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <p className="text-sm text-muted-light text-center py-8">No questions yet. Add one to get started.</p>
          ) : (
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-muted-light uppercase tracking-wider">Q{i + 1}</span>
                    <span className="ml-2 text-xs font-medium text-primary-light">{q.type}</span>
                    <span className="ml-2 text-xs text-muted-light">{q.points} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditId(q.id);
                      setForm({ type: q.type, question_text: "", points: q.points, order_index: q.order_index });
                      setQData(JSON.stringify(q.data, null, 2));
                      setShowAdd(true);
                    }} className="h-7 text-[11px] px-2">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(q.id)} className="h-7 text-[11px] px-2">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Question Form Modal */}
        <AnimatePresence>
          {showAdd && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-lg bg-[#0e1220] border border-white/10 rounded-2xl shadow-2xl"
              >
                <div className="h-1 w-full bg-gradient-to-r from-primary via-accent-pink to-secondary" />
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white">{editId ? "Edit Question" : "Add Question"}</h3>
                  <button onClick={() => { setShowAdd(false); resetForm(); }} className="p-1 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-light block mb-1.5">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as QuestionType })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="coding_challenge">Coding Challenge</option>
                      <option value="written">Written</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Points" type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
                    <Input label="Order Index" type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-light block mb-1.5">Question Data (JSON)</label>
                    <textarea value={qData} onChange={(e) => setQData(e.target.value)}
                      className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-xs font-mono text-green-400 focus:outline-none focus:border-primary/50 h-32 resize-none"
                      placeholder='{"question": "What is...", "options": ["A", "B", "C", "D"]}' />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-light block mb-1.5">Evaluation Vector (JSON)</label>
                    <textarea value={evalVec} onChange={(e) => setEvalVec(e.target.value)}
                      className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-xs font-mono text-green-400 focus:outline-none focus:border-primary/50 h-32 resize-none"
                      placeholder='{"correct_answer": "A", "keywords": ["term1", "term2"]}' />
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                    <Button variant="ghost" type="button" onClick={() => { setShowAdd(false); resetForm(); }}>Cancel</Button>
                    <Button variant="primary" type="submit">{editId ? "Save" : "Add Question"}</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
