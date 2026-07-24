// Auth functions using Supabase

// Check if user is logged in
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // Redirect to login if not on login page
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }
    
    // Update UI with user info
    updateUserUI(session.user);
    return session.user;
}

// Login function
async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
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
        await supabase.auth.signOut();
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    } catch (error) {
        showToast('Error logging out', 'error');
    }
}

// Register function
async function register(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
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
            await supabase
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
        const name = user.user_metadata?.full_name || user.email;
        greetingEl.textContent = `Selamat datang, ${name}`;
    }
    
    // Update profile page
    const nameEl = document.getElementById('profileName');
    if (nameEl) {
        nameEl.textContent = user.user_metadata?.full_name || user.email;
    }
    
    const emailEl = document.getElementById('profileEmail');
    if (emailEl) {
        emailEl.textContent = user.email;
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

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Check auth on all pages
    await checkAuth();
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const loginText = document.getElementById('loginText');
            const spinner = loginBtn.querySelector('.fa-spinner');
            const errorEl = document.getElementById('loginError');
            
            // Show loading
            loginBtn.disabled = true;
            loginText.textContent = 'Login...';
            spinner.style.display = 'inline-block';
            errorEl.style.display = 'none';
            
            const result = await login(email, password);
            
            if (!result.success) {
                loginBtn.disabled = false;
                loginText.textContent = 'Login';
                spinner.style.display = 'none';
                errorEl.textContent = result.error;
                errorEl.style.display = 'block';
            }
        });
    }
    
    // Register link
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Implement registration modal or page
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
            if (!user) return;
            
            const fullName = document.getElementById('fullName').value;
            const department = document.getElementById('department').value;
            
            try {
                const { error } = await supabase
                    .from('users')
                    .update({ full_name: fullName, department: department })
                    .eq('id', user.id);
                
                if (error) throw error;
                
                // Update user metadata
                await supabase.auth.updateUser({
                    data: { full_name: fullName }
                });
                
                showToast('Profile berhasil diupdate!', 'success');
                updateUserUI(user);
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
    
    // Change password
    const changePasswordBtn = document.getElementById('changePassword');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', async function() {
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword.length < 6) {
                showToast('Password minimal 6 karakter', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showToast('Password tidak cocok', 'error');
                return;
            }
            
            try {
                const { error } = await supabase.auth.updateUser({
                    password: newPassword
                });
                
                if (error) throw error;
                
                showToast('Password berhasil diubah!', 'success');
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } catch (error) {
                showToast(error.message, 'error');
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
                        if (!user) return;
                        
                        // Delete user data
                        await supabase
                            .from('users')
                            .delete()
                            .eq('id', user.id);
                        
                        await supabase.auth.admin.deleteUser(user.id);
                        
                        showToast('Akun berhasil dihapus', 'success');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1500);
                    } catch (error) {
                        showToast(error.message, 'error');
                    }
                }
            }
        });
    }
});
