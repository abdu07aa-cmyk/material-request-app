// Dashboard functionality

async function loadDashboard() {
    try {
        const user = await checkAuth();
        if (!user) {
            console.warn('User not authenticated');
            return;
        }
        
        const client = await getSupabaseClient();
        if (!client) {
            throw new Error('Supabase client not available');
        }
        
        // Get all requests for this user
        const { data: requests, error } = await client
            .from('requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Update stats
        updateStats(requests || []);
        
        // Show recent requests (last 5)
        showRecentRequests((requests || []).slice(0, 5));
        
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('Error loading dashboard: ' + error.message, 'error');
        
        const container = document.getElementById('recentRequests');
        if (container) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:#991B1B;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal load data: ${error.message}</p>
                </div>
            `;
        }
    }
}

function updateStats(requests) {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    
    const totalEl = document.getElementById('totalRequests');
    const pendingEl = document.getElementById('pendingRequests');
    const approvedEl = document.getElementById('approvedRequests');
    const rejectedEl = document.getElementById('rejectedRequests');
    const notifEl = document.getElementById('notifCount');
    
    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (approvedEl) approvedEl.textContent = approved;
    if (rejectedEl) rejectedEl.textContent = rejected;
    if (notifEl) notifEl.textContent = pending;
}

function showRecentRequests(requests) {
    const container = document.getElementById('recentRequests');
    if (!container) return;
    
    if (!requests || requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Belum ada permintaan</p>
                <a href="request.html" class="btn-primary" style="margin-top: 10px;">
                    <i class="fas fa-plus"></i> Buat Request
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requests.map(req => `
        <div class="request-item" onclick="viewRequest('${req.id}')">
            <div class="request-info">
                <div class="request-name">${escapeHtml(req.material_name)}</div>
                <div class="request-meta">
                    <span><i class="fas fa-weight-hanging"></i> ${req.quantity} ${req.unit}</span>
                    <span><i class="fas fa-building"></i> ${escapeHtml(req.supplier)}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(req.created_at)}</span>
                </div>
            </div>
            <span class="request-status status-${req.status.toLowerCase()}">${req.status}</span>
        </div>
    `).join('');
}

function viewRequest(id) {
    showToast('Detail permintaan #' + id.substring(0, 8), 'info');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Baru saja';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' menit lalu';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' jam lalu';
        if (diff < 604800000) return Math.floor(diff / 86400000) + ' hari lalu';
        
        return date.toLocaleDateString('id-ID');
    } catch {
        return dateString;
    }
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadDashboard, 500);
});
