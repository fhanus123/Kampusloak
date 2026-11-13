import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export function useNotifications() {
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
        .from("notifications")
        .select("id, type, title, body, link, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (!ignore && currentRequest === request) {
        setResult({
          userId,
          attempt,
          items: data ?? [],
          error: queryError ? "Gagal memuat notifikasi." : "",
        });
      }
    };

    load();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        load,
      )
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [userId, attempt]);

  const markRead = async (id) => {
    const now = new Date().toISOString();
    setResult((prev) =>
      prev?.userId === userId
        ? {
            ...prev,
            items: prev.items.map((n) =>
              n.id === id && !n.read_at ? { ...n, read_at: now } : n,
            ),
          }
        : prev,
    );
    await supabase.rpc("mark_notifications_read", { p_id: id });
  };

  const markAllRead = async () => {
    const now = new Date().toISOString();
    setResult((prev) =>
      prev?.userId === userId
        ? {
            ...prev,
            items: prev.items.map((n) =>
              n.read_at ? n : { ...n, read_at: now },
            ),
          }
        : prev,
    );
    await supabase.rpc("mark_notifications_read");
  };

  const remove = async (id) => {
    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);
    if (!deleteError) {
      setResult((prev) =>
        prev?.userId === userId
          ? {
              ...prev,
              items: prev.items.filter((n) => n.id !== id),
            }
          : prev,
      );
    }
    return { error: deleteError };
  };

  const current = userId && !loading ? result : null;
  const items = current?.items ?? [];
  const unread = items.filter((n) => !n.read_at).length;

  return {
    items,
    unread,
    loading,
    error: current?.error ?? "",
    refetch,
    markRead,
    markAllRead,
    remove,
  };
}
