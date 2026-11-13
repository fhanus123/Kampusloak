import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAdminReports } from "../../hooks/useAdminReports";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";

const TABS = [
  { value: "open", label: "Baru" },
  { value: "reviewed", label: "Ditindak" },
  { value: "dismissed", label: "Diabaikan" },
];

export default function AdminReports() {
  const [status, setStatus] = useState("open");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const { reports, loading, error, refetch } = useAdminReports(status);

  const run = async (id, action) => {
    if (busyId !== null) return;
    setBusyId(id);
    setActionError("");
    const { error: actionErr } = await action();
    setBusyId(null);
    if (actionErr) {
      setActionError(actionErr.message ?? "Aksi gagal. Coba lagi.");
      return;
    }
    window.dispatchEvent(new Event("admin:updated"));
    refetch();
  };

  const setReportStatus = (id, next) =>
    run(id, () =>
      supabase.from("reports").update({ status: next }).eq("id", id),
    );

  const takeDown = (report) => {
    if (busyId !== null) return;
    if (
      !window.confirm(
        "Turunkan barang ini dan tandai laporan sebagai ditindak?",
      )
    )
      return;
    run(report.id, async () => {
      const first = await supabase.rpc("review_listing", {
        p_listing_id: report.listings.id,
        p_decision: "rejected",
        p_reason: "Barang diturunkan admin setelah ada laporan pengguna.",
      });
      if (first.error) return first;
      window.dispatchEvent(new Event("admin:updated"));
      return supabase
        .from("reports")
        .update({ status: "reviewed" })
        .eq("id", report.id);
    });
  };

  const remove = (id) => {
    if (busyId !== null) return;
    if (!window.confirm("Hapus laporan ini?")) return;
    run(id, () => supabase.from("reports").delete().eq("id", id));
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Laporan penipuan</h1>

      <div className="flex gap-2" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={status === tab.value}
            disabled={busyId !== null}
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
      ) : reports.length === 0 ? (
        <EmptyState
          title="Tidak ada laporan"
          description="Belum ada laporan pada status ini."
        />
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => {
            const busy = busyId !== null;
            const canTakeDown = r.listings && r.listings.status === "approved";
            return (
              <li
                key={r.id}
                className="space-y-2 rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  {r.listings ? (
                    <Link
                      to={`/listings/${r.listings.id}`}
                      className="font-bold hover:underline"
                    >
                      {r.listings.title}
                    </Link>
                  ) : (
                    <span className="font-bold">Barang sudah dihapus</span>
                  )}
                  <span className="text-xs text-ink/60">
                    Oleh {r.reporterName} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <p className="whitespace-pre-line rounded-lg bg-page p-3 text-sm">
                  {r.reason}
                </p>

                <div className="flex flex-wrap gap-2">
                  {canTakeDown && status === "open" && (
                    <Button loading={busy} onClick={() => takeDown(r)}>
                      Turunkan barang
                    </Button>
                  )}
                  {status !== "reviewed" && (
                    <Button
                      variant="outline"
                      loading={busy}
                      onClick={() => setReportStatus(r.id, "reviewed")}
                    >
                      Tandai ditindak
                    </Button>
                  )}
                  {status !== "dismissed" && (
                    <Button
                      variant="outline"
                      loading={busy}
                      onClick={() => setReportStatus(r.id, "dismissed")}
                    >
                      Abaikan
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    loading={busy}
                    className="ml-auto text-red-700"
                    onClick={() => remove(r.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
