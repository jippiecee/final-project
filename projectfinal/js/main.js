// === MAIN.JS - SCRIPT FOR INDEX.HTML (D-EVENT) - FINAL FIX ===

// FORCE INIT IMMEDIATELY - Before DOMContentLoaded
if (typeof StorageManager !== 'undefined') {
    StorageManager.init();
}

// Wait for DOM, then load with delay
document.addEventListener('DOMContentLoaded', function() {
    // Add extra delay to ensure localStorage is ready
    setTimeout(() => {
        loadFeaturedEvents();
        updateHeroStats();
        loadCategories();
    }, 300); // Increased to 300ms
});

// Update hero statistics
function updateHeroStats() {
    const events = StorageManager.getEvents();
    const categories = StorageManager.getCategories();
    const registrations = getRegistrations();
    
    const totalEventsEl = document.getElementById('heroTotalEvents');
    const totalCategoriesEl = document.getElementById('heroTotalCategories');
    const totalRegistrationsEl = document.getElementById('heroTotalRegistrations');
    
    // FORCE set immediately, don't wait for animation
    if (totalEventsEl) {
        totalEventsEl.textContent = events.length;
        // Then animate
        setTimeout(() => animateCounter(totalEventsEl, events.length), 100);
    }
    
    if (totalCategoriesEl) {
        totalCategoriesEl.textContent = categories.length;
        setTimeout(() => animateCounter(totalCategoriesEl, categories.length), 100);
    }
    
    if (totalRegistrationsEl) {
        totalRegistrationsEl.textContent = registrations.length;
        setTimeout(() => animateCounter(totalRegistrationsEl, registrations.length), 100);
    }
}

// Animate counter
function animateCounter(element, target) {
    if (target === 0) {
        element.textContent = '0';
        return;
    }
    
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

// Get registrations using StorageManager
function getRegistrations() {
    return StorageManager.getRegistrations();
}

// Load featured events (max 6)
function loadFeaturedEvents() {
    const events = StorageManager.getEvents();
    const featuredContainer = document.getElementById('featuredEvents');
    
    if (!featuredContainer) return;

    const featuredEvents = events.slice(0, 6);

    if (featuredEvents.length === 0) {
        featuredContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <h3>No Events Available</h3>
                <p>Be the first to create an event!</p>
                <a href="event-form.html" class="btn btn-primary" style="margin-top: 1.5rem;">
                    Create First Event
                    <span class="btn-icon">→</span>
                </a>
            </div>
        `;
        return;
    }

    featuredContainer.innerHTML = featuredEvents.map(event => createEventCard(event)).join('');

    // Make the grid visible immediately
    const eventsGrid = document.querySelector('.events-grid');
    if (eventsGrid) {
        eventsGrid.classList.add('is-visible');
    }

    // Re-observe for animations
    if (window.scrollObserver) {
        const cards = featuredContainer.querySelectorAll('.event-card');
        cards.forEach(card => window.scrollObserver.observe(card));
    }
}

// Create event card HTML
function createEventCard(event) {
    const isFree = parseInt(event.price) === 0;
    return `
        <div class="event-card animate-on-scroll" onclick="goToDetail(${event.id})">
            <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}"
                 alt="${event.title}"
                 class="event-image"
                 onerror="this.src='https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'">
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
                <a href="event-detail.html?id=${event.id}" class="btn btn-text" onclick="event.stopPropagation()">
                    View Details
                    <span class="btn-icon">→</span>
                </a>
            </div>
        </div>
    `;
}

// Load categories
function loadCategories() {
    const categoriesContainer = document.getElementById('categoriesGrid');
    if (!categoriesContainer) return;

    const events = StorageManager.getEvents();
    const categoryIcons = {
        'Festival': '🎪',
        'Workshop': '🎓',
        'Tasting': '🍽️',
        'Concert': '🎵',
        'Konser': '🎵',
        'Seminar': '💼',
        'Exhibition': '🖼️',
        'Conference': '👥',
        'Webinar': '💻',
        'Networking': '🤝',
        'Sports': '⚽',
        'Theater': '🎭',
        'Other': '✨',
        'Lainnya': '✨'
    };

    // Count events per category
    const categoryCounts = {};
    events.forEach(event => {
        categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    });

    // Create category cards
    const categoryCards = Object.keys(categoryCounts).map(category => {
        const icon = categoryIcons[category] || '📌';
        const count = categoryCounts[category];
        return `
            <div class="category-card animate-on-scroll" onclick="filterByCategory('${category}')">
                <div class="category-icon">${icon}</div>
                <div class="category-name">${category}</div>
                <div class="category-count">${count} Event${count > 1 ? 's' : ''}</div>
            </div>
        `;
    });

    if (categoryCards.length === 0) {
        categoriesContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>No categories available yet</p>
            </div>
        `;
    } else {
        categoriesContainer.innerHTML = categoryCards.join('');

        // Observe new elements for animations
        if (window.scrollObserver) {
            const newCards = categoriesContainer.querySelectorAll('.animate-on-scroll');
            newCards.forEach(card => window.scrollObserver.observe(card));
        }
    }
}

// Filter by category
function filterByCategory(category) {
    window.location.href = `event-list.html?category=${encodeURIComponent(category)}`;
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

// Navigate to detail
function goToDetail(id) {
    window.location.href = `event-detail.html?id=${id}`;
}

// Make function globally available
window.goToDetail = goToDetail;