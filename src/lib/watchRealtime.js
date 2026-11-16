import { supabase } from "./supabaseClient";

export function watchRealtime(channelName, subscriptions, refresh) {
  let timer;
  const scheduleRefresh = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(refresh, 100);
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") scheduleRefresh();
  };

  const channel = supabase.channel(channelName);
  subscriptions.forEach(({ table, filter, event = "*" }) => {
    channel.on(
      "postgres_changes",
      { event, schema: "public", table, ...(filter ? { filter } : {}) },
      scheduleRefresh,
    );
  });
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") scheduleRefresh();
  });

  window.addEventListener("focus", scheduleRefresh);
  window.addEventListener("online", scheduleRefresh);
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("focus", scheduleRefresh);
    window.removeEventListener("online", scheduleRefresh);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    supabase.removeChannel(channel);
  };
}
