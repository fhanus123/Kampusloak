import { supabase } from "./supabaseClient";

const BUCKET = "listing-images";

export async function removeListingImages(urls) {
  const paths = urls.map((url) => url.split(`/${BUCKET}/`)[1]).filter(Boolean);
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
}

export async function uploadListingImages(userId, files) {
  const urls = [];
  for (const file of files) {
    const ext = file.name.split(".").pop().toLowerCase();
    const path = `${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type });
    if (error) {
      await removeListingImages(urls); // bersihkan foto yang sudah terlanjur naik
      throw error;
    }
    urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }
  return urls;
}
