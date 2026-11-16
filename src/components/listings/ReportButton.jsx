import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag } from "lucide-react";
import { reportSchema } from "../../schemas/report";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { watchRealtime } from "../../lib/watchRealtime";
import Button from "../ui/Button";

export default function ReportButton({ listingId }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [open, setOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);
  const [checking, setChecking] = useState(true);
  const [lookupError, setLookupError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (!userId) return;
    let ignore = false;

    const load = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("status")
        .eq("listing_id", listingId)
        .eq("reporter_id", userId)
        .maybeSingle();
      if (ignore) return;
      setChecking(false);
      setLookupError(error ? "Gagal memeriksa status laporan." : "");
      if (!error) setReportStatus(data?.status ?? null);
    };

    load();
    const stopWatching = watchRealtime(
      `listing-report:${userId}:${listingId}`,
      [{ table: "reports", filter: `reporter_id=eq.${userId}` }],
      load,
    );
    return () => {
      ignore = true;
      stopWatching();
    };
  }, [userId, listingId, attempt]);

  const onSubmit = async ({ reason }) => {
    setServerError("");
    const { error } = await supabase
      .from("reports")
      .insert({ listing_id: listingId, reporter_id: userId, reason });

    if (error) {
      setServerError(
        error.code === "23505"
          ? "Anda sudah melaporkan barang ini."
          : "Gagal mengirim laporan. Coba lagi.",
      );
      return;
    }
    reset();
    setReportStatus("open");
  };

  const statusMessages = {
    open: "Laporan terkirim. Admin akan meninjaunya.",
    reviewed: "Laporan ini sudah ditindak oleh admin.",
    dismissed: "Laporan ini sudah ditinjau oleh admin.",
  };

  if (!userId) return null;

  if (checking) {
    return (
      <p role="status" className="text-sm text-ink/60">
        Memeriksa status laporan...
      </p>
    );
  }

  if (lookupError) {
    return (
      <div>
        <p role="alert" className="text-sm text-red-700">
          {lookupError}
        </p>
        <Button
          variant="outline"
          className="mt-1"
          onClick={() => {
            setChecking(true);
            setAttempt((value) => value + 1);
          }}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  if (reportStatus) {
    return (
      <p className="rounded-lg bg-mint/40 p-3 text-sm">
        {statusMessages[reportStatus] ?? "Laporan Anda sudah tercatat."}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-ink/60 hover:text-red-700"
      >
        <Flag className="h-3.5 w-3.5" /> Laporkan barang ini
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
      <label htmlFor="reason" className="block text-sm font-semibold">
        Alasan laporan
      </label>
      <textarea
        id="reason"
        rows={3}
        placeholder="Contoh: Penjual meminta transfer di muka lalu menghilang"
        className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
        {...register("reason")}
      />
      {errors.reason && (
        <p className="text-xs text-red-600">{errors.reason.message}</p>
      )}
      {serverError && (
        <p role="alert" className="text-xs text-red-600">
          {serverError}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim laporan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Batal
        </Button>
      </div>
    </form>
  );
}
