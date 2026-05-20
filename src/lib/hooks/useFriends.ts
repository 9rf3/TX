import { useCallback, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserProfile } from "./useUsers";

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  sender?: UserProfile;
  receiver?: UserProfile;
}

export interface Friendship {
  id: string;
  user_id_1: string;
  user_id_2: string;
  created_at: string;
  friend?: UserProfile; // We'll populate this with the "other" user
}

export function useFriends() {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabaseRef.current.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;

      // Fetch friendships where user is either user_id_1 or user_id_2
      const { data: fData, error: fErr } = await supabaseRef.current
        .from("friendships")
        .select("*")
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

      if (fErr) throw fErr;

      // We need to fetch the profile of the "other" user for each friendship
      const otherUserIds = fData.map(f => f.user_id_1 === userId ? f.user_id_2 : f.user_id_1);
      
      const profiles: Record<string, UserProfile> = {};
      if (otherUserIds.length > 0) {
        const { data: pData, error: pErr } = await supabaseRef.current
          .from("profiles")
          .select("*")
          .in("id", otherUserIds);
        
        if (pErr) throw pErr;
        
        pData.forEach(p => {
          profiles[p.id] = { ...p, isOnline: Math.random() > 0.5 } as UserProfile;
        });
      }

      const populatedFriendships = fData.map(f => ({
        ...f,
        friend: profiles[f.user_id_1 === userId ? f.user_id_2 : f.user_id_1]
      }));

      setFriendships(populatedFriendships);
    } catch (err: any) {
      console.error("Error fetching friends:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabaseRef.current.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;

      // Fetch pending requests where user is the receiver
      const { data: rData, error: rErr } = await supabaseRef.current
        .from("friend_requests")
        .select("*, sender:profiles!sender_id(*)")
        .eq("receiver_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (rErr) throw rErr;
      setRequests(rData as unknown as FriendRequest[]);
    } catch (err: any) {
      console.error("Error fetching requests:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendRequest = async (receiverId: string) => {
    try {
      const { data: userData } = await supabaseRef.current.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      const senderId = userData.user.id;

      if (senderId === receiverId) throw new Error("Cannot add yourself");

      const { error: err } = await supabaseRef.current
        .from("friend_requests")
        .insert([{ sender_id: senderId, receiver_id: receiverId }]);

      if (err) throw err;
      return true;
    } catch (err: any) {
      console.error("Error sending request:", err.message);
      throw err;
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const { error: err } = await supabaseRef.current.rpc("accept_friend_request", { request_id: requestId });
      if (err) throw err;
      
      // Refresh state
      setRequests(prev => prev.filter(r => r.id !== requestId));
      fetchFriends();
      return true;
    } catch (err: any) {
      console.error("Error accepting request:", err.message);
      throw err;
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error: err } = await supabaseRef.current
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);
        
      if (err) throw err;
      
      setRequests(prev => prev.filter(r => r.id !== requestId));
      return true;
    } catch (err: any) {
      console.error("Error rejecting request:", err.message);
      throw err;
    }
  };

  return { 
    friendships, 
    requests, 
    fetchFriends, 
    fetchRequests, 
    sendRequest, 
    acceptRequest, 
    rejectRequest, 
    isLoading, 
    error 
  };
}
