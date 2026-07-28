// Dashboard

async function loadDashboard() {
    try {
        // Cek user
        const user = await checkAuth();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        console.log('User authenticated:', user.email);
        
        if (!window.supabase) {
            throw new Error('Supabase not initialized');
        }
        
        // Ambil data requests
        const { data: requests, error } = await window.supabase
            .from('requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching requests:', error);
            // Jika tabel belum ada, tampilkan pesan
            if (error.code === '42P01') {
                showToast('Tabel requests belum dibuat di Supabase', 'error');
                document.getElementById('recentRequests').innerHTML = `
                    <div style="text-align:center;padding:20px;color:#6B7280;">
                        <i class="fas fa-database"></i>
                        <p>Tabel requests belum dibuat. Silakan buat di Supabase.</p>
                    </div>
                `;
                return;
            }
            throw error;
        }
        
        // Update stats
        const total = requests?.length || 0;
        const pending = requests?.filter(r => r.status === 'Pending').length || 0;
        const approved = requests?.filter(r => r.status === 'Approved').length || 0;
        const rejected = requests?.filter(r => r.status === 'Rejected').length || 0;
        
        document.getElementById('totalRequests').textContent = total;
        document.getElementById('pendingRequests').textContent = pending;
        document.getElementById('approvedRequests').textContent = approved;
        document.getElementById('rejectedRequests').textContent = rejected;
        document.getElementById('notifCount').textContent = pending;
        
        // Show recent
        showRecent(requests?.slice(0, 5) || []);
        
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

function showRecent(requests) {
    const container = document.getElementById('recentRequests');
    if (!container) return;
    
    if (!requests || requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Belum ada permintaan</p>
                <a href="request.html" class="btn-primary" style="margin-top:10px;display:inline-block;">
                    <i class="fas fa-plus"></i> Buat Request
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requests.map(req => `
        <div class="request-item">
            <div class="request-info">
                <div class="request-name">${req.material_name || 'Tanpa Nama'}</div>
                <div class="request-meta">
                    <span>${req.quantity || 0} ${req.unit || ''}</span>
                    <span>${req.supplier || '-'}</span>
                    <span>${formatDate(req.created_at)}</span>
                </div>
            </div>
            <span class="request-status status-${(req.status || 'pending').toLowerCase()}">${req.status || 'Pending'}</span>
        </div>
    `).join('');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID');
    } catch {
        return dateString;
    }
}

// Load saat halaman siap
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadDashboard, 500);
});
