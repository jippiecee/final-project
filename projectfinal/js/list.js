// ==========================================
// LIST.JS - FIXED Event List with All Features
// ==========================================

let currentFilter = 'all';
let currentSort = 'date-asc';
let currentSearchTerm = '';

function initListPage() {
    StorageManager.init(); // Ensure storage is initialized
    Utils.setReferrer(); // Track where user came from
    initializePage();
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', initListPage);
initListPage(); // Call immediately in case DOM is already loaded

// Initialize page
function initializePage() {
    // Check for URL parameters
    const categoryParam = Utils.getUrlParameter('category');
    if (categoryParam) {
        currentFilter = categoryParam;
        setActiveFilterButton(categoryParam);
    }

    loadAndDisplayEvents();
}

// Setup all event listeners
function setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', 
            Utils.debounce(handleSearch, CONSTANTS.LIMITS.SEARCH_DEBOUNCE_MS)
        );
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });

    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
}

// Handle search
function handleSearch(e) {
    currentSearchTerm = e.target.value.trim();
    loadAndDisplayEvents();
}

// Handle filter button click
function handleFilterClick(e) {
    const button = e.currentTarget;
    const category = button.dataset.category;
    
    // Update current filter
    currentFilter = category;
    
    // Update active button
    setActiveFilterButton(category);
    
    // Clear search when filtering
    const searchInput = document.getElementById('searchInput');
    if (searchInput && currentSearchTerm) {
        searchInput.value = '';
        currentSearchTerm = '';
    }
    
    // Update URL
    if (category === 'all') {
        Utils.removeUrlParameter('category');
    } else {
        Utils.setUrlParameter('category', category);
    }
    
    loadAndDisplayEvents();
}

// Set active filter button
function setActiveFilterButton(category) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Handle sort change
function handleSortChange(e) {
    currentSort = e.target.value;
    loadAndDisplayEvents();
}

// Load and display events
function loadAndDisplayEvents() {
    let events = StorageManager.getEvents();

    // Apply search
    if (currentSearchTerm) {
        events = StorageManager.searchEvents(currentSearchTerm);
    }

    // Apply filter
    if (currentFilter !== 'all') {
        events = events.filter(event => event.category === currentFilter);
    }

    // Apply sort
    events = StorageManager.sortEvents(events, currentSort);

    // Display
    displayEvents(events);
    updateResultsCount(events.length);
}

// Display events
function displayEvents(events) {
    const container = document.getElementById('eventsList');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = '';
        if (emptyState) {
            emptyState.style.display = 'flex';
        }
        return;
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }

    container.innerHTML = events.map(event => createEventCard(event)).join('');
}

// Create event card
function createEventCard(event) {
    const isFree = parseInt(event.price) === 0;
    const isFavorite = StorageManager.isFavorite(event.id);
    
    return `
        <div class="event-card" onclick="navigateToDetail(${event.id})">
            <div class="event-card-image">
                <img src="${event.image || CONSTANTS.IMAGES.DEFAULT_EVENT}" 
                     alt="${Utils.sanitizeHTML(event.title)}" 
                     class="event-image"
                     onerror="Utils.handleImageError(this)">
                ${isFree ? '<span class="free-badge">FREE</span>' : ''}
            </div>
            <div class="event-content">
                <span class="event-category">${event.category}</span>
                <h3 class="event-title">${Utils.sanitizeHTML(event.title)}</h3>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <span>📅</span>
                        <span>${Utils.formatDate(event.date)}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>📍</span>
                        <span>${Utils.sanitizeHTML(event.location)}</span>
                    </div>
                </div>
                <div class="event-price">
                    ${isFree ? 'FREE' : 'Rp ' + Utils.formatPrice(event.price)}
                </div>
                <div class="event-footer">
                    <a href="event-detail.html?id=${event.id}" 
                       class="btn btn-text btn-sm" 
                       onclick="event.stopPropagation()">
                        👁️ View Details
                    </a>
                    <button onclick="toggleFavorite(${event.id}, event)" 
                            class="btn btn-text btn-sm"
                            style="color: ${isFavorite ? '#EF4444' : '#6B7280'}">
                        ${isFavorite ? '❤️' : '🤍'} 
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update results count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        let message = `Showing ${count} event${count !== 1 ? 's' : ''}`;
        
        if (currentFilter !== 'all') {
            message += ` in ${currentFilter}`;
        }
        
        if (currentSearchTerm) {
            message += ` matching "${currentSearchTerm}"`;
        }
        
        resultsCount.textContent = message;
    }
}

// Navigate to detail
function navigateToDetail(id) {
    window.location.href = `event-detail.html?id=${id}`;
}

// Toggle favorite
function toggleFavorite(eventId, event) {
    event.stopPropagation();
    
    const isFavorite = StorageManager.isFavorite(eventId);
    
    if (isFavorite) {
        StorageManager.removeFromFavorites(eventId);
        Toast.info('Removed from favorites');
    } else {
        StorageManager.addToFavorites(eventId);
        Toast.success('Added to favorites!');
    }
    
    // Refresh display
    loadAndDisplayEvents();
}

// Clear all filters
function clearAllFilters() {
    currentFilter = 'all';
    currentSort = 'date-asc';
    currentSearchTerm = '';
    
    // Reset UI
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'date-asc';
    
    setActiveFilterButton('all');
    Utils.removeUrlParameter('category');
    
    loadAndDisplayEvents();
}

// Make functions globally available
window.navigateToDetail = navigateToDetail;
window.toggleFavorite = toggleFavorite;
window.clearAllFilters = clearAllFilters;