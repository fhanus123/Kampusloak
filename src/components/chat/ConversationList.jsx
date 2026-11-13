import { NavLink } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { useConversations } from "../../hooks/useChat";
import Spinner from "../ui/Spinner";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

export default function ConversationList() {
  const { conversations, loading, error, refetch } = useConversations();

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (conversations.length === 0) {
    return (
      <EmptyState
        title="Belum ada percakapan"
        description="Buka barang yang Anda minati, lalu tekan Ajukan Penawaran."
      />
    );
  }

  return (
    <ul className="divide-y divide-ink/10 overflow-hidden rounded-xl bg-white shadow-sm">
      {conversations.map((c) => {
        const image = c.listings?.image_urls?.[0];
        return (
          <li key={c.id}>
            <NavLink
              to={`/chat/${c.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 transition hover:bg-mint/20 ${isActive ? "bg-mint/30" : ""}`
              }
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-mint/20">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink/30">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`min-w-0 truncate text-sm ${c.unread > 0 ? "font-bold" : "font-semibold"}`}
                  >
                    {c.otherName}
                  </p>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-cta px-1 text-xs font-bold">
                      {c.unread}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-ink/60">
                  {c.listings?.title ?? "Barang tidak tersedia"}
                </p>
                <p
                  className={`truncate text-xs ${c.unread > 0 ? "font-semibold" : "text-ink/70"}`}
                >
                  {c.last_message ?? "Belum ada pesan"}
                </p>
              </div>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}
