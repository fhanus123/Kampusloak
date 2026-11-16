import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { fetchNames } from "../lib/sellers";
import { watchRealtime } from "../lib/watchRealtime";

export function useAdminReports(status) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const refetch = useCallback(() => setAttempt((n) => n + 1), []);
  const loading = result?.status !== status || result?.attempt !== attempt;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      const { data, error: queryError } = await supabase
        .from("reports")
        .select(
          "id, reason, status, created_at, reporter_id, listings(id, title, status)",
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (ignore) return;
      const names = queryError
        ? {}
        : await fetchNames((data ?? []).map((r) => r.reporter_id));
      if (!ignore) {
        setResult({
          status,
          attempt,
          reports: (data ?? []).map((r) => ({
            ...r,
            reporterName: names[r.reporter_id] ?? "Pengguna",
          })),
          error: queryError ? "Gagal memuat laporan." : "",
        });
      }
    };

    load();
    const stopWatching = watchRealtime(
      `admin-reports:${status}`,
      [{ table: "reports" }, { table: "listings" }],
      load,
    );
    return () => {
      ignore = true;
      stopWatching();
    };
  }, [status, attempt]);

  return {
    reports: loading ? [] : result.reports,
    loading,
    error: loading ? "" : result.error,
    refetch,
  };
}
