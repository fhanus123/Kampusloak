import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function VerificationBanner() {
  const { user, profile, isAdmin } = useAuth();
  if (
    !user ||
    !profile ||
    isAdmin ||
    profile.verification_status === "verified"
  )
    return null;

  const needsProof =
    profile.verification_status === "rejected" || !profile.proof_url;
  const text = needsProof
    ? "Akun Anda belum terverifikasi. Unggah KTM agar bisa menjual barang."
    : "Bukti verifikasi Anda sedang diperiksa admin.";

  return (
    <div className="bg-gold text-sm text-ink">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <span>{text}</span>
        <Link to="/verification" className="font-semibold underline">
          {needsProof ? "Verifikasi sekarang" : "Lihat status"}
        </Link>
      </div>
    </div>
  );
}
