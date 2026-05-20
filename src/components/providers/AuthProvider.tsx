"use client";

import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import { UserRole } from "@/lib/types";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode;
  initialUser: User | null;
  initialProfile: Profile | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const supabaseRef = useRef(createClient());
  const router = useRouter();
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;

    const {
      data: { subscription },
    } = supabaseRef.current.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data } = await supabaseRef.current
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
      
      if (event === 'SIGNED_OUT') {
        router.push('/');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const value = useMemo(() => ({ user, profile, isLoading }), [user, profile, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
