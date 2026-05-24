"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Swords, Trophy, Clock, Users, Zap, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Tournament } from "@/lib/types";

export function LiveTournaments() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const fetchLive = async () => {
      try {
        const { data } = await supabase
          .from("tournaments")
          .select("*")
          .in("status", ["registration_open", "live"])
          .order("start_at", { ascending: true });
        if (!cancelled) {
          setTournaments((data as Tournament[]) ?? []);
        }
      } catch { /* ignore */ }
      finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchLive();

    // Subscribe to tournament changes for live indicator
    const channel = supabase
      .channel("dashboard-tournaments")
      .on("postgres_changes", { event: "*", schema: "public", table: "tournaments" }, () => {
        if (!cancelled) fetchLive();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const liveOnes = tournaments.filter((t) => t.status === "live").slice(0, 2);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5" style={{ background: "linear-gradient(145deg, #0f172a 0%, #1a0b2e 100%)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Live Arenas &amp; PvP</h3>
              <p className="text-[10px] text-muted-light">Real-time competitive battles</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/tournaments")}
            className="text-xs text-muted-light hover:text-primary-light transition-colors flex items-center gap-1 cursor-pointer"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-6">
            <Loader2 className="w-5 h-5 text-muted-light animate-spin mx-auto" />
          </div>
        ) : liveOnes.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="w-8 h-8 text-muted/30 mx-auto mb-2" />
            <p className="text-xs text-muted-light">No active tournaments right now</p>
            <p className="text-[10px] text-muted mt-1">Check back soon for new battles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {liveOnes.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-[10px] text-muted-light">
                        <Users className="w-3 h-3" /> {t.max_participants > 0 ? `${t.max_participants}` : "∞"}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-accent-orange">
                        <Clock className="w-3 h-3" /> {new Date(t.end_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
                  <Button size="sm" variant="primary" className="text-[10px] px-3 py-1 h-7" onClick={() => router.push("/tournaments")}>
                    Fight
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push("/tournaments")}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-muted-light hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Enter Tournament Arena
        </button>
      </div>
    </Card>
  );
}
