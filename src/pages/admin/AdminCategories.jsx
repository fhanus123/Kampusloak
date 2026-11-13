import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "../../schemas/category";
import { supabase } from "../../lib/supabaseClient";
import { slugify } from "../../lib/format";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminCategories() {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const load = useCallback(() => setAttempt((value) => value + 1), []);
  const loading = result?.attempt !== attempt;
  const categories = loading ? [] : result.categories;
  const error = loading ? "" : result.error;
  const [editing, setEditing] = useState(null);
  const [serverError, setServerError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    let ignore = false;

    const fetchCategories = async () => {
      const { data, error: queryError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (!ignore) {
        setResult({
          attempt,
          categories: data ?? [],
          error: queryError ? "Gagal memuat kategori." : "",
        });
      }
    };

    fetchCategories();
    return () => {
      ignore = true;
    };
  }, [attempt]);

  const startEdit = (category) => {
    if (isSubmitting || deletingId !== null) return;
    setEditing(category);
    reset({ name: category.name });
    setServerError("");
  };

  const cancelEdit = () => {
    if (isSubmitting || deletingId !== null) return;
    setEditing(null);
    reset({ name: "" });
    setServerError("");
  };

  const onSubmit = async ({ name }) => {
    if (deletingId !== null) return;
    setServerError("");
    const result = editing
      ? await supabase.from("categories").update({ name }).eq("id", editing.id)
      : await supabase
          .from("categories")
          .insert({ name, slug: slugify(name) })
          .select()
          .single();

    if (result.error) {
      setServerError(
        result.error.code === "23505"
          ? "Nama kategori sudah ada."
          : "Gagal menyimpan kategori. Coba lagi.",
      );
      return;
    }
    setEditing(null);
    reset({ name: "" });
    window.dispatchEvent(new Event("admin:updated"));
    load();
  };

  const handleDelete = async (category) => {
    if (isSubmitting || deletingId !== null || editing?.id === category.id)
      return;
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;
    setDeletingId(category.id);
    setServerError("");
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);
    setDeletingId(null);
    if (deleteError) {
      setServerError(
        deleteError.code === "23503"
          ? "Kategori masih dipakai barang, jadi tidak bisa dihapus."
          : "Gagal menghapus kategori.",
      );
      return;
    }
    window.dispatchEvent(new Event("admin:updated"));
    load();
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Kategori</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-wrap items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
        noValidate
      >
        <div className="min-w-56 flex-1">
          <FormField
            id="name"
            label={editing ? `Ubah nama "${editing.name}"` : "Kategori baru"}
            error={errors.name?.message}
            disabled={isSubmitting || deletingId !== null}
            {...register("name")}
          />
        </div>
        <div className="flex gap-2 pt-6">
          <Button
            type="submit"
            variant="cta"
            loading={isSubmitting}
            disabled={isSubmitting || deletingId !== null}
          >
            {editing ? "Simpan" : "Tambah"}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || deletingId !== null}
              onClick={cancelEdit}
            >
              Batal
            </Button>
          )}
        </div>
      </form>

      {serverError && (
        <p role="alert" className="rounded-lg bg-gold/40 p-3 text-sm">
          {serverError}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="Belum ada kategori"
          description="Tambahkan kategori pertama lewat form di atas."
        />
      ) : (
        <ul className="divide-y divide-ink/10 overflow-hidden rounded-xl bg-white shadow-sm">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-ink/60">/{c.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={
                    isSubmitting || deletingId !== null || editing?.id === c.id
                  }
                  onClick={() => startEdit(c)}
                >
                  Ubah
                </Button>
                <Button
                  variant="outline"
                  className="text-red-700"
                  disabled={
                    isSubmitting || deletingId !== null || editing?.id === c.id
                  }
                  onClick={() => handleDelete(c)}
                >
                  Hapus
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
