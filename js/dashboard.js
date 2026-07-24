// Dashboard functionality

async function loadDashboard() {
    const user = await checkAuth();
    if (!user) return;
    
    try {
        // Get all requests for this user
        const { data: requests, error } = await supabase
            .from('requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Update stats
        updateStats(requests);
        
        // Show recent requests (last 5)
        showRecentRequests(requests.slice(0, 5));
        
    } catch (error) {
        showToast('Error loading dashboard: ' + error.message, 'error');
    }
}

function updateStats(requests) {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    
    document.getElementById('totalRequests').textContent = total;
    document.getElementById('pendingRequests').textContent = pending;
    document.getElementById('approvedRequests').textContent = approved;
    document.getElementById('rejectedRequests').textContent = rejected;
    document.getElementById('notifCount').textContent = pending;
}

function showRecentRequests(requests) {
    const container = document.getElementById('recentRequests');
    
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Belum ada permintaan</p>
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
    // Implement view detail modal or page
    showToast('Detail permintaan #' + id, 'info');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' menit lalu';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' jam lalu';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' hari lalu';
    
    return date.toLocaleDateString('id-ID');
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);
