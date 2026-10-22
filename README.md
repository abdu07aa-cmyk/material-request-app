# StokKu

Aplikasi manajemen stok barang yang nyaman dipakai di ponsel. Hanya butuh dua layanan gratis: **Supabase** (database, login, penyimpanan foto) dan **GitHub Pages** (hosting).

Fitur: login per akun, barang dengan foto dan kategori, stok masuk, keluar, dan koreksi (stok opname), peringatan stok menipis dan habis, grafik 7 hari, riwayat mutasi, ekspor Excel (.xlsx), tampilan terang dan gelap otomatis.

## Isi folder

| File | Fungsi |
| --- | --- |
| `index.html` | Seluruh aplikasi (tampilan dan logika) |
| `config.js` | Alamat dan kunci Supabase milik Anda |
| `supabase.sql` | Tabel, aturan keamanan, fungsi mutasi stok, dan tempat penyimpanan foto |
| `manifest.webmanifest` | Data aplikasi untuk layar utama ponsel (nama, warna, ikon) |
| `favicon.svg`, `favicon-32.png` | Logo untuk tab browser dan tampilan di dalam aplikasi |
| `apple-touch-icon.png` | Ikon layar utama iPhone dan iPad |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Ikon layar utama Android |

Unggah semua file ini ke repositori GitHub dalam folder yang sama dengan `index.html`.

## Taruh di layar utama ponsel

- **Android (Chrome):** buka alamat aplikasi, ketuk menu titik tiga, pilih **Instal aplikasi** atau **Tambahkan ke layar utama**.
- **iPhone (Safari):** buka alamat aplikasi, ketuk tombol Bagikan, pilih **Tambah ke Layar Utama**.

Setelah ditambahkan, StokKu terbuka layar penuh seperti aplikasi biasa. Bila ikon lama masih muncul, hapus ikonnya lalu tambahkan lagi.

## Pasang dari awal

1. Buat proyek di supabase.com. Jalankan seluruh isi `supabase.sql` di **SQL Editor** (New query, tempel, Run).
2. Salin **Project URL** dan kunci **anon public** dari Project Settings, API, ke `config.js`. Jangan pakai kunci `service_role`.
3. Di Authentication, Sign In / Providers, matikan **Confirm email** bila ingin daftar langsung bisa masuk.
4. Unggah `index.html`, `config.js`, `supabase.sql` ke repositori GitHub. Aktifkan **Settings, Pages**, branch `main`, folder `/ (root)`.
5. Isi **Site URL** di Authentication, URL Configuration dengan alamat GitHub Pages Anda.

## Memperbarui dari versi sebelumnya

1. Jalankan `supabase.sql` yang baru di SQL Editor (aman diulang). Ini menambah tabel kategori, kolom foto, dan bucket foto, serta memindahkan kategori lama ke tabel baru.
2. Ganti `index.html` di GitHub dengan versi baru. `config.js` tidak perlu diubah.
3. Tunggu satu sampai dua menit, lalu muat ulang paksa (Ctrl+F5).

Kolom harga lama tetap ada di database dan tidak mengganggu. Untuk menghapusnya:

```sql
alter table public.products drop column if exists buy_price, drop column if exists sell_price;
```

## Cara pakai singkat

- **Kategori:** tab Barang, ketuk **Kelola** di deretan kategori. Tambah, ubah nama, atau hapus. Menghapus kategori tidak menghapus barang, hanya membuatnya tanpa kategori.
- **Foto:** saat menambah atau mengubah barang, pilih **Kamera** atau **Galeri**. Foto otomatis dikecilkan (sisi terpanjang 1000 px) agar hemat kuota. Ketuk foto di daftar untuk melihatnya besar.
- **Ukuran:** isi kolom **Ukuran** saat menambah atau mengubah barang (misalnya `1/2 inch`, `10 mm`, `L`). Ukuran tampil di daftar, bisa dicari, dan ikut ke Excel.
- **Peringatan batas minimum:** barang dianggap mencapai batas bila stok sama dengan atau di bawah **Stok minimum** yang Anda isi (isi 0 bila tidak ingin diperingatkan). Peringatan muncul sebagai: lonceng bermerah di pojok atas dengan jumlah barang, kotak peringatan di Beranda, daftar peringatan saat aplikasi dibuka, dan kotak peringatan langsung setelah stok keluar membuat barang mencapai batas. Filter **Perlu restock** di tab Barang menampilkan semuanya.
- **Notifikasi perangkat:** tab Akun, **Aktifkan**. Notifikasi sistem hanya muncul saat aplikasi sedang terbuka. Aplikasi ini tidak memakai server, jadi tidak bisa mengirim notifikasi saat ditutup. Di iPhone, notifikasi dari halaman web umumnya tidak didukung, tetapi lonceng dan kotak peringatan tetap berfungsi.
- **Excel:** tab Akun, **Ekspor ke Excel**. Berisi sheet Barang (urut per kategori, status berwarna, foto opsional), Riwayat (semua mutasi), dan Per Kategori.

## Catatan

- Penyimpanan gratis Supabase 1 GB. Foto yang sudah dikecilkan sekitar 100 sampai 250 KB, jadi cukup untuk ribuan foto.
- Foto disimpan di bucket privat. Setiap akun hanya bisa melihat foto miliknya.
- Proyek Supabase gratis dijeda bila tidak dipakai sekitar tujuh hari. Klik **Restore** di dashboard bila itu terjadi. Data tidak hilang.
- Menghapus barang juga menghapus riwayat dan fotonya.
