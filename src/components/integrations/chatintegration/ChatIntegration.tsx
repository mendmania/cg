// src/components/integrations/ChatIntegration/ChatIntegration.tsx
import React, { useEffect } from "react";
import { ChatPanel } from "@/components/containers/chatpanel/ChatPanel";

export const ChatIntegration: React.FC = () => {
  useEffect(() => {
    window.parent.postMessage({ type: "widgetLoaded", widget: "chat" }, "*");
    // TODO: listen for postMessage from host to send/receive chat events
  }, []);

  return <ChatPanel />;
};
