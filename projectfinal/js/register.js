// ==========================================
// REGISTER.JS - FIXED UTILS REFERENCE
// ==========================================

let currentEvent = null;
let pricePerTicket = 0;
let isSubmitting = false;

// Fallback jika Utils belum ada
const FallbackUtils = {
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    formatDateLong(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const options = { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    },
    
    formatPrice(price) {
        if (price === undefined || price === null) return '0';
        return parseInt(price).toLocaleString('id-ID');
    },
    
    isDateInPast(dateString) {
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today;
    },
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    isValidPhone(phone) {
        return /^(\+62|62|0)[8-9][0-9]{7,11}$/.test(phone);
    }
};

// Gunakan Utils jika ada, jika tidak gunakan fallback
const useUtils = typeof Utils !== 'undefined' ? Utils : FallbackUtils;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Register.js loaded');
    console.log('📦 Utils available:', typeof Utils !== 'undefined');
    
    loadEventInfo();
    setupForm();
    setupTicketCalculator();
});

// Load event information - FIXED
function loadEventInfo() {
    const eventId = useUtils.getUrlParameter('id');
    console.log('📌 Event ID from URL:', eventId);

    if (!eventId) {
        showError('Event not found!');
        setTimeout(() => {
            window.location.href = 'event-list.html';
        }, 2000);
        return;
    }

    currentEvent = StorageManager.getEventById(eventId);
    console.log('🎯 Current Event:', currentEvent);

    if (!currentEvent) {
        showError('Event not found!');
        setTimeout(() => {
            window.location.href = 'event-list.html';
        }, 2000);
        return;
    }

    // FIX: Parse harga dengan benar
    if (currentEvent.price) {
        const priceStr = String(currentEvent.price);
        pricePerTicket = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    } else {
        pricePerTicket = 0;
    }
    
    console.log('💰 Price Parsed:', {
        raw: currentEvent.price,
        parsed: pricePerTicket
    });

    // Check if event is in the past
    if (useUtils.isDateInPast(currentEvent.date)) {
        if (typeof Modal !== 'undefined') {
            Modal.alert({
                title: 'Event Has Passed',
                message: 'This event has already taken place. Registration is closed.',
                type: 'warning'
            }).then(() => {
                window.location.href = `event-detail.html?id=${eventId}`;
            });
        } else {
            alert('Event has already passed. Registration is closed.');
            window.location.href = `event-detail.html?id=${eventId}`;
        }
        return;
    }

    displayEventInfo(currentEvent);
}

// Display event info in banner - FIXED
function displayEventInfo(event) {
    console.log('🎨 Displaying event info...');
    
    document.getElementById('eventCategory').textContent = event.category;
    document.getElementById('eventTitle').textContent = event.title;
    
    // Gunakan formatDateLong dari Utils atau fallback
    const eventDate = useUtils.formatDateLong(event.date);
    document.getElementById('eventDate').textContent = eventDate;
    
    document.getElementById('eventLocation').textContent = event.location;
    
    // Tampilkan harga
    const isFree = pricePerTicket === 0;
    const priceDisplay = isFree ? 'FREE' : `Rp ${useUtils.formatPrice(pricePerTicket)}`;
    
    console.log('💵 Price Display:', priceDisplay);
    
    document.getElementById('eventPrice').textContent = priceDisplay;
    document.getElementById('pricePerTicket').textContent = isFree ? 'FREE' : `Rp ${useUtils.formatPrice(pricePerTicket)}`;
    
    updateTotalPrice();
}

// Update total price
function updateTotalPrice() {
    const ticketQty = parseInt(document.getElementById('ticketQty').value) || 1;
    const total = pricePerTicket * ticketQty;
    const isFree = total === 0;

    console.log('🧮 Total:', {
        pricePerTicket: pricePerTicket,
        ticketQty: ticketQty,
        total: total
    });

    document.getElementById('totalTickets').textContent = ticketQty;
    document.getElementById('totalPrice').textContent = isFree ? 'FREE' : `Rp ${useUtils.formatPrice(total)}`;
}

// Setup form validation
function setupForm() {
    const form = document.getElementById('registrationForm');
    
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isSubmitting) {
            console.log('⚠️ Already submitting...');
            return;
        }
        
        if (!validateForm()) {
            return;
        }

        await submitRegistration();
    });

    // Real-time validation
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !useUtils.isValidEmail(this.value)) {
                this.style.borderColor = '#EF4444';
                showToast('Please enter a valid email address', 'warning');
            } else {
                this.style.borderColor = '';
            }
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !useUtils.isValidPhone(this.value)) {
                this.style.borderColor = '#EF4444';
                showToast('Please enter a valid phone number (e.g., 08123456789)', 'warning');
            } else {
                this.style.borderColor = '';
            }
        });
    }
}

// Validate form
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const ticketQty = parseInt(document.getElementById('ticketQty').value);
    const address = document.getElementById('address').value.trim();

    if (!fullName) {
        showToast('Full name is required!', 'error');
        document.getElementById('fullName').focus();
        return false;
    }

    if (!email || !useUtils.isValidEmail(email)) {
        showToast('Please enter a valid email address!', 'error');
        document.getElementById('email').focus();
        return false;
    }

    if (!phone || !useUtils.isValidPhone(phone)) {
        showToast('Please enter a valid phone number!', 'error');
        document.getElementById('phone').focus();
        return false;
    }

    if (!ticketQty || ticketQty < 1 || ticketQty > 10) {
        showToast('Number of tickets must be 1-10!', 'error');
        document.getElementById('ticketQty').focus();
        return false;
    }

    if (!address) {
        showToast('Address is required!', 'error');
        document.getElementById('address').focus();
        return false;
    }

    return true;
}

// Submit registration
async function submitRegistration() {
    isSubmitting = true;
    console.log('🚀 Starting registration...');

    try {
        const ticketQty = parseInt(document.getElementById('ticketQty').value) || 1;
        const totalPrice = pricePerTicket * ticketQty;

        console.log('💰 Final Price Check:', {
            pricePerTicket: pricePerTicket,
            ticketQty: ticketQty,
            totalPrice: totalPrice
        });

        const registrationData = {
            eventId: parseInt(currentEvent.id),
            eventTitle: currentEvent.title,
            eventDate: currentEvent.date,
            eventLocation: currentEvent.location,
            eventCategory: currentEvent.category,
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            ticketQty: ticketQty,
            address: document.getElementById('address').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            pricePerTicket: pricePerTicket,
            totalPrice: totalPrice,
            registrationDate: new Date().toISOString()
        };

        console.log('📦 Registration Data:', registrationData);

        // Simpan ke localStorage untuk proses selanjutnya
        localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));

        // Check payment type
        if (totalPrice === 0) {
            // Free event - save directly
            const result = StorageManager.addRegistration(registrationData);
            
            if (result) {
                localStorage.setItem('completedRegistration', JSON.stringify(result));
                showToast('Registration successful!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'payment-success.html';
                }, 1000);
            } else {
                showToast('Registration failed. You may have already registered.', 'error');
            }
        } else {
            // Paid event - redirect to payment
            showToast('Redirecting to payment...', 'success');
            
            setTimeout(() => {
                window.location.href = 'event-payment.html';
            }, 800);
        }

    } catch (error) {
        console.error('❌ Registration Error:', error);
        showToast('Error: ' + error.message, 'error');
    } finally {
        isSubmitting = false;
    }
}

// Setup ticket calculator
function setupTicketCalculator() {
    const ticketQtyInput = document.getElementById('ticketQty');
    
    if (!ticketQtyInput) return;

    ticketQtyInput.addEventListener('input', function() {
        updateTotalPrice();
    });
}

// Change ticket quantity
function changeTicketQty(change) {
    const input = document.getElementById('ticketQty');
    let currentValue = parseInt(input.value) || 1;
    let newValue = currentValue + change;
    
    if (newValue < 1) newValue = 1;
    if (newValue > 10) {
        newValue = 10;
        showToast('Maximum 10 tickets per registration', 'warning');
    }
    
    input.value = newValue;
    updateTotalPrice();
}

// Helper functions
function showToast(message, type = 'info') {
    // Fallback toast jika Toast tidak tersedia
    if (typeof Toast !== 'undefined') {
        if (type === 'error') Toast.error(message);
        else if (type === 'success') Toast.success(message);
        else if (type === 'warning') Toast.warning(message);
        else Toast.info(message);
    } else {
        // Simple alert fallback
        alert(message);
    }
}

function showError(message) {
    showToast(message, 'error');
}

// Make functions globally available
window.changeTicketQty = changeTicketQty;