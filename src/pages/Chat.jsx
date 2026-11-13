import { Outlet, useMatch } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";

export default function Chat() {
  const hasThread = Boolean(useMatch("/chat/:conversationId"));

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 sm:gap-4">
      <h1
        className={`shrink-0 text-2xl font-bold ${hasThread ? "hidden lg:block" : ""}`}
      >
        Chat
      </h1>
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={`min-h-0 min-w-0 overflow-y-auto overscroll-contain ${hasThread ? "hidden lg:block" : "block"}`}
        >
          <ConversationList />
        </aside>
        <section
          className={`min-h-0 min-w-0 flex-col ${hasThread ? "flex" : "hidden lg:flex"}`}
        >
          <Outlet />
        </section>
      </div>
    </div>
  );
}
