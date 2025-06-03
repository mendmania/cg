// src/components/containers/ChatPanel/ChatPanel.tsx
import React, { useState, useEffect } from "react";
import { useSignalR, ConnectionState } from "@/hooks/useSignalR";
import { iframeComm, WidgetEvent } from "@/services/iframeComm";
import { Input } from "@/components/fundamentals/input/Input";
import { Button } from "@/components/fundamentals/button/Button";
import { Loader } from "@/components/fundamentals/loader/Loader";

export const ChatPanel: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [draft, setDraft] = useState("");
    const { connectionState, send: sendToHub } = useSignalR<string>({
        hubUrl: `${process.env.NEXT_PUBLIC_SIGNALR_URL}/chatHub`,
        listeners: {
            ReceiveMessage: (msg) => {
                setMessages((prev) => [...prev, `Server: ${msg}`]);
                // forward server message to host
                iframeComm.send({
                    type: "chatMessage",
                    payload: { message: msg },
                });
            },
        },
    });

    useEffect(() => {
        // Notify host widget is ready
        iframeComm.send({ type: "init", payload: { widget: "chat" } });

        // Listen for all incoming events
        const unsubscribe = iframeComm.onMessage((event: WidgetEvent) => {
            switch (event.type) {
                case "chatMessage":
                    setMessages((prev) => [...prev, `Host: ${event.payload.message}`]);
                    break;
                case "closeWidget":
                    // Optional: handle host request to close widget
                    break;
                // handle other event types if needed
                default:
                    break;
            }
        });

        return () => {
            // Clean up listener, notify host, and tear down
            unsubscribe();
            iframeComm.send({ type: "closeWidget", payload: undefined });
            iframeComm.destroy();
        };
    }, []);

    const handleSend = () => {
        if (!draft.trim()) return;
        // Send to SignalR hub
        sendToHub("SendMessage", draft);
        // Optimistically echo in UI
        setMessages((prev) => [...prev, `Me: ${draft}`]);
        // Notify host
        iframeComm.send({ type: "chatMessage", payload: { message: draft } });
        setDraft("");
    };

    return (
        <div style={{ padding: "16px" }}>
            <p>Status: <strong>{connectionState}</strong></p>

            <div
                style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #eee",
                    padding: "8px",
                    marginBottom: "12px",
                }}
            >
                {connectionState === ConnectionState.Connecting ? (
                    <Loader />
                ) : (
                    messages.map((m, i) => (
                        <div key={i} style={{ marginBottom: "6px" }}>
                            {m}
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
                <Input
                    placeholder="Type a message…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    style={{ flex: 1 }}
                />
                <Button
                    onClick={handleSend}
                    disabled={connectionState !== ConnectionState.Connected}
                >
                    Send
                </Button>
            </div>
        </div>
    );
};
