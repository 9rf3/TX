"use client";

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

type ChannelEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export function useRealtimeChannel<T = Record<string, unknown>>(
  channelName: string,
  table: string,
  event: ChannelEvent,
  callback: (payload: { new: T | null; old: T | null; eventType: string }) => void,
  filter?: { column: string; value: string },
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    const setup = () => {
      const channelConfig = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event,
            schema: "public",
            table,
            ...(filter ? { filter: `${filter.column}=eq.${filter.value}` } : {}),
          },
          (payload) => {
            callbackRef.current({
              new: payload.new as T | null,
              old: payload.old as T | null,
              eventType: payload.eventType,
            });
          },
        )
        .subscribe();

      channel = channelConfig;
    };

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [channelName, table, event, filter?.column, filter?.value]);
}
