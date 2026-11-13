import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { withSellerNames } from "../lib/sellers";
import { useAuth } from "./useAuth";

export function useSavedListings() {
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

    const load = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from("favorites")
          .select(
            "listing_id, created_at, listings(id, title, price, condition, image_urls, seller_id, status, quantity, categories(name, slug))",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (ignore) return;
        if (queryError) throw queryError;

        const rows = data ?? [];
        const visible = await withSellerNames(
          rows.map((row) => row.listings).filter(Boolean),
        );
        const byId = Object.fromEntries(
          visible.map((listing) => [listing.id, listing]),
        );
        const merged = rows.map(
          (row) =>
            byId[row.listing_id] ?? {
              id: row.listing_id,
              unavailable: true,
            },
        );

        // Barang tersedia di depan, terjual lalu tidak dapat diakses di belakang.
        const rank = (listing) =>
          listing.unavailable ? 2 : listing.status === "sold" ? 1 : 0;
        const listings = merged.sort((a, b) => rank(a) - rank(b));
        if (!ignore) {
          setResult({ userId, attempt, listings, error: "" });
        }
      } catch {
        if (!ignore) {
          setResult({
            userId,
            attempt,
            listings: [],
            error: "Gagal memuat barang tersimpan.",
          });
        }
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [userId, attempt]);

  const remove = async (listingId) => {
    if (!userId) return { error: { message: "Silakan masuk kembali." } };
    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", listingId);
    if (!deleteError) {
      setResult((prev) =>
        prev?.userId === userId
          ? {
              ...prev,
              listings: prev.listings.filter(
                (listing) => listing.id !== listingId,
              ),
            }
          : prev,
      );
    }
    return { error: deleteError };
  };

  const current = userId && !loading ? result : null;
  return {
    listings: current?.listings ?? [],
    loading,
    error: current?.error ?? "",
    refetch,
    remove,
  };
}
