// Konfigurasi Supabase - Ganti dengan data project Anda
const SUPABASE_URL = 'https://mwktyymqtcybtdyeljcl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13a3R5eW1xdGN5YnRkeWVsamNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODMyMzMsImV4cCI6MjEwMDQ1OTIzM30.TTrwEe-rgOGEyfZo-3YiHuA4AJFJ5pcHVnFPIRfFQ9A';

// Inisialisasi Supabase langsung
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabaseClient;

console.log('✅ Supabase initialized');

// Fungsi Toast
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
