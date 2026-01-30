"use client";
import  ConnectPage  from "@/page-parts/connect-page";
import ChatPage  from "@/page-parts/chat-page";
import { backendUrl } from "@/env";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const response = await fetch(`${backendUrl}/is-connected/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({session_id: localStorage.getItem("session_id") || ""}),
      });
      const data = await response.json();
      setConnected(data.connected);
    };

    checkConnection();
  }, []);

  if (connected === null) {
    return <div></div>;
  }

  return connected ? <ChatPage /> : <ConnectPage />;
}
