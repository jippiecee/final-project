// ==========================================
// REGISTER.JS - FIXED Event Registration
// ==========================================

let currentEvent = null;
let pricePerTicket = 0;
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', function() {
    loadEventInfo();
    setupForm();
    setupTicketCalculator();
});

// Load event information
function loadEventInfo() {
    const eventId = Utils.getUrlParameter('id');

    if (!eventId) {
        Toast.error('Event not found!');
        setTimeout(() => {
            window.location.href = 'event-list.html';
        }, 2000);
        return;
    }

    currentEvent = StorageManager.getEventById(eventId);

    if (!currentEvent) {
        Toast.error('Event not found!');
        setTimeout(() => {
            window.location.href = 'event-list.html';
        }, 2000);
        return;
    }

    // Check if event is in the past
    if (Utils.isDateInPast(currentEvent.date)) {
        Modal.alert({
            title: 'Event Has Passed',
            message: 'This event has already taken place. Registration is closed.',
            type: 'warning'
        }).then(() => {
            window.location.href = `event-detail.html?id=${eventId}`;
        });
        return;
    }

    pricePerTicket = parseInt(currentEvent.price);
    displayEventInfo(currentEvent);
}

// Display event info in banner
function displayEventInfo(event) {
    document.getElementById('eventCategory').textContent = event.category;
    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('eventDate').textContent = Utils.formatDateLong(event.date);
    document.getElementById('eventLocation').textContent = event.location;
    document.getElementById('eventPrice').textContent = event.price == 0 ? 'FREE' : `Rp ${Utils.formatPrice(event.price)}`;

    // Update summary
    document.getElementById('pricePerTicket').textContent = event.price == 0 ? 'FREE' : `Rp ${Utils.formatPrice(event.price)}`;
    updateTotalPrice();
}

// Setup form
function setupForm() {
    const form = document.getElementById('registrationForm');
    
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        if (!validateForm()) {
            return;
        }

        await submitRegistration();
    });

    // Add real-time validation
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !Utils.isValidEmail(this.value)) {
                this.style.borderColor = '#EF4444';
                Toast.warning('Please enter a valid email address');
            } else {
                this.style.borderColor = '';
            }
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !Utils.isValidPhone(this.value)) {
                this.style.borderColor = '#EF4444';
                Toast.warning('Please enter a valid phone number (e.g., 08123456789)');
            } else {
                this.style.borderColor = '';
            }
        });
    }
}

// Setup ticket calculator
function setupTicketCalculator() {
    const ticketQtyInput = document.getElementById('ticketQty');
    
    if (!ticketQtyInput) return;

    // Add increment/decrement buttons
    const wrapper = ticketQtyInput.parentElement;
    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 0.5rem;';
    controls.innerHTML = `
        <button type="button" onclick="changeTicketQty(-1)" class="btn btn-outline" style="padding: 0.5rem 1rem;">
            - Decrease
        </button>
        <button type="button" onclick="changeTicketQty(1)" class="btn btn-outline" style="padding: 0.5rem 1rem;">
            + Increase
        </button>
    `;
    wrapper.appendChild(controls);

    ticketQtyInput.addEventListener('input', function() {
        updateTotalPrice();
    });
}

// Change ticket quantity
function changeTicketQty(change) {
    const input = document.getElementById('ticketQty');
    let currentValue = parseInt(input.value) || 1;
    let newValue = currentValue + change;
    
    if (newValue < CONSTANTS.LIMITS.MIN_TICKETS_PER_REGISTRATION) {
        newValue = CONSTANTS.LIMITS.MIN_TICKETS_PER_REGISTRATION;
    }
    if (newValue > CONSTANTS.LIMITS.MAX_TICKETS_PER_REGISTRATION) {
        newValue = CONSTANTS.LIMITS.MAX_TICKETS_PER_REGISTRATION;
        Toast.warning(`Maximum ${CONSTANTS.LIMITS.MAX_TICKETS_PER_REGISTRATION} tickets per registration`);
    }
    
    input.value = newValue;
    updateTotalPrice();
}

// Update total price
function updateTotalPrice() {
    const ticketQty = parseInt(document.getElementById('ticketQty').value) || 1;
    const total = pricePerTicket * ticketQty;

    document.getElementById('totalTickets').textContent = ticketQty;
    document.getElementById('totalPrice').textContent = total === 0 ? 'FREE' : `Rp ${Utils.formatPrice(total)}`;
}

// Validate form
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const ticketQty = parseInt(document.getElementById('ticketQty').value);
    const address = document.getElementById('address').value.trim();

    if (!fullName) {
        Toast.error('Full name is required!');
        document.getElementById('fullName').focus();
        return false;
    }

    if (!email || !Utils.isValidEmail(email)) {
        Toast.error('Please enter a valid email address!');
        document.getElementById('email').focus();
        return false;
    }

    if (!phone || !Utils.isValidPhone(phone)) {
        Toast.error('Please enter a valid phone number (format: 08123456789 or +628123456789)');
        document.getElementById('phone').focus();
        return false;
    }

    if (!ticketQty || ticketQty < 1 || ticketQty > CONSTANTS.LIMITS.MAX_TICKETS_PER_REGISTRATION) {
        Toast.error(`Number of tickets must be between 1-${CONSTANTS.LIMITS.MAX_TICKETS_PER_REGISTRATION}!`);
        document.getElementById('ticketQty').focus();
        return false;
    }

    if (!address) {
        Toast.error('Address is required!');
        document.getElementById('address').focus();
        return false;
    }

    return true;
}

// Submit registration
async function submitRegistration() {
    isSubmitting = true;

    // Show loading
    const loadingModal = Modal.loading('Processing your registration...');

    try {
        const registrationData = {
            eventId: currentEvent.id,
            eventTitle: currentEvent.title,
            eventDate: currentEvent.date,
            eventLocation: currentEvent.location,
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            ticketQty: parseInt(document.getElementById('ticketQty').value),
            address: document.getElementById('address').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            totalPrice: pricePerTicket * parseInt(document.getElementById('ticketQty').value)
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save registration
        const result = StorageManager.addRegistration(registrationData);

        // Close loading
        Modal.close();

        if (result) {
            // Show success modal
            await Modal.alert({
                title: 'Registration Successful!',
                message: `
Event: ${result.eventTitle}
Name: ${result.fullName}
Email: ${result.email}
Tickets: ${result.ticketQty}
Total: ${result.totalPrice === 0 ? 'FREE' : 'Rp ' + Utils.formatPrice(result.totalPrice)}

Registration ID: ${result.registrationId}

Confirmation has been sent to your email.
                `,
                type: 'success',
                buttonText: 'View Event Details'
            });

            // Redirect to event detail
            window.location.href = `event-detail.html?id=${currentEvent.id}`;
        } else {
            Toast.error('Registration failed. You may have already registered for this event.');
        }

    } catch (error) {
        Modal.close();
        console.error('Registration error:', error);
        Toast.error('An error occurred. Please try again.');
    } finally {
        isSubmitting = false;
    }
}

// Make functions globally available
window.changeTicketQty = changeTicketQty;