// ==========================================
// PAYMENT-PROCESS.JS - FIXED with localStorage
// ==========================================

let registrationData = null;
let paymentMethod = null;

document.addEventListener('DOMContentLoaded', function() {
    loadPaymentData();
});

// Load payment data from localStorage (more reliable than sessionStorage)
function loadPaymentData() {
    // Get registration data from localStorage
    const dataStr = localStorage.getItem('pendingRegistration');
    const methodStr = localStorage.getItem('selectedPaymentMethod');
    
    console.log('🔍 Loading payment data...');
    console.log('Data found:', !!dataStr);
    console.log('Method found:', !!methodStr);
    
    if (!dataStr || !methodStr) {
        alert('⚠️ Payment session expired. Please start again.');
        window.location.href = 'event-list.html';
        return;
    }

    try {
        registrationData = JSON.parse(dataStr);
        paymentMethod = methodStr;
        
        console.log('✅ Payment data loaded:', {
            event: registrationData.eventTitle,
            total: registrationData.totalPrice,
            method: paymentMethod
        });
        
        displayPaymentInstructions();
    } catch (e) {
        console.error('❌ Error loading payment data:', e);
        alert('⚠️ Invalid payment data. Please try again.');
        window.location.href = 'event-list.html';
    }
}

// Display payment instructions
function displayPaymentInstructions() {
    if (!registrationData || !paymentMethod) return;

    // CRITICAL: Use totalPrice from registration data
    const total = registrationData.totalPrice || 0;
    
    console.log('💰 Displaying payment for total:', total);

    // Set payment method name
    const methodNames = {
        'dana': 'DANA',
        'gopay': 'GoPay',
        'shopeepay': 'ShopeePay'
    };

    const methodEmojis = {
        'dana': '💙',
        'gopay': '💚',
        'shopeepay': '🧡'
    };

    const methodName = methodNames[paymentMethod] || 'E-Wallet';
    const methodEmoji = methodEmojis[paymentMethod] || '💳';

    // Update UI
    document.getElementById('paymentMethodBadge').innerHTML = `${methodEmoji} ${methodName.toUpperCase()}`;
    document.getElementById('walletName').textContent = methodName;
    document.getElementById('walletName2').textContent = methodName;
    document.getElementById('paymentTotal').textContent = `Rp ${formatPrice(total)}`;

    // Add unique digits for verification (last 2 digits of timestamp)
    const uniqueDigits = Date.now().toString().slice(-2);
    const exactAmount = parseInt(total) + parseInt(uniqueDigits);
    document.getElementById('exactAmount').textContent = `Rp ${formatPrice(exactAmount)}`;

    console.log('💵 Exact amount with unique digits:', exactAmount);

    // Store exact amount for verification
    localStorage.setItem('exactPaymentAmount', exactAmount.toString());
}

// Copy phone number
function copyPhoneNumber() {
    const phoneNumber = '082261628284';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(phoneNumber)
            .then(() => {
                showToast('✅ Phone number copied!');
            })
            .catch(() => {
                fallbackCopy(phoneNumber);
            });
    } else {
        fallbackCopy(phoneNumber);
    }
}

// Copy amount
function copyAmount() {
    const amountText = document.getElementById('exactAmount').textContent;
    const amountNumber = amountText.replace(/[^0-9]/g, '');
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(amountNumber)
            .then(() => {
                showToast('✅ Amount copied!');
            })
            .catch(() => {
                fallbackCopy(amountNumber);
            });
    } else {
        fallbackCopy(amountNumber);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showToast('✅ Copied to clipboard!');
    } catch (err) {
        showToast('❌ Failed to copy');
    }

    document.body.removeChild(textarea);
}

// Confirm payment
function confirmPayment() {
    const confirmMsg = `
🔔 Payment Confirmation

Have you completed the transfer to:
📱 Number: 082261628284
💰 Amount: ${document.getElementById('exactAmount').textContent}

⚠️ Please make sure:
✓ You sent to the correct number
✓ You sent the exact amount shown
✓ Transfer is successful

Click OK to confirm your payment.
    `;

    if (confirm(confirmMsg)) {
        processPaymentConfirmation();
    }
}

// Process payment confirmation
function processPaymentConfirmation() {
    console.log('✅ Processing payment confirmation...');
    
    // Show loading
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        font-size: 1.5rem;
        flex-direction: column;
        gap: 1rem;
    `;
    loadingDiv.innerHTML = `
        <div style="font-size: 4rem;">⏳</div>
        <div>Processing payment...</div>
    `;
    document.body.appendChild(loadingDiv);

    // Simulate payment processing
    setTimeout(() => {
        // Save registration with payment info
        const registrationWithPayment = {
            ...registrationData,
            paymentMethod: paymentMethod,
            paymentAmount: document.getElementById('exactAmount').textContent,
            paymentDate: new Date().toISOString(),
            paymentStatus: 'completed'
        };

        console.log('💾 Saving registration:', registrationWithPayment);

        const result = StorageManager.addRegistration(registrationWithPayment);

        // Remove loading
        document.body.removeChild(loadingDiv);

        if (result) {
            console.log('✅ Registration saved successfully!');
            
            // Store for success page (localStorage for reliability)
            localStorage.setItem('completedRegistration', JSON.stringify(result));
            
            // Clear temporary data
            localStorage.removeItem('pendingRegistration');
            localStorage.removeItem('selectedPaymentMethod');
            localStorage.removeItem('exactPaymentAmount');

            // Show success message
            showToast('✅ Payment confirmed successfully!');

            // Redirect to success page
            setTimeout(() => {
                window.location.href = 'payment-success.html';
            }, 1000);
        } else {
            alert('❌ Registration failed. You may have already registered for this event.');
            window.location.href = 'event-list.html';
        }
    }, 2000);
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: #10B981;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-size: 1rem;
        font-weight: 600;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format price
function formatPrice(price) {
    return parseInt(price).toLocaleString('id-ID');
}

// Make functions globally available
window.copyPhoneNumber = copyPhoneNumber;
window.copyAmount = copyAmount;
window.confirmPayment = confirmPayment;