import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export function useUnreadCount() {
  const { user } = useAuth();
  const userId = user?.id;
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let ignore = false;
    let request = 0;

    const load = async () => {
      const currentRequest = ++request;
      const { count: total, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_id", userId);
      if (!ignore && currentRequest === request && !error) {
        setResult({ userId, count: total ?? 0 });
      }
    };
    load();
    window.addEventListener("chat:read", load);

    const channel = supabase
      .channel(`unread:${userId}`)
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
  }, [userId]);

  return userId && result?.userId === userId ? result.count : 0;
}
