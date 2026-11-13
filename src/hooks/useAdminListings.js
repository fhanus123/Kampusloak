import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { withSellerNames } from "../lib/sellers";

export function useAdminListings(status) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const refetch = useCallback(() => setAttempt((n) => n + 1), []);
  const loading = result?.status !== status || result?.attempt !== attempt;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      const { data, error: queryError } = await supabase
        .from("listings")
        .select(
          "id, title, description, price, image_urls, seller_id, rejection_reason, created_at, categories(name)",
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (ignore) return;
      const listings = queryError ? [] : await withSellerNames(data ?? []);
      if (!ignore) {
        setResult({
          status,
          attempt,
          listings,
          error: queryError ? "Gagal memuat daftar barang." : "",
        });
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [status, attempt]);

  return {
    listings: loading ? [] : result.listings,
    loading,
    error: loading ? "" : result.error,
    refetch,
  };
}
