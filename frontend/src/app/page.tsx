import { ConnectPage } from "@/pages/connect-page";
import { ChatPage } from "@/pages/chat-page";

export default async function HomePage() {
  const response = await fetch("http://localhost:8000/is-connected/");
  const connected = (await response.json()).connected;
  return connected ? <ChatPage /> : <ConnectPage />;
}
