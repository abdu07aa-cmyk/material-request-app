# StokKu

Aplikasi manajemen stok barang yang nyaman dipakai di ponsel. Hanya butuh dua layanan gratis: **Supabase** (database, login, penyimpanan foto) dan **GitHub Pages** (hosting).

Fitur: login per akun, barang dengan foto dan kategori, stok masuk, keluar, dan koreksi (stok opname), peringatan stok menipis dan habis, grafik 7 hari, riwayat mutasi, ekspor Excel (.xlsx), tampilan terang dan gelap otomatis.

## Isi folder

| File | Fungsi |
| --- | --- |
| `index.html` | Seluruh aplikasi (tampilan dan logika) |
| `config.js` | Alamat dan kunci Supabase milik Anda |
| `supabase.sql` | Tabel, aturan keamanan, fungsi mutasi stok, dan tempat penyimpanan foto |

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
- **Excel:** tab Akun, **Ekspor ke Excel**. Berisi sheet Barang (urut per kategori, status berwarna, foto opsional), Riwayat (semua mutasi), dan Per Kategori.

## Catatan

- Penyimpanan gratis Supabase 1 GB. Foto yang sudah dikecilkan sekitar 100 sampai 250 KB, jadi cukup untuk ribuan foto.
- Foto disimpan di bucket privat. Setiap akun hanya bisa melihat foto miliknya.
- Proyek Supabase gratis dijeda bila tidak dipakai sekitar tujuh hari. Klik **Restore** di dashboard bila itu terjadi. Data tidak hilang.
- Menghapus barang juga menghapus riwayat dan fotonya.
