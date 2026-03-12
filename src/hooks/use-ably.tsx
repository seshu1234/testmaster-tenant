"use client";

import * as Ably from "ably";
import { useEffect, useRef, useCallback, useState } from "react";
import { env } from "@/lib/env";

export function useAbly(channelName: string) {
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  const [connection, setConnection] = useState<string>("initialized");

  useEffect(() => {
    if (!env.NEXT_PUBLIC_ABLY_KEY) return;

    const ably = new Ably.Realtime({ key: env.NEXT_PUBLIC_ABLY_KEY });
    ablyRef.current = ably;
    
    const channel = ably.channels.get(channelName);
    channelRef.current = channel;

    const updateStatus = () => setConnection(ably.connection.state);
    ably.connection.on(updateStatus);

    return () => {
      ably.connection.off(updateStatus);
      channel.detach();
      ably.close();
    };
  }, [channelName]);

  const publish = useCallback((name: string, data: unknown) => {
    if (channelRef.current) {
      channelRef.current.publish(name, data);
    }
  }, []);

  const subscribe = useCallback((name: string, callback: (message: Ably.Message) => void) => {
    if (channelRef.current) {
        channelRef.current.subscribe(name, callback);
    }
  }, []);

  return { publish, subscribe, connection };
}
