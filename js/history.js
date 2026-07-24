// History page functionality

let currentPage = 0;
const pageSize = 20;
let allRequests = [];
let filteredRequests = [];

document.addEventListener('DOMContentLoaded', async function() {
    await loadHistory();
    
    // Filter listeners
    const filterStatus = document.getElementById('filterStatus');
    const searchInput = document.getElementById('searchHistory');
    
    if (filterStatus) {
        filterStatus.addEventListener('change', applyFilters);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMore);
    }
});

async function loadHistory() {
    const user = await checkAuth();
    if (!user) return;
    
    try {
        const { data: requests, error } = await supabase
            .from('requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allRequests = requests;
        filteredRequests = [...allRequests];
        currentPage = 0;
        
        renderHistory();
        
    } catch (error) {
        showToast('Error loading history: ' + error.message, 'error');
    }
}

function applyFilters() {
    const status = document.getElementById('filterStatus').value;
    const search = document.getElementById('searchHistory').value.toLowerCase().trim();
    
    filteredRequests = allRequests.filter(req => {
        // Status filter
        if (status !== 'all' && req.status !== status) return false;
        
        // Search filter
        if (search) {
            const name = req.material_name.toLowerCase();
            const supplier = req.supplier.toLowerCase();
            if (!name.includes(search) && !supplier.includes(search)) return false;
        }
        
        return true;
    });
    
    currentPage = 0;
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyList');
    const emptyEl = document.getElementById('historyEmpty');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!container) return;
    
    const start = 0;
    const end = (currentPage + 1) * pageSize;
    const displayRequests = filteredRequests.slice(start, end);
    
    if (displayRequests.length === 0) {
        container.innerHTML = '';
        emptyEl.style.display = 'block';
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    emptyEl.style.display = 'none';
    
    container.innerHTML = displayRequests.map(req => `
        <div class="history-item" onclick="viewRequest('${req.id}')">
            <div class="request-name">${escapeHtml(req.material_name)}</div>
            <div class="request-details">
                <span><i class="fas fa-tag"></i> ${req.material_type}</span>
                <span><i class="fas fa-weight-hanging"></i> ${req.quantity} ${req.unit}</span>
                <span><i class="fas fa-building"></i> ${escapeHtml(req.supplier)}</span>
                <span><i class="fas fa-flag"></i> ${req.priority}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(req.created_at)}</span>
            </div>
            <span class="request-status status-${req.status.toLowerCase()}">${req.status}</span>
            ${req.notes ? `<div class="request-notes"><i class="fas fa-pen"></i> ${escapeHtml(req.notes)}</div>` : ''}
        </div>
    `).join('');
    
    // Show/hide load more button
    if (filteredRequests.length > displayRequests.length) {
        loadMoreBtn.style.display = 'inline-block';
        loadMoreBtn.textContent = `Load More (${displayRequests.length}/${filteredRequests.length})`;
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

function loadMore() {
    currentPage++;
    renderHistory();
}

function viewRequest(id) {
    // Find and show request detail
    const req = allRequests.find(r => r.id === id);
    if (req) {
        showToast(
            `${req.material_name} - ${req.quantity} ${req.unit}\nStatus: ${req.status}`,
            'info'
        );
    }
}
