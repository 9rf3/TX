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
  isOnline: boolean;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const fetchUsers = useCallback(async (limit = 200) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err, count } = await supabaseRef.current
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (err) throw err;

      const processedData = (data || []).map(user => ({
        ...user,
        isOnline: Math.random() > 0.5
      }));

      setUsers(processedData);
      if (count !== null) setTotalCount(count);
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, totalCount, fetchUsers, isLoading, error };
}
