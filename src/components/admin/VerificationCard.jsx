import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function VerificationCard({
  profile,
  status,
  busy,
  onReview,
  onDelete,
}) {
  const [proofUrl, setProofUrl] = useState("");
  const [proofError, setProofError] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const {
    id,
    full_name,
    nim,
    email,
    student_status,
    proof_url,
    rejection_reason,
    created_at,
  } = profile;
  const isPdf = proof_url?.toLowerCase().endsWith(".pdf");

  const showProof = async () => {
    setProofError("");
    const { data, error } = await supabase.storage
      .from("student-proofs")
      .createSignedUrl(proof_url, 60);
    if (error) {
      setProofError("Gagal membuka bukti.");
      return;
    }
    setProofUrl(data.signedUrl);
  };

  const submitReject = () => {
    if (reason.trim().length < 5) {
      setReasonError("Alasan minimal 5 karakter");
      return;
    }
    onReview(id, "rejected", reason.trim());
  };

  return (
    <article className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-bold">{full_name}</h3>
          <p className="text-sm">NIM: {nim ?? "-"}</p>
          <p className="text-sm text-ink/70">{email}</p>
        </div>
        <div className="text-right text-xs text-ink/60">
          <Badge>
            {student_status === "alumni" ? "Alumni" : "Mahasiswa aktif"}
          </Badge>
          <p className="mt-1">
            Daftar {new Date(created_at).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {status === "rejected" && rejection_reason && (
        <p className="rounded-lg bg-red-50 p-2 text-sm">
          Alasan penolakan: {rejection_reason}
        </p>
      )}

      {proof_url ? (
        <div>
          {!proofUrl ? (
            <Button variant="outline" onClick={showProof}>
              Lihat bukti
            </Button>
          ) : isPdf ? (
            <a
              href={proofUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-nav-sub underline"
            >
              Buka PDF bukti
            </a>
          ) : (
            <img
              src={proofUrl}
              alt={`Bukti ${full_name}`}
              className="max-h-72 rounded-lg border border-ink/10"
            />
          )}
          {proofError && (
            <p className="mt-1 text-xs text-red-600">{proofError}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink/60">Belum mengunggah bukti.</p>
      )}

      {rejecting && (
        <div>
          <label
            htmlFor={`reason-${id}`}
            className="mb-1 block text-sm font-semibold"
          >
            Alasan penolakan
          </label>
          <textarea
            id={`reason-${id}`}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: NIM pada KTM tidak terbaca jelas"
            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
          {reasonError && (
            <p className="mt-1 text-xs text-red-600">{reasonError}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {status !== "verified" && (
          <Button loading={busy} onClick={() => onReview(id, "verified")}>
            Setujui
          </Button>
        )}
        {status !== "rejected" && !rejecting && (
          <Button
            variant="outline"
            loading={busy}
            onClick={() => setRejecting(true)}
          >
            Tolak
          </Button>
        )}
        {rejecting && (
          <>
            <Button variant="outline" loading={busy} onClick={submitReject}>
              Kirim penolakan
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRejecting(false);
                setReasonError("");
              }}
            >
              Batal
            </Button>
          </>
        )}
        <Button
          variant="outline"
          loading={busy}
          className="ml-auto text-red-700"
          onClick={() => {
            if (
              window.confirm(`Hapus akun ${full_name} beserta semua datanya?`)
            )
              onDelete(id);
          }}
        >
          Hapus akun
        </Button>
      </div>
    </article>
  );
}
