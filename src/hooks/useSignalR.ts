// src/hooks/useSignalR.ts
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState as SignalRState,
  LogLevel,
} from "@microsoft/signalr";
import { useState, useEffect, useRef, useCallback } from "react";

/**  
 * Now an actual enum—has runtime values you can reference.  
 */
export enum ConnectionState {
  Disconnected = "Disconnected",
  Connecting   = "Connecting",
  Connected    = "Connected",
  Reconnecting = "Reconnecting",
}

interface UseSignalROptions<T> {
  /** Full URL to your SignalR hub (e.g. `${process.env.SIGNALR_URL}/chatHub`) */
  hubUrl: string;
  /** Map of server‐invoked method names to client callbacks */
  listeners?: Record<string, (payload: T) => void>;
  /** Start automatically on mount? (default: true) */
  autoStart?: boolean;
}

export function useSignalR<T = any>({
  hubUrl,
  listeners = {},
  autoStart = true,
}: UseSignalROptions<T>) {
  const connectionRef = useRef<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    conn.onreconnecting(() => setConnectionState(ConnectionState.Reconnecting));
    conn.onreconnected(() => setConnectionState(ConnectionState.Connected));
    conn.onclose(()      => setConnectionState(ConnectionState.Disconnected));

    // Wire up your listeners
    Object.entries(listeners).forEach(([method, handler]) => {
      conn.on(method, (data: T) => handler(data));
    });

    connectionRef.current = conn;

    if (autoStart) {
      setConnectionState(ConnectionState.Connecting);
      conn
        .start()
        .then(() => setConnectionState(ConnectionState.Connected))
        .catch((err) => {
          console.error("SignalR Connection Error:", err);
          setConnectionState(ConnectionState.Disconnected);
        });
    }

    return () => {
      conn.stop().catch(console.error);
    };
  }, [hubUrl, autoStart, listeners]);

  const send = useCallback(
    async (methodName: string, payload?: any) => {
      const conn = connectionRef.current;
      if (conn?.state === SignalRState.Connected) {
        try {
          await conn.invoke(methodName, payload);
        } catch (err) {
          console.error(`SignalR send(${methodName}) failed:`, err);
        }
      } else {
        console.warn("Cannot send, connection not in 'Connected' state.");
      }
    },
    []
  );

  return {
    connectionState,
    send,
    connection: connectionRef.current,
  };
}
