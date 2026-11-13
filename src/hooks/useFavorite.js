import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export function useFavorite(listingId) {
  const { user } = useAuth();
  const userId = user?.id;
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let ignore = false;

    const load = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", userId)
        .eq("listing_id", listingId)
        .maybeSingle();
      if (ignore) return;
      setSaved(Boolean(data));
      setLoading(false);
    };
    load();

    return () => {
      ignore = true;
    };
  }, [userId, listingId]);

  const toggle = async () => {
    setBusy(true);
    setError("");
    const result = saved
      ? await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listingId)
      : await supabase
          .from("favorites")
          .insert({ user_id: userId, listing_id: listingId });
    setBusy(false);

    // 23505 = sudah tersimpan (misalnya dari tab lain), anggap berhasil
    if (result.error && result.error.code !== "23505") {
      setError("Gagal memperbarui simpanan. Coba lagi.");
      return;
    }
    setSaved(!saved);
  };

  return { saved, loading, busy, error, toggle };
}
