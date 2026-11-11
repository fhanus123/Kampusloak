import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { listingSchema, IMAGE_RULES } from "../../schemas/listing";
import { supabase } from "../../lib/supabaseClient";
import { uploadListingImages, removeListingImages } from "../../lib/storage";
import { CONDITION_LABELS } from "../../lib/format";
import { useAuth } from "../../hooks/useAuth";
import { useCategories } from "../../hooks/useCategories";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

const inputClass =
  "w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand";

export default function ListingForm({ listing }) {
  const isEdit = Boolean(listing);
  const { user } = useAuth();
  const navigate = useNavigate();
  const categories = useCategories();

  const [keptUrls, setKeptUrls] = useState(listing?.image_urls ?? []);
  const [newFiles, setNewFiles] = useState([]);
  const [imageError, setImageError] = useState("");
  const [serverError, setServerError] = useState("");

  const previews = useMemo(
    () => newFiles.map((f) => URL.createObjectURL(f)),
    [newFiles],
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing?.title ?? "",
      description: listing?.description ?? "",
      categoryId: listing?.category_id ?? "",
      price: listing?.price ?? "",
      condition: listing?.condition ?? "good",
    },
  });

  const handlePickFiles = (e) => {
    const picked = [...e.target.files];
    e.target.value = "";
    const { maxCount, maxSize, types } = IMAGE_RULES;

    if (picked.some((f) => !types.includes(f.type))) {
      setImageError("Format foto harus JPG, PNG, atau WEBP");
      return;
    }
    if (picked.some((f) => f.size > maxSize)) {
      setImageError("Ukuran tiap foto maksimal 2 MB");
      return;
    }
    if (keptUrls.length + newFiles.length + picked.length > maxCount) {
      setImageError(`Maksimal ${maxCount} foto`);
      return;
    }
    setImageError("");
    setNewFiles((prev) => [...prev, ...picked]);
  };

  const onSubmit = async ({
    title,
    description,
    categoryId,
    price,
    condition,
  }) => {
    setServerError("");
    if (keptUrls.length + newFiles.length === 0) {
      setImageError("Unggah minimal 1 foto");
      return;
    }

    let uploaded = [];
    try {
      uploaded = await uploadListingImages(user.id, newFiles);
      const payload = {
        title,
        description: description || null,
        category_id: categoryId,
        price,
        condition,
        image_urls: [...keptUrls, ...uploaded],
      };

      if (isEdit) {
        // Barang yang ditolak otomatis diajukan ulang setelah diperbaiki
        if (listing.status === "rejected") payload.status = "pending";
        const { error } = await supabase
          .from("listings")
          .update(payload)
          .eq("id", listing.id);
        if (error) throw error;
        await removeListingImages(
          listing.image_urls.filter((url) => !keptUrls.includes(url)),
        );
      } else {
        const { error } = await supabase
          .from("listings")
          .insert({ ...payload, seller_id: user.id })
          .select()
          .single();
        if (error) throw error;
      }
      navigate("/dashboard");
    } catch {
      await removeListingImages(uploaded);
      setServerError("Gagal menyimpan barang. Coba lagi.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        id="title"
        label="Judul barang"
        error={errors.title?.message}
        {...register("title")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="categoryId"
            className="mb-1 block text-sm font-semibold"
          >
            Kategori
          </label>
          <select
            id="categoryId"
            className={inputClass}
            {...register("categoryId")}
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="condition"
            className="mb-1 block text-sm font-semibold"
          >
            Kondisi
          </label>
          <select
            id="condition"
            className={inputClass}
            {...register("condition")}
          >
            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormField
        id="price"
        label="Harga (Rp)"
        type="number"
        inputMode="numeric"
        error={errors.price?.message}
        {...register("price")}
      />

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-semibold"
        >
          Deskripsi (opsional)
        </label>
        <textarea
          id="description"
          rows={4}
          className={inputClass}
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold">
          Foto ({keptUrls.length + newFiles.length}/{IMAGE_RULES.maxCount})
        </p>
        <div className="flex flex-wrap gap-2">
          {keptUrls.map((url) => (
            <Thumb
              key={url}
              src={url}
              onRemove={() =>
                setKeptUrls((prev) => prev.filter((u) => u !== url))
              }
            />
          ))}
          {previews.map((url, i) => (
            <Thumb
              key={url}
              src={url}
              onRemove={() =>
                setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
          ))}
        </div>
        <input
          type="file"
          multiple
          accept={IMAGE_RULES.types.join(",")}
          onChange={handlePickFiles}
          className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-mint file:px-3 file:py-2 file:font-semibold"
        />
        <p className="mt-1 text-xs text-ink/60">
          JPG, PNG, atau WEBP. Maksimal 2 MB per foto. Foto pe`rtama jadi foto
          utama.
        </p>
        {imageError && (
          <p className="mt-1 text-xs text-red-600">{imageError}</p>
        )}
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
        {isSubmitting
          ? "Menyimpan..."
          : isEdit
            ? "Simpan perubahan"
            : "Kirim untuk disetujui"}
      </Button>
    </form>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-ink/10">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Hapus foto"
        className="absolute right-0.5 top-0.5 rounded-full bg-ink/70 p-0.5 text-white hover:bg-ink"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
