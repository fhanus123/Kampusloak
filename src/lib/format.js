export const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const CONDITION_LABELS = {
  new: "Baru",
  like_new: "Seperti baru",
  good: "Bagus",
  fair: "Cukup",
};

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const whatsappLink = (phone, text) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
