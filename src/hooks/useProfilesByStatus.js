import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useProfilesByStatus(status) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const refetch = useCallback(() => setAttempt((value) => value + 1), []);
  const loading = result?.status !== status || result?.attempt !== attempt;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, nim, email, student_status, proof_url, rejection_reason, created_at",
        )
        .eq("role", "user")
        .eq("verification_status", status)
        .order("created_at", { ascending: false });

      if (!ignore) {
        setResult({
          status,
          attempt,
          profiles: data ?? [],
          error: queryError ? "Gagal memuat daftar akun." : "",
        });
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [status, attempt]);

  return {
    profiles: loading ? [] : result.profiles,
    loading,
    error: loading ? "" : result.error,
    refetch,
  };
}
