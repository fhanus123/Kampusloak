import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { messageSchema } from "../../schemas/message";
import { supabase } from "../../lib/supabaseClient";
import { formatRupiah, formatTime } from "../../lib/format";
import { useAuth } from "../../hooks/useAuth";
import { useConversation, useMessages } from "../../hooks/useChat";
import Spinner from "../ui/Spinner";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

export default function ChatThread() {
  const { conversationId } = useParams();
  return <ThreadView key={conversationId} conversationId={conversationId} />;
}

function ThreadView({ conversationId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    conversation,
    loading: convLoading,
    error: convError,
    refetch,
  } = useConversation(conversationId);
  const { messages, loading, error, retry, send, remove } =
    useMessages(conversationId);
  const [actionError, setActionError] = useState("");
  const messagesRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { body: location.state?.draft ?? "" },
  });

  useEffect(() => {
    const container = messagesRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages.length, convLoading]);

  const onSubmit = async ({ body }) => {
    setActionError("");
    const { error: sendError } = await send(body);
    if (sendError) {
      setActionError("Pesan gagal terkirim. Mungkin barang sudah terjual.");
      return;
    }
    reset({ body: "" });
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Hapus pesan ini?")) return;
    const { error: deleteError } = await remove(id);
    if (deleteError) setActionError("Gagal menghapus pesan.");
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm("Hapus percakapan ini beserta semua pesannya?")) return;
    const { error: deleteError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", Number(conversationId));
    if (deleteError) {
      setActionError("Gagal menghapus percakapan.");
      return;
    }
    navigate("/chat", { replace: true });
  };

  if (convLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  if (convError) return <ErrorState message={convError} onRetry={refetch} />;
  if (!conversation) {
    return (
      <EmptyState
        title="Percakapan tidak ditemukan"
        description="Percakapan mungkin sudah dihapus."
      />
    );
  }

  const { listings: listing, otherName } = conversation;
  const canSend = listing?.status === "approved";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white shadow-sm lg:rounded-xl">
      <header className="flex shrink-0 items-center gap-3 border-b border-ink/10 p-3">
        <Link
          to="/chat"
          aria-label="Kembali"
          className="shrink-0 rounded-full p-1.5 hover:bg-mint/30 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{otherName}</p>
          {listing ? (
            <Link
              to={`/listings/${listing.id}`}
              className="block truncate text-xs text-nav-sub hover:underline"
            >
              {listing.title} · {formatRupiah(listing.price)}
            </Link>
          ) : (
            <p className="text-xs text-ink/60">Barang tidak tersedia</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDeleteConversation}
          aria-label="Hapus percakapan"
          className="shrink-0 rounded-full p-2 text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </header>

      <div
        ref={messagesRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain bg-page/60 p-4"
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/60">
            Belum ada pesan. Mulai tawar-menawar dengan sopan.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div
                key={m.id}
                className={`group flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`min-w-0 max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[80%] ${mine ? "bg-nav-sub text-white" : "bg-white shadow-sm"}`}
                >
                  <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {m.body}
                  </p>
                  <p
                    className={`mt-1 flex items-center justify-end gap-2 text-[10px] ${mine ? "text-white/70" : "text-ink/50"}`}
                  >
                    {mine && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        className="underline opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        Hapus
                      </button>
                    )}
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {canSend ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="shrink-0 border-t border-ink/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          noValidate
        >
          {(errors.body || actionError) && (
            <p role="alert" className="mb-2 text-xs text-red-600">
              {errors.body?.message ?? actionError}
            </p>
          )}
          <div className="flex gap-2">
            <input
              {...register("body")}
              autoComplete="off"
              placeholder="Tulis pesan atau tawaran harga..."
              aria-label="Pesan"
              className="min-w-0 flex-1 rounded-lg border border-ink/20 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Kirim"
              className="shrink-0 rounded-lg bg-cta px-4 text-ink hover:brightness-95 disabled:opacity-60"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      ) : (
        <p className="shrink-0 border-t border-ink/10 bg-gold/30 p-3 text-center text-sm">
          Barang ini sudah terjual atau tidak lagi tayang, jadi percakapan
          ditutup.
        </p>
      )}
    </div>
  );
}
