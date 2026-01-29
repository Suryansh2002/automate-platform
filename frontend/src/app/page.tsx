import  ConnectPage  from "@/page-parts/connect-page";
import ChatPage  from "@/page-parts/chat-page";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const response = await fetch("http://localhost:8000/is-connected/");
  const connected = (await response.json()).connected;
  return connected ? <ChatPage /> : <ConnectPage />;
}
