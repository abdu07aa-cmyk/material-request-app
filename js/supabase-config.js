// Konfigurasi Supabase
// Ganti dengan URL dan Anon Key dari project Supabase Anda
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Cek apakah Supabase SDK sudah di-load
let supabaseClient = null;

// Fungsi untuk inisialisasi Supabase
function initSupabase() {
    try {
        // Cek apakah supabase global tersedia
        if (typeof supabase === 'undefined') {
            console.warn('Supabase SDK not loaded yet, trying to load from CDN...');
            
            // Load Supabase SDK secara dinamis jika belum tersedia
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.async = false;
            
            return new Promise((resolve, reject) => {
                script.onload = function() {
                    console.log('✅ Supabase SDK loaded dynamically');
                    try {
                        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                        window.supabase = supabaseClient;
                        console.log('✅ Supabase initialized successfully');
                        resolve(supabaseClient);
                    } catch (err) {
                        reject(err);
                    }
                };
                script.onerror = function() {
                    reject(new Error('Failed to load Supabase SDK'));
                };
                document.head.appendChild(script);
            });
        }
        
        // Supabase sudah tersedia
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabase = supabaseClient;
        console.log('✅ Supabase initialized successfully');
        return Promise.resolve(supabaseClient);
        
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return Promise.reject(error);
    }
}

// Fungsi untuk mendapatkan client Supabase (dengan retry)
async function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient;
    }
    
    try {
        return await initSupabase();
    } catch (error) {
        console.error('Failed to get Supabase client:', error);
        throw error;
    }
}

// Fungsi helper untuk toast notification
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

// Inisialisasi otomatis saat script di-load
(async function() {
    try {
        await initSupabase();
    } catch (error) {
        console.error('Auto-init failed:', error);
        // Tampilkan pesan error di UI
        document.addEventListener('DOMContentLoaded', function() {
            const errorContainer = document.getElementById('supabaseError');
            if (errorContainer) {
                errorContainer.style.display = 'block';
                errorContainer.textContent = '⚠️ Error: ' + error.message;
            }
        });
    }
})();

// Export untuk digunakan di file lain
window.supabase = null; // Akan diisi setelah init
window.initSupabase = initSupabase;
window.getSupabaseClient = getSupabaseClient;
window.showToast = showToast;
