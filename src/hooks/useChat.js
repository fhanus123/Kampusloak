import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { fetchNames } from "../lib/sellers";
import { useAuth } from "./useAuth";

const LISTING_FIELDS = "listings(id, title, price, image_urls, status)";

// Daftar percakapan milik user, diperbarui otomatis lewat realtime
export function useConversations() {
  const { user } = useAuth();
  const userId = user?.id;
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const refetch = useCallback(() => setAttempt((n) => n + 1), []);
  const loading =
    Boolean(userId) &&
    (result?.userId !== userId || result?.attempt !== attempt);

  useEffect(() => {
    if (!userId) return;
    let ignore = false;
    let request = 0;

    const load = async () => {
      const currentRequest = ++request;
      const { data, error: queryError } = await supabase
        .from("conversations")
        .select(
          `id, buyer_id, seller_id, last_message, last_message_at, ${LISTING_FIELDS}`,
        )
        .order("last_message_at", { ascending: false });

      if (ignore || currentRequest !== request) return;
      if (queryError) {
        setResult({
          userId,
          attempt,
          conversations: [],
          error: "Gagal memuat percakapan.",
        });
        return;
      }

      const otherIds = data.map((c) =>
        c.buyer_id === userId ? c.seller_id : c.buyer_id,
      );
      const names = await fetchNames(otherIds);

      const { data: unread, error: unreadError } = await supabase
        .from("messages")
        .select("conversation_id")
        .is("read_at", null)
        .neq("sender_id", userId);
      if (ignore || currentRequest !== request) return;
      const counts = {};
      (unread ?? []).forEach((m) => {
        counts[m.conversation_id] = (counts[m.conversation_id] ?? 0) + 1;
      });

      setResult({
        userId,
        attempt,
        conversations: data.map((c, i) => ({
          ...c,
          otherName: names[otherIds[i]] ?? "Pengguna",
          unread: counts[c.id] ?? 0,
        })),
        error: unreadError ? "Gagal memuat jumlah pesan belum dibaca." : "",
      });
    };

    load();
    window.addEventListener("chat:read", load);
    const channel = supabase
      .channel(`chat-list:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        load,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        load,
      )
      .subscribe();
    return () => {
      ignore = true;
      window.removeEventListener("chat:read", load);
      supabase.removeChannel(channel);
    };
  }, [userId, attempt]);

  const current = userId && !loading ? result : null;
  return {
    conversations: current?.conversations ?? [],
    loading,
    error: current?.error ?? "",
    refetch,
  };
}

// Satu percakapan (untuk header ruang chat)
export function useConversation(id) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");

      const numericId = Number(id);
      if (!Number.isInteger(numericId)) {
        setConversation(null);
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("conversations")
        .select(`id, buyer_id, seller_id, ${LISTING_FIELDS}`)
        .eq("id", numericId)
        .maybeSingle();

      if (ignore) return;
      if (queryError) {
        setError("Gagal memuat percakapan.");
        setLoading(false);
        return;
      }
      if (!data) {
        setConversation(null);
        setLoading(false);
        return;
      }

      const otherId =
        data.buyer_id === user.id ? data.seller_id : data.buyer_id;
      const names = await fetchNames([otherId]);
      if (ignore) return;
      setConversation({ ...data, otherName: names[otherId] ?? "Pengguna" });
      setLoading(false);
    };

    load();
    return () => {
      ignore = true;
    };
  }, [id, user.id, attempt]);

  return {
    conversation,
    loading,
    error,
    refetch: () => setAttempt((n) => n + 1),
  };
}

// Pesan dalam satu percakapan, dengan realtime
export function useMessages(conversationId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    const markRead = async () => {
      const { error: readError } = await supabase.rpc(
        "mark_conversation_read",
        {
          p_conversation_id: Number(conversationId),
        },
      );
      if (readError) {
        if (!ignore) {
          setError(
            "Gagal menandai pesan sudah dibaca. Coba muat ulang percakapan.",
          );
        }
        return;
      }
      window.dispatchEvent(new Event("chat:read"));
    };

    const load = async () => {
      setLoading(true);
      setError("");
      const { data, error: queryError } = await supabase
        .from("messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", Number(conversationId))
        .order("created_at", { ascending: true })
        .limit(200);

      if (ignore) return;
      if (queryError) {
        setError("Gagal memuat pesan.");
        setLoading(false);
        return;
      }
      setMessages(data ?? []);
      setLoading(false);
      markRead();
    };
    load();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        ({ new: msg }) => {
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
          );
          if (msg.sender_id !== user.id) markRead();
        },
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId, user.id, attempt]);

  const send = async (body) => {
    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: Number(conversationId),
        sender_id: user.id,
        body,
      })
      .select("id, sender_id, body, created_at")
      .single();
    if (insertError) return { error: insertError };
    setMessages((prev) =>
      prev.some((m) => m.id === data.id) ? prev : [...prev, data],
    );
    return { error: null };
  };

  const remove = async (id) => {
    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .eq("id", id);
    if (!deleteError) setMessages((prev) => prev.filter((m) => m.id !== id));
    return { error: deleteError };
  };

  return {
    messages,
    loading,
    error,
    retry: () => setAttempt((n) => n + 1),
    send,
    remove,
  };
}
