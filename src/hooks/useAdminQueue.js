import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export function useAdminQueue() {
  const { user, isAdmin } = useAuth();
  const userId = user?.id;
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const refetch = useCallback(() => setAttempt((n) => n + 1), []);
  const loading =
    Boolean(userId && isAdmin) &&
    (result?.userId !== userId || result?.attempt !== attempt);

  useEffect(() => {
    if (!userId || !isAdmin) return;
    let ignore = false;
    let request = 0;

    const load = async () => {
      const currentRequest = ++request;
      let results;
      try {
        results = await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "user")
            .eq("verification_status", "pending"),
          supabase
            .from("listings")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("reports")
            .select("id", { count: "exact", head: true })
            .eq("status", "open"),
        ]);
      } catch {
        if (!ignore && currentRequest === request) {
          setResult({
            userId,
            attempt,
            items: [],
            error: "Gagal memuat antrean admin. Coba lagi.",
          });
        }
        return;
      }
      if (ignore || currentRequest !== request) return;
      const failed = results.some((result) => result.error);
      const items = [
        {
          key: "profiles",
          title: "Akun menunggu verifikasi",
          link: "/admin",
          count: results[0].count ?? 0,
        },
        {
          key: "listings",
          title: "Barang menunggu persetujuan",
          link: "/admin/listings",
          count: results[1].count ?? 0,
        },
        {
          key: "reports",
          title: "Laporan menunggu ditinjau",
          link: "/admin/reports",
          count: results[2].count ?? 0,
        },
      ];
      setResult({
        userId,
        attempt,
        items: failed ? [] : items.filter((item) => item.count > 0),
        error: failed ? "Gagal memuat antrean admin. Coba lagi." : "",
      });
    };

    load();
    window.addEventListener("admin:updated", load);
    window.addEventListener("focus", load);
    // Tetap segar jika Realtime belum diaktifkan untuk tabel moderasi.
    const timer = window.setInterval(load, 60000);
    const channel = supabase.channel(`admin-queue:${userId}`);
    for (const table of ["profiles", "listings", "reports"]) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        load,
      );
    }
    channel.subscribe();
    return () => {
      ignore = true;
      window.clearInterval(timer);
      window.removeEventListener("admin:updated", load);
      window.removeEventListener("focus", load);
      supabase.removeChannel(channel);
    };
  }, [userId, isAdmin, attempt]);

  const current = userId && isAdmin && !loading ? result : null;
  const items = current?.items ?? [];
  return {
    items,
    total: items.reduce((sum, item) => sum + item.count, 0),
    loading,
    error: current?.error ?? "",
    refetch,
  };
}
