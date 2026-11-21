# KampusLoak

Marketplace barang bekas khusus mahasiswa dan alumni UNSRI, dengan penjual terverifikasi KTM, nego lewat chat realtime, dan ulasan antar pengguna.

**Demo:** https://kampusloak.vercel.app/

## Masalah dan solusi

**Masalah.** Mahasiswa UNSRI biasa jual-beli barang bekas (buku, elektronik, perabot kos) lewat grup chat dan marketplace umum. Di sana penipuan sulit dilacak, penjual tidak terbukti sesama mahasiswa, dan platform besar membingungkan karena penuh promo.

**Solusi.** KampusLoak membatasi penjual pada mahasiswa dan alumni yang diverifikasi admin lewat KTM, menyediakan chat nego, ulasan dua arah berdasarkan transaksi, dan laporan penipuan. Antarmuka dibuat sederhana, terinspirasi Amazon, agar beban kognitif rendah.

## Fitur

**Pengguna**
- Daftar, masuk (username atau email), lupa sandi lewat email
- Verifikasi akun dengan unggah KTM
- Jelajah, cari, filter (kategori, harga, kondisi), urutkan
- Posting dan kelola barang dengan foto dan jumlah unit
- Chat realtime pembeli dan penjual untuk nego
- Catat kesepakatan, konfirmasi penerimaan, ulasan bintang dua arah
- Simpan barang (favorit) dan notifikasi realtime
- Profil publik dengan rating dan ulasan
- Laporkan barang

**Admin**
- Setujui atau tolak akun dan barang (dengan alasan)
- Tindak laporan penipuan
- Kelola kategori

## Tech stack

React (Vite), Tailwind CSS v4, Supabase (Auth, Postgres, RLS, Storage, Realtime), React Router, React Hook Form + Zod, lucide-react. Deploy: Vercel.

## Struktur folder

```
src/
  components/   layout, listings, chat, reviews, admin, ui
  context/      AuthProvider
  hooks/        useAuth, useChat, useListings, ...
  lib/          supabaseClient, format, storage, sellers
  pages/        Home, Search, ListingDetail, Chat, Dashboard, admin/*
  routes/       ProtectedRoute, PublicOnlyRoute, AdminRoute
  schemas/      validasi Zod
supabase/
  schema.sql    DDL lengkap
```

## Cara menjalankan

### Prasyarat
- Node.js 20.19+ atau 22.12+ (dibutuhkan Vite 8)
- Akun Supabase (gratis) dan Git

### 1. Clone dan instal
```bash
git clone https://github.com/USERNAME/Kampusloak.git
cd Kampusloak
npm install
```

### 2. Siapkan Supabase
1. Buat project di supabase.com.
2. Buka **SQL Editor**, tempel isi `supabase/schema.sql`, lalu **Run**.
3. Buka **Authentication, Sign In / Providers, Email** dan matikan **Confirm email** untuk uji coba lokal.
4. Di **Authentication, URL Configuration**, isi Site URL `http://localhost:5173` dan tambahkan `http://localhost:5173/reset-password` ke Redirect URLs.

### 3. Environment
Salin `.env.example` menjadi `.env.local`, lalu isi dari **Project Settings, API**:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Jangan pernah memakai `service_role` key di frontend.

### 4. Jalankan
```bash
npm run dev
```
Buka http://localhost:5173. Perintah lain: `npm run build`, `npm run preview`, `npm run lint`.

### 5. Buat akun admin pertama
Daftar lewat aplikasi, lalu jalankan di SQL Editor:
```sql
update public.profiles
set role = 'admin', verification_status = 'verified', verified_at = now()
where email = 'EMAIL-ANDA';
```

## Alur penggunaan

1. Daftar lalu unggah KTM di menu Verifikasi akun
2. Admin menyetujui di `/admin`
3. Penjual posting barang, admin menyetujui, barang tayang
4. Pembeli membuka barang, menekan **Ajukan Penawaran**, lalu nego lewat chat
5. Penjual mencatat kesepakatan, pembeli mengonfirmasi penerimaan
6. Keduanya saling memberi ulasan, tampil di profil

## Skema database

| Tabel | Fungsi |
|---|---|
| profiles | Data pengguna, role, status verifikasi (1:1 dengan auth.users) |
| categories | Kategori barang |
| listings | Barang dijual |
| conversations, messages | Chat nego |
| transactions | Catatan kesepakatan dua pihak |
| reviews | Ulasan antar pengguna |
| reports | Laporan penipuan |
| notifications | Notifikasi pengguna |
| favorites | Barang tersimpan |

Relasi: `profiles` 1:N `listings`, `listings` 1:N `conversations`, `conversations` 1:N `messages`, `listings` 1:N `transactions`, `transactions` 1:N `reviews`, `categories` 1:N `listings`.

DDL lengkap: [`supabase/schema.sql`](supabase/schema.sql). Penyimpanan file: bucket `listing-images` (publik) dan `student-proofs` (privat).

## Keamanan

- RLS aktif di semua tabel, kebijakan dibatasi ke role `authenticated` kecuali data publik
- Kolom sensitif (`role`, status verifikasi) dilindungi trigger, dan perubahannya hanya lewat fungsi resmi
- Aksi penting (verifikasi, transaksi, ulasan) lewat fungsi `security definer`
- Nama publik diambil lewat fungsi per id, bukan view terbuka
- Frontend hanya memakai anon key

## Keterbatasan dan roadmap

- Nomor HP hanya divalidasi formatnya (OTP WhatsApp direncanakan)
- Transaksi COD tidak bisa dibuktikan sistem, jadi dilindungi konfirmasi dua pihak dan moderasi admin
- Email bawaan Supabase punya batas kirim, SMTP sendiri direncanakan

## Pembuat

NAMA ANDA, NIM, Final Project Web Programming HMIF UNSRI 2026
