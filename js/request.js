// Request form functionality

document.addEventListener('DOMContentLoaded', function() {
    const requestForm = document.getElementById('requestForm');
    if (!requestForm) return;
    
    requestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const user = await checkAuth();
        if (!user) return;
        
        const submitBtn = document.getElementById('submitRequest');
        const messageEl = document.getElementById('requestMessage');
        
        // Get form data
        const materialName = document.getElementById('materialName').value.trim();
        const materialType = document.getElementById('materialType').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const unit = document.getElementById('unit').value;
        const supplier = document.getElementById('supplier').value.trim();
        const priority = document.getElementById('priority').value;
        const notes = document.getElementById('notes').value.trim();
        
        // Validate
        if (!materialName) {
            showToast('Nama material harus diisi', 'error');
            return;
        }
        
        if (quantity < 1) {
            showToast('Jumlah minimal 1', 'error');
            return;
        }
        
        // Show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        messageEl.style.display = 'none';
        
        try {
            const requestData = {
                user_id: user.id,
                material_name: materialName,
                material_type: materialType,
                quantity: quantity,
                unit: unit,
                supplier: supplier,
                priority: priority,
                notes: notes,
                status: 'Pending',
                created_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from('requests')
                .insert([requestData])
                .select();
            
            if (error) throw error;
            
            // Success
            messageEl.textContent = '✅ Permintaan berhasil dikirim!';
            messageEl.style.display = 'block';
            messageEl.className = 'success-message';
            
            // Reset form
            requestForm.reset();
            
            showToast('Permintaan berhasil dikirim!', 'success');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'history.html';
            }, 2000);
            
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
            messageEl.textContent = '❌ Gagal mengirim permintaan: ' + error.message;
            messageEl.style.display = 'block';
            messageEl.className = 'error-message';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Request';
        }
    });
    
    // Reset button
    const resetBtn = document.querySelector('.btn-secondary[type="reset"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            document.getElementById('requestMessage').style.display = 'none';
        });
    }
});
