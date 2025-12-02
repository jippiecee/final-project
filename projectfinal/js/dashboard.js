// === DASHBOARD.JS - ENHANCED SCRIPT FOR DASHBOARD.HTML ===

document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});

// Get registrations
function getRegistrations() {
    return StorageManager.getRegistrations();
}

// Load all dashboard data
function loadDashboard() {
    const events = StorageManager.getEvents();
    updateStatistics(events);
    displayDashboardEvents(events);
}

// Update statistics
function updateStatistics(events) {
    const totalEventsEl = document.getElementById('totalEvents');
    const totalCategoriesEl = document.getElementById('totalCategories');
    const totalRegistrationsEl = document.getElementById('totalRegistrations');
    
    const categories = StorageManager.getCategories();
    const registrations = getRegistrations();
    
    if (totalEventsEl) {
        animateCounter(totalEventsEl, events.length);
    }
    
    if (totalCategoriesEl) {
        animateCounter(totalCategoriesEl, categories.length);
    }

    if (totalRegistrationsEl) {
        animateCounter(totalRegistrationsEl, registrations.length);
    }
}

// Animate counter
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// Display dashboard events
function displayDashboardEvents(events) {
    const container = document.getElementById('dashboardEvents');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = events.map(event => createDashboardCard(event)).join('');
}

// Create dashboard card
function createDashboardCard(event) {
    const isFree = parseInt(event.price) === 0;
    
    return `
        <div class="event-card">
            <div class="event-card-image">
                <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}" 
                     alt="${event.title}" 
                     class="event-image"
                     onerror="this.src='https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'">
                ${isFree ? '<span class="free-badge">FREE</span>' : ''}
            </div>
            <div class="event-content">
                <span class="event-category">${event.category}</span>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <span>📅</span>
                        <span>${formatDate(event.date)}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>📍</span>
                        <span>${event.location}</span>
                    </div>
                </div>
                <div class="event-price">${isFree ? 'FREE' : 'Rp ' + formatPrice(event.price)}</div>
                
                <div class="event-actions">
                    <a href="event-detail.html?id=${event.id}" class="btn btn-text btn-small">
                        👁️ View
                    </a>
                    <button onclick="editEvent(${event.id})" class="btn-edit">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteEvent(${event.id})" class="btn-delete">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

// Format price
function formatPrice(price) {
    return parseInt(price).toLocaleString('id-ID');
}

// Edit event
function editEvent(id) {
    window.location.href = `event-form.html?id=${id}`;
}

// Delete event
function deleteEvent(id) {
    const event = StorageManager.getEventById(id);
    
    if (!event) {
        alert('Event not found!');
        return;
    }

    const confirmDelete = confirm(
        `⚠️ Are you sure you want to delete this event?\n\n"${event.title}"\n\nThis action cannot be undone!`
    );

    if (confirmDelete) {
        try {
            StorageManager.deleteEvent(id);
            alert('✅ Event successfully deleted!');
            loadDashboard();
        } catch (error) {
            alert('❌ Failed to delete event: ' + error.message);
        }
    }
}