import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/auth";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";

export default function Login() {
  const { signIn } = useAuth();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError("");
    const { error } = await signIn(values);
    if (error) {
      setServerError(
        error.message.toLowerCase().includes("email not confirmed")
          ? "Email belum dikonfirmasi. Cek kotak masuk Anda."
          : "Email atau password salah.",
      );
    }
  };

  return (
    <div className="mx-auto my-10 max-w-md rounded-xl bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold">Masuk</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          id="identifier"
          label="Username atau email"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register("identifier")}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="text-right text-sm">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-nav-sub "
          >
            Lupa sandi?
          </Link>
        </div>

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
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        Belum punya akun?{" "}
        <Link to="/register" className="font-semibold text-nav-sub underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}
