import { Outlet, useMatch } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";

export default function Chat() {
  const hasThread = Boolean(useMatch("/chat/:conversationId"));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Chat</h1>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className={hasThread ? "hidden lg:block" : "block"}>
          <ConversationList />
        </aside>
        <section className={hasThread ? "block" : "hidden lg:block"}>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
