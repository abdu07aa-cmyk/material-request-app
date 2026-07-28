// Auth functions using Supabase

// Check if user is logged in
async function checkAuth() {
    try {
        // Tunggu Supabase client siap
        const client = await getSupabaseClient();
        if (!client) {
            console.error('Supabase client not available');
            return null;
        }
        
        const { data: { session } } = await client.auth.getSession();
        
        if (!session) {
            // Redirect to login if not on login page
            const currentPath = window.location.pathname;
            if (!currentPath.includes('login.html') && 
                !currentPath.includes('index.html') &&
                currentPath !== '/') {
                window.location.href = 'login.html';
            }
            return null;
        }
        
        // Update UI with user info
        updateUserUI(session.user);
        return session.user;
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

// Login function
async function login(email, password) {
    try {
        const client = await getSupabaseClient();
        if (!client) {
            throw new Error('Supabase client not available');
        }
        
        const { data, error } = await client.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Store session
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout function
async function logout() {
    try {
        const client = await getSupabaseClient();
        if (!client) {
            throw new Error('Supabase client not available');
        }
        
        await client.auth.signOut();
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logging out: ' + error.message, 'error');
    }
}

// Register function
async function register(email, password, fullName) {
    try {
        const client = await getSupabaseClient();
        if (!client) {
            throw new Error('Supabase client not available');
        }
        
        const { data, error } = await client.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    department: 'Production'
                }
            }
        });
        
        if (error) throw error;
        
        // Create user profile in database
        if (data.user) {
            await client
                .from('users')
                .insert([
                    { 
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        department: 'Production'
                    }
                ]);
        }
        
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Update user UI
function updateUserUI(user) {
    if (!user) return;
    
    // Update greeting
    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) {
        const name = user.user_metadata?.full_name || user.email || 'User';
        greetingEl.textContent = `Selamat datang, ${name}`;
    }
    
    // Update profile page
    const nameEl = document.getElementById('profileName');
    if (nameEl) {
        nameEl.textContent = user.user_metadata?.full_name || user.email || 'User';
    }
    
    const emailEl = document.getElementById('profileEmail');
    if (emailEl) {
        emailEl.textContent = user.email || '';
    }
    
    const fullNameInput = document.getElementById('fullName');
    if (fullNameInput && user.user_metadata?.full_name) {
        fullNameInput.value = user.user_metadata.full_name;
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    
    if (passwordInput && toggleIcon) {
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
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Tunggu sebentar untuk memastikan Supabase siap
    setTimeout(async function() {
        // Check auth on all pages
        await checkAuth();
    }, 100);
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';
            const loginBtn = document.getElementById('loginBtn');
            const loginText = document.getElementById('loginText');
            const spinner = loginBtn?.querySelector('.fa-spinner');
            const errorEl = document.getElementById('loginError');
            
            // Show loading
            if (loginBtn) loginBtn.disabled = true;
            if (loginText) loginText.textContent = 'Login...';
            if (spinner) spinner.style.display = 'inline-block';
            if (errorEl) {
                errorEl.style.display = 'none';
                errorEl.textContent = '';
            }
            
            const result = await login(email, password);
            
            if (!result.success) {
                if (loginBtn) loginBtn.disabled = false;
                if (loginText) loginText.textContent = 'Login';
                if (spinner) spinner.style.display = 'none';
                if (errorEl) {
                    errorEl.textContent = '❌ ' + (result.error || 'Login gagal, coba lagi');
                    errorEl.style.display = 'block';
                }
                showToast('Login gagal: ' + result.error, 'error');
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
    
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Profile update
    const updateProfileBtn = document.getElementById('updateProfile');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', async function() {
            const user = await checkAuth();
            if (!user) {
                showToast('Silakan login terlebih dahulu', 'error');
                return;
            }
            
            const fullName = document.getElementById('fullName')?.value || '';
            const department = document.getElementById('department')?.value || '';
            
            try {
                const client = await getSupabaseClient();
                if (!client) {
                    throw new Error('Supabase client not available');
                }
                
                const { error } = await client
                    .from('users')
                    .update({ full_name: fullName, department: department })
                    .eq('id', user.id);
                
                if (error) throw error;
                
                // Update user metadata
                await client.auth.updateUser({
                    data: { full_name: fullName }
                });
                
                showToast('Profile berhasil diupdate!', 'success');
                updateUserUI(user);
            } catch (error) {
                showToast('Error: ' + error.message, 'error');
            }
        });
    }
    
    // Change password
    const changePasswordBtn = document.getElementById('changePassword');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', async function() {
            const newPassword = document.getElementById('newPassword')?.value || '';
            const confirmPassword = document.getElementById('confirmPassword')?.value || '';
            
            if (newPassword.length < 6) {
                showToast('Password minimal 6 karakter', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showToast('Password tidak cocok', 'error');
                return;
            }
            
            try {
                const client = await getSupabaseClient();
                if (!client) {
                    throw new Error('Supabase client not available');
                }
                
                const { error } = await client.auth.updateUser({
                    password: newPassword
                });
                
                if (error) throw error;
                
                showToast('Password berhasil diubah!', 'success');
                const newPassInput = document.getElementById('newPassword');
                const confirmPassInput = document.getElementById('confirmPassword');
                if (newPassInput) newPassInput.value = '';
                if (confirmPassInput) confirmPassInput.value = '';
            } catch (error) {
                showToast('Error: ' + error.message, 'error');
            }
        });
    }
    
    // Delete account
    const deleteAccountBtn = document.getElementById('deleteAccount');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async function() {
            if (confirm('Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.')) {
                if (confirm('Konfirmasi lagi: Hapus akun permanen?')) {
                    try {
                        const user = await checkAuth();
                        if (!user) {
                            showToast('Silakan login terlebih dahulu', 'error');
                            return;
                        }
                        
                        const client = await getSupabaseClient();
                        if (!client) {
                            throw new Error('Supabase client not available');
                        }
                        
                        // Delete user data
                        await client
                            .from('users')
                            .delete()
                            .eq('id', user.id);
                        
                        await client.auth.admin.deleteUser(user.id);
                        
                        showToast('Akun berhasil dihapus', 'success');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1500);
                    } catch (error) {
                        showToast('Error: ' + error.message, 'error');
                    }
                }
            }
        });
    }
});

// Export functions
window.checkAuth = checkAuth;
window.login = login;
window.logout = logout;
window.register = register;
window.togglePassword = togglePassword;
window.getSupabaseClient = getSupabaseClient;
