import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useProfilesByStatus } from "../../hooks/useProfilesByStatus";
import VerificationCard from "../../components/admin/VerificationCard";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";

const TABS = [
  { value: "pending", label: "Menunggu" },
  { value: "verified", label: "Terverifikasi" },
  { value: "rejected", label: "Ditolak" },
];

export default function Verifications() {
  const [status, setStatus] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const { profiles, loading, error, refetch } = useProfilesByStatus(status);

  const run = async (id, action) => {
    setBusyId(id);
    setActionError("");
    const { error: rpcError } = await action();
    setBusyId(null);
    if (rpcError) {
      setActionError(rpcError.message);
      return;
    }
    refetch();
  };

  const handleReview = (id, decision, reason) =>
    run(id, () =>
      supabase.rpc("review_verification", {
        p_user_id: id,
        p_decision: decision,
        p_reason: reason ?? null,
      }),
    );

  const handleDelete = (id) =>
    run(id, () => supabase.rpc("admin_delete_user", { target: id }));

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Verifikasi akun</h1>

      <div className="flex gap-2" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              status === tab.value
                ? "bg-nav-sub text-white"
                : "bg-white hover:bg-mint/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p role="alert" className="rounded-lg bg-gold/40 p-3 text-sm">
          {actionError}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : profiles.length === 0 ? (
        <EmptyState
          title="Tidak ada akun"
          description="Belum ada akun pada status ini."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {profiles.map((p) => (
            <VerificationCard
              key={p.id}
              profile={p}
              status={status}
              busy={busyId === p.id}
              onReview={handleReview}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
