import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetSchema } from "../schemas/auth";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Spinner from "../components/ui/Spinner";

export default function ResetPassword() {
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetSchema) });

  const onSubmit = async ({ password }) => {
    setServerError("");
    const { error } = await updatePassword(password);
    if (error) {
      setServerError(error.message);
      return;
    }
    navigate("/", { replace: true });
  };

  if (loading) return <Spinner fullPage />;

  if (!user) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-xl font-bold">Tautan tidak valid</h1>
        <p className="mt-2 text-sm">
          Tautan sudah kedaluwarsa atau sudah dipakai.
        </p>
        <Link
          to="/forgot-password"
          className="mt-4 inline-block font-semibold text-nav-sub underline"
        >
          Minta tautan baru
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto my-10 max-w-md rounded-xl bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold">Buat sandi baru</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          id="password"
          label="Sandi baru"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />
        <FormField
          id="confirmPassword"
          label="Ulangi sandi baru"
          type="password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
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
          {isSubmitting ? "Menyimpan..." : "Simpan sandi"}
        </Button>
      </form>
    </div>
  );
}
