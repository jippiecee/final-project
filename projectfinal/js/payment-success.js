// ==========================================
// PAYMENT-SUCCESS.JS - FIXED with localStorage
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadSuccessData();
    celebrateSuccess();
});

// Load success data from localStorage (more reliable than sessionStorage)
function loadSuccessData() {
    console.log('🎉 Loading success data...');
    
    const dataStr = localStorage.getItem('completedRegistration');
    
    if (!dataStr) {
        console.log('⚠️ No completed registration found, redirecting...');
        // If no data, redirect to home after a moment
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }

    try {
        const registration = JSON.parse(dataStr);
        console.log('✅ Registration loaded:', registration);
        
        displaySuccessInfo(registration);
        
        // Clear the localStorage after displaying (optional - keep for 5 seconds)
        setTimeout(() => {
            localStorage.removeItem('completedRegistration');
            console.log('🗑️ Completed registration data cleared');
        }, 5000);
    } catch (e) {
        console.error('❌ Error loading success data:', e);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
}

// Display success information
function displaySuccessInfo(registration) {
    console.log('📊 Displaying registration info...');
    
    // Registration ID
    document.getElementById('registrationId').textContent = registration.registrationId || '-';
    
    // Email
    document.getElementById('userEmail').textContent = registration.email || '-';
    
    // Event Title
    document.getElementById('eventTitle').textContent = registration.eventTitle || '-';
    
    // Event Date
    const eventDate = formatDateLong(registration.eventDate);
    document.getElementById('eventDate').textContent = eventDate;
    
    // Total Paid - CRITICAL: Use totalPrice from registration
    const total = registration.totalPrice || 0;
    const isFree = parseInt(total) === 0;
    
    console.log('💰 Total paid:', total);
    
    document.getElementById('totalPaid').textContent = isFree ? 'FREE' : `Rp ${formatPrice(total)}`;
    
    // Update page title based on payment status
    if (isFree) {
        document.querySelector('.success-title').textContent = 'Registration Complete!';
    }
}

// Celebrate success with confetti (simple version)
function celebrateSuccess() {
    console.log('🎊 Celebrating success!');
    
    // Play success sound if available
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
        audio.volume = 0.3;
        audio.play().catch(() => {
            console.log('🔇 Audio playback not supported');
        });
    } catch (e) {
        console.log('🔇 Audio not available');
    }

    // Add success animations to detail cards
    setTimeout(() => {
        document.querySelectorAll('.detail-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = `bounce 0.5s ease`;
            }, index * 100);
        });
    }, 500);
}

// Format date
function formatDateLong(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Format price
function formatPrice(price) {
    return parseInt(price).toLocaleString('id-ID');
}