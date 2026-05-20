import { useCallback, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { UserRole } from "@/lib/types";

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  isOnline: boolean; // simulated
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabaseRef.current
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;

      // Add a simulated online status since we don't have real-time presence yet
      const processedData = (data || []).map(user => ({
        ...user,
        isOnline: Math.random() > 0.5
      }));

      setUsers(processedData);
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, fetchUsers, isLoading, error };
}
