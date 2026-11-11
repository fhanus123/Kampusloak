import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema } from "../schemas/auth";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async ({ email }) => {
    setServerError("");
    const { error } = await requestPasswordReset(email);
    if (error) {
      setServerError(
        "Gagal mengirim email. Tunggu beberapa menit lalu coba lagi.",
      );
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-xl font-bold">Cek email Anda</h1>
        <p className="mt-2 text-sm">
          Jika email terdaftar, tautan untuk mengatur ulang sandi sudah dikirim.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block font-semibold text-nav-sub underline"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto my-10 max-w-md rounded-xl bg-white p-8 shadow">
      <h1 className="mb-1 text-2xl font-bold">Lupa sandi</h1>
      <p className="mb-6 text-sm text-ink/70">
        Masukkan email akun Anda. Kami kirim tautan untuk membuat sandi baru.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {serverError && (
          <p role="alert" className="rounded-lg bg-gold/40 p-3 text-sm">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          variant="cta"
          className="w-full"
          loading={isSubmitting}
        >
          {isSubmitting ? "Mengirim..." : "Kirim tautan"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-nav-sub underline">
          Kembali ke masuk
        </Link>
      </p>
    </div>
  );
}
