# StokKu

Aplikasi manajemen stok barang yang nyaman dipakai di ponsel. Hanya butuh dua layanan gratis: **Supabase** (database dan login) dan **GitHub Pages** (hosting).

Fitur: login per akun, tambah/ubah/hapus barang, stok masuk, keluar, dan koreksi (hasil stok opname), peringatan stok menipis dan habis, nilai total stok, grafik 7 hari, riwayat mutasi, ekspor CSV, tampilan terang dan gelap otomatis.

## Isi folder

| File | Fungsi |
| --- | --- |
| `index.html` | Seluruh aplikasi (tampilan dan logika) |
| `config.js` | Alamat dan kunci Supabase milik Anda |
| `supabase.sql` | Pembuat tabel, aturan keamanan, dan fungsi mutasi stok |

## Langkah 1: Siapkan Supabase

1. Buat akun di supabase.com, lalu **New project**. Simpan kata sandi database dengan aman.
2. Buka **SQL Editor**, pilih **New query**, tempel seluruh isi `supabase.sql`, lalu klik **Run**.
3. Buka **Project Settings, API**. Salin **Project URL** dan kunci **anon public**.
4. Opsional, agar daftar akun langsung bisa dipakai tanpa email konfirmasi: **Authentication, Providers, Email**, matikan **Confirm email**.

## Langkah 2: Isi `config.js`

```js
window.STOK_CONFIG = {
  SUPABASE_URL: "https://xxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJ..."
};
```

Pakai kunci **anon public**. Jangan pernah memakai kunci `service_role` di sini. Kunci anon aman terlihat publik karena setiap akun hanya bisa membaca dan mengubah datanya sendiri (Row Level Security).

## Langkah 3: Pasang di GitHub Pages

1. Buat repositori baru di GitHub, lalu unggah ketiga file (`index.html`, `config.js`, `supabase.sql`).
2. Buka **Settings, Pages**. Pada **Build and deployment**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
3. Tunggu satu sampai dua menit. Alamat aplikasi: `https://NAMA-GITHUB.github.io/NAMA-REPO/`.
4. Kembali ke Supabase, **Authentication, URL Configuration**. Isi **Site URL** dengan alamat di atas supaya tautan konfirmasi email mengarah ke aplikasi Anda.

## Pasang seperti aplikasi di ponsel

Buka alamat aplikasi di Chrome (Android) lalu pilih menu titik tiga, **Tambahkan ke layar utama**. Di iPhone, buka lewat Safari lalu ketuk Bagikan, **Tambah ke Layar Utama**.

## Catatan

- Proyek Supabase paket gratis dijeda bila tidak dipakai sekitar tujuh hari. Buka dashboard Supabase lalu klik **Restore** bila itu terjadi. Data tidak hilang.
- Stok hanya berubah lewat fungsi `record_movement`, sehingga stok tidak bisa minus dan setiap perubahan selalu tercatat di riwayat.
- Menghapus barang juga menghapus riwayat mutasinya.
