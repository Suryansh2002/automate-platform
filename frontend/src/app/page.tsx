import  ConnectPage  from "@/page-parts/connect-page";
import ChatPage  from "@/page-parts/chat-page";
import { backendUrl } from "@/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const response = await fetch(`${backendUrl}/is-connected/`);
  const connected = (await response.json()).connected;
  return connected ? <ChatPage /> : <ConnectPage />;
}
