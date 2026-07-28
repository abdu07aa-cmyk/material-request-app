// Auth functions

// Cek apakah user sudah login
async function checkAuth() {
    try {
        if (!window.supabase) {
            console.error('Supabase not initialized');
            return null;
        }
        
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('Session error:', error);
            return null;
        }
        
        if (!session) {
            // Redirect ke login jika tidak di halaman login
            if (!window.location.pathname.includes('login.html') && 
                !window.location.pathname.includes('index.html')) {
                window.location.href = 'login.html';
            }
            return null;
        }
        
        // Update UI
        updateUserUI(session.user);
        return session.user;
        
    } catch (error) {
        console.error('Check auth error:', error);
        return null;
    }
}

// Fungsi Login
async function loginUser(email, password) {
    try {
        if (!window.supabase) {
            throw new Error('Supabase not initialized');
        }
        
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        if (!data.user) {
            throw new Error('User tidak ditemukan');
        }
        
        return { success: true, user: data.user };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Fungsi Logout
async function logoutUser() {
    try {
        if (!window.supabase) {
            throw new Error('Supabase not initialized');
        }
        
        const { error } = await window.supabase.auth.signOut();
        if (error) throw error;
        
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logout: ' + error.message, 'error');
    }
}

// Update UI dengan data user
function updateUserUI(user) {
    if (!user) return;
    
    // Simpan ke localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update greeting
    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) {
        const name = user.user_metadata?.full_name || user.email || 'User';
        greetingEl.textContent = `Selamat datang, ${name}`;
    }
    
    // Update profile
    const nameEl = document.getElementById('profileName');
    if (nameEl) {
        nameEl.textContent = user.user_metadata?.full_name || user.email || 'User';
    }
    
    const emailEl = document.getElementById('profileEmail');
    if (emailEl) {
        emailEl.textContent = user.email || '';
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    
    if (!passwordInput || !toggleIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Isi form demo
function fillDemo() {
    document.getElementById('email').value = 'test@demo.com';
    document.getElementById('password').value = 'password123';
    showToast('🔑 Form diisi dengan akun demo', 'success');
}

// ============ EVENT LISTENERS ============

// Saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    
    // Cek auth
    setTimeout(checkAuth, 500);
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const loginBtn = document.getElementById('loginBtn');
            const loginText = document.getElementById('loginText');
            const loginSpinner = document.getElementById('loginSpinner');
            const errorEl = document.getElementById('loginError');
            const successEl = document.getElementById('loginSuccess');
            
            // Validasi
            if (!email || !password) {
                showError('Email dan password harus diisi!');
                return;
            }
            
            if (password.length < 6) {
                showError('Password minimal 6 karakter!');
                return;
            }
            
            // Show loading
            loginBtn.disabled = true;
            loginText.textContent = 'Login...';
            loginSpinner.style.display = 'inline-block';
            hideError();
            hideSuccess();
            
            // Proses login
            const result = await loginUser(email, password);
            
            // Hide loading
            loginBtn.disabled = false;
            loginText.textContent = 'Login';
            loginSpinner.style.display = 'none';
            
            if (result.success) {
                // Login berhasil
                showSuccess('✅ Login berhasil! Mengalihkan...');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Login gagal
                showError('❌ ' + (result.error || 'Login gagal, coba lagi'));
            }
        });
    }
    
    // Register link
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Fungsi register akan segera tersedia', 'info');
        });
    }
});

// Helper functions untuk error/success
function showError(message) {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

function hideError() {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

function showSuccess(message) {
    const successEl = document.getElementById('loginSuccess');
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
    }
}

function hideSuccess() {
    const successEl = document.getElementById('loginSuccess');
    if (successEl) {
        successEl.style.display = 'none';
    }
}

// Export functions
window.checkAuth = checkAuth;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.togglePassword = togglePassword;
window.fillDemo = fillDemo;
window.showToast = showToast;
