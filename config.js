// Isi dua nilai ini dari Supabase Dashboard > Project Settings > API.
// Pakai "Project URL" dan kunci "anon public" (BUKAN service_role).
// Kunci anon memang boleh publik karena data dilindungi Row Level Security.
window.STOK_CONFIG = {
  SUPABASE_URL: "GANTI_DENGAN_PROJECT_URL",
  SUPABASE_ANON_KEY: "GANTI_DENGAN_ANON_KEY"
};
