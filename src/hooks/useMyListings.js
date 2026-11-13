import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export function useMyListings() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const refetch = useCallback(() => setAttempt((value) => value + 1), []);
  const loading =
    Boolean(userId) &&
    (result?.userId !== userId || result?.attempt !== attempt);

  useEffect(() => {
    if (!userId) return;
    let ignore = false;

    const load = async () => {
      const { data, error: queryError } = await supabase
        .from("listings")
        .select(
          "id, title, price, quantity, image_urls, status, rejection_reason, created_at, categories(name)",
        )
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });

      if (!ignore) {
        setResult({
          userId,
          attempt,
          listings: data ?? [],
          error: queryError ? "Gagal memuat barang Anda." : "",
        });
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [userId, attempt]);

  const current = userId && !loading ? result : null;
  return {
    listings: current?.listings ?? [],
    loading,
    error: current?.error ?? "",
    refetch,
  };
}
