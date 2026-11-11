import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Clock, XCircle } from "lucide-react";
import { proofSchema } from "../schemas/verification";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

export default function Verification() {
  const { user, profile, refreshProfile } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(proofSchema) });

  const onSubmit = async ({ file }) => {
    setServerError("");
    const selected = file[0];
    const ext = selected.name.split(".").pop().toLowerCase();
    const path = `${user.id}/ktm-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("student-proofs")
      .upload(path, selected, { contentType: selected.type });
    if (uploadError) {
      setServerError("Gagal mengunggah file. Coba lagi.");
      return;
    }

    const { error: rpcError } = await supabase.rpc("resubmit_verification", {
      p_proof_path: path,
    });
    if (rpcError) {
      await supabase.storage.from("student-proofs").remove([path]);
      setServerError("Gagal mengajukan verifikasi. Coba lagi.");
      return;
    }

    reset();
    await refreshProfile();
  };

  if (!profile)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const {
    verification_status: status,
    proof_url: proofPath,
    rejection_reason: reason,
  } = profile;
  const waiting = status === "pending" && proofPath;
  const canUpload =
    status === "rejected" || (status === "pending" && !proofPath);

  return (
    <section className="mx-auto max-w-xl space-y-5 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Verifikasi mahasiswa</h1>

      {status === "verified" && (
        <div className="flex items-start gap-3 rounded-lg bg-mint/40 p-4 text-sm">
          <BadgeCheck className="h-5 w-5 shrink-0 text-nav-sub" />
          <p>Akun Anda sudah terverifikasi. Anda bisa memposting barang.</p>
        </div>
      )}

      {waiting && (
        <div className="flex items-start gap-3 rounded-lg bg-gold/40 p-4 text-sm">
          <Clock className="h-5 w-5 shrink-0" />
          <p>
            Bukti Anda sedang diperiksa admin. Anda akan bisa memposting barang
            setelah disetujui.
          </p>
        </div>
      )}

      {status === "rejected" && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm">
          <XCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Verifikasi ditolak</p>
            <p>Alasan: {reason ?? "-"}</p>
          </div>
        </div>
      )}

      {canUpload && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <p className="text-sm text-ink/70">
            Unggah foto Kartu Tanda Mahasiswa (KTM) atau bukti aktif kuliah.
            Pastikan NIM {profile.nim ?? ""} terbaca jelas.
          </p>
          <div>
            <label htmlFor="file" className="mb-1 block text-sm font-semibold">
              File bukti
            </label>
            <input
              id="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-mint file:px-3 file:py-2 file:font-semibold"
              {...register("file")}
            />
            {errors.file && (
              <p className="mt-1 text-xs text-red-600">{errors.file.message}</p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="rounded-lg bg-gold/40 p-3 text-sm">
              {serverError}
            </p>
          )}

          <Button type="submit" variant="cta" loading={isSubmitting}>
            {isSubmitting ? "Mengunggah..." : "Ajukan verifikasi"}
          </Button>
        </form>
      )}
    </section>
  );
}
