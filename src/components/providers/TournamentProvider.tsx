"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Tournament, TournamentRegistration } from "@/lib/types";

interface TournamentContextType {
  tournaments: Tournament[];
  activeTournaments: Tournament[];
  upcomingTournaments: Tournament[];
  completedTournaments: Tournament[];
  registrations: TournamentRegistration[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const DEBOUNCE_MS = 2000;

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useRef(createClient());
  const mounted = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.current.auth.getUser();

      const [tournamentsData, registrationsData] = await Promise.all([
        supabase.current
          .from("tournaments")
          .select("*")
          .order("start_at", { ascending: true }),
        user
          ? supabase.current
              .from("tournament_registrations")
              .select("*")
              .eq("user_id", user.id)
          : { data: [] },
      ]);

      if (!mounted.current) return;

      if (tournamentsData.error) throw new Error(tournamentsData.error.message);
      setTournaments(tournamentsData.data as Tournament[]);

      if (registrationsData.data) {
        setRegistrations(registrationsData.data as TournamentRegistration[]);
      }
    } catch (e) {
      if (mounted.current) {
        setError(e instanceof Error ? e.message : "Failed to load tournaments");
      }
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  // Debounced refetch to prevent realtime storm
  const debouncedRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (mounted.current) fetchData();
    }, DEBOUNCE_MS);
  }, [fetchData]);

  useEffect(() => {
    mounted.current = true;
    fetchData();

    const channel = supabase.current
      .channel("tournaments-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournaments" },
        () => { debouncedRefetch(); },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournament_registrations" },
        () => { debouncedRefetch(); },
      )
      .subscribe();

    return () => {
      mounted.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.current.removeChannel(channel);
    };
  }, [fetchData, debouncedRefetch]);

  const activeTournaments = tournaments.filter(
    (t) => t.status === "registration_open" || t.status === "live",
  );
  const upcomingList = tournaments.filter((t) => t.status === "upcoming");
  const completedList = tournaments.filter((t) => t.status === "completed");

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        activeTournaments,
        upcomingTournaments: upcomingList,
        completedTournaments: completedList,
        registrations,
        isLoading,
        error,
        refetch: fetchData,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournaments() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error("useTournaments must be used within a TournamentProvider");
  }
  return context;
}
