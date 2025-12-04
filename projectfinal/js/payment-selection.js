// ==========================================
// PAYMENT-SELECTION.JS - FIXED HARGA PROBLEM
// ==========================================

let registrationData = null;
let selectedMethod = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('💳 Payment Selection loaded');
    loadRegistrationData();
});

// Load registration data - FIXED
function loadRegistrationData() {
    console.log('🔍 Loading registration data...');
    
    // FIX 1: Cek dulu di localStorage
    const dataStr = localStorage.getItem('pendingRegistration');
    
    console.log('📦 Data from localStorage:', dataStr ? 'Found' : 'Not found');
    
    if (!dataStr) {
        showError('No registration data found. Please start over.', true);
        return;
    }

    try {
        registrationData = JSON.parse(dataStr);
        console.log('✅ Registration data parsed:', registrationData);
        
        // FIX 2: Debug harga
        console.log('💰 DEBUG Harga:', {
            pricePerTicket: registrationData.pricePerTicket,
            totalPrice: registrationData.totalPrice,
            eventTitle: registrationData.eventTitle,
            ticketQty: registrationData.ticketQty
        });
        
        displaySummary();
        
    } catch (e) {
        console.error('❌ Error parsing registration data:', e);
        showError('Invalid registration data. Please try again.', true);
    }
}

// Display registration summary - FIXED
function displaySummary() {
    if (!registrationData) {
        console.error('❌ No registration data to display');
        return;
    }

    console.log('📊 Displaying summary...');

    // Update UI
    document.getElementById('summaryEventTitle').textContent = registrationData.eventTitle || '-';
    document.getElementById('summaryName').textContent = registrationData.fullName || '-';
    document.getElementById('summaryEmail').textContent = registrationData.email || '-';
    document.getElementById('summaryTickets').textContent = registrationData.ticketQty || '-';
    
    // FIX 3: Tampilkan harga dengan benar
    const total = registrationData.totalPrice || 0;
    const isFree = parseInt(total) === 0;
    
    console.log('💵 Total to display:', {
        raw: total,
        parsed: parseInt(total),
        isFree: isFree
    });
    
    // Format harga
    const formattedTotal = isFree ? 'FREE' : `Rp ${formatPrice(total)}`;
    document.getElementById('summaryTotal').textContent = formattedTotal;
    
    console.log('✅ Summary updated:', formattedTotal);

    // If event is free, auto-complete registration
    if (isFree) {
        console.log('🆓 Free event detected');
        setTimeout(() => {
            if (confirm('This is a FREE event! Complete registration now?')) {
                completeFreeRegistration();
            }
        }, 1000);
    }
}

// Complete free event registration - FIXED
function completeFreeRegistration() {
    console.log('✅ Completing free registration...');
    
    if (!registrationData) {
        showError('No registration data');
        return;
    }

    // Save registration
    const result = StorageManager.addRegistration(registrationData);
    
    if (result) {
        console.log('💾 Registration saved:', result);
        
        // Store for success page
        localStorage.setItem('completedRegistration', JSON.stringify(result));
        
        // Remove pending data
        localStorage.removeItem('pendingRegistration');
        
        showToast('Registration successful!', 'success');
        
        // Redirect to success page
        setTimeout(() => {
            window.location.href = 'payment-success.html';
        }, 1000);
    } else {
        showToast('Registration failed. You may have already registered.', 'error');
    }
}

// Select payment method
function selectPaymentMethod(method) {
    console.log('💳 Method selected:', method);
    
    // Remove previous selection
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    const selectedCard = document.querySelector(`.payment-method-card[data-method="${method}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }

    // Store selected method
    selectedMethod = method;

    // Enable proceed button
    const proceedBtn = document.getElementById('proceedBtn');
    if (proceedBtn) {
        proceedBtn.disabled = false;
        proceedBtn.classList.remove('btn-disabled');
    }
}

// Proceed to payment - FIXED
function proceedToPayment() {
    if (!selectedMethod) {
        showToast('Please select a payment method first!', 'warning');
        return;
    }

    if (!registrationData) {
        showToast('Registration data not found!', 'error');
        return;
    }

    console.log('➡️ Proceeding to payment...');
    console.log('📋 Registration Data:', registrationData);
    console.log('💳 Payment Method:', selectedMethod);

    // FIX 4: Simpan payment method
    localStorage.setItem('selectedPaymentMethod', selectedMethod);
    
    // Keep registration data
    console.log('💾 Data saved to localStorage');
    
    // Show loading
    showToast('Redirecting to payment...', 'success');
    
    // Redirect
    setTimeout(() => {
        window.location.href = 'event-payment-process.html';
    }, 800);
}

// Format price
function formatPrice(price) {
    const num = parseInt(price) || 0;
    return num.toLocaleString('id-ID');
}

// Show toast notification
function showToast(message, type = 'info') {
    console.log(`💬 ${type}: ${message}`);
    
    // Fallback toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${getToastColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-size: 14px;
        font-weight: 500;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToastColor(type) {
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    return colors[type] || colors.info;
}

// Show error and redirect
function showError(message, redirect = false) {
    console.error('❌ Error:', message);
    showToast(message, 'error');
    
    if (redirect) {
        setTimeout(() => {
            window.location.href = 'event-list.html';
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Make functions globally available
window.selectPaymentMethod = selectPaymentMethod;
window.proceedToPayment = proceedToPayment;