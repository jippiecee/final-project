// ==========================================
// DETAIL.JS - FIXED Event Detail Page
// ==========================================

let currentEvent = null;

document.addEventListener('DOMContentLoaded', function() {
    loadEventDetail();
});

// Load event detail
function loadEventDetail() {
    const eventId = Utils.getUrlParameter('id');

    if (!eventId) {
        showError('Event not found');
        return;
    }

    currentEvent = StorageManager.getEventById(eventId);

    if (!currentEvent) {
        showError('Event not found');
        return;
    }

    displayEventDetail(currentEvent);
}

// Display event detail
function displayEventDetail(event) {
    const heroSection = document.getElementById('detailHero');
    const contentSection = document.getElementById('detailContent');

    // Set hero background
    if (heroSection) {
        heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${event.image || CONSTANTS.IMAGES.DEFAULT_EVENT}')`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
    }

    // Check if event is in the past
    const isPastEvent = Utils.isDateInPast(event.date);
    const isFree = parseInt(event.price) === 0;
    const isFavorite = StorageManager.isFavorite(event.id);

    // Build content
    if (contentSection) {
        contentSection.innerHTML = `
            <div class="detail-badges">
                <span class="detail-category-badge">${event.category}</span>
                ${isFree ? '<span class="detail-free-badge">FREE EVENT</span>' : ''}
                ${isPastEvent ? '<span class="detail-free-badge" style="background: #6B7280;">PAST EVENT</span>' : ''}
            </div>

            <h1 class="detail-title">${Utils.sanitizeHTML(event.title)}</h1>

            <div class="detail-meta-grid">
                <div class="meta-card">
                    <div class="meta-icon">📅</div>
                    <div class="meta-info">
                        <div class="meta-label">Date</div>
                        <div class="meta-value">${Utils.formatDateLong(event.date)}</div>
                    </div>
                </div>

                <div class="meta-card">
                    <div class="meta-icon">📍</div>
                    <div class="meta-info">
                        <div class="meta-label">Location</div>
                        <div class="meta-value">${Utils.sanitizeHTML(event.location)}</div>
                    </div>
                </div>

                <div class="meta-card">
                    <div class="meta-icon">💰</div>
                    <div class="meta-info">
                        <div class="meta-label">Price</div>
                        <div class="meta-value">${isFree ? 'FREE' : 'Rp ' + Utils.formatPrice(event.price)}</div>
                    </div>
                </div>

                <div class="meta-card">
                    <div class="meta-icon">🎫</div>
                    <div class="meta-info">
                        <div class="meta-label">Registrations</div>
                        <div class="meta-value">${getRegistrationCount(event.id)} people</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h2 class="section-heading">📋 About This Event</h2>
                <p class="detail-description">${Utils.sanitizeHTML(event.description)}</p>
            </div>

            <div class="detail-actions">
                ${!isPastEvent ? `
                    <a href="event-register.html?id=${event.id}" class="btn btn-primary btn-large">
                        <span>🎫</span>
                        Register Now
                    </a>
                ` : `
                    <button class="btn btn-outline btn-large" disabled style="opacity: 0.5; cursor: not-allowed;">
                        <span>🎫</span>
                        Registration Closed
                    </button>
                `}
                
                <button onclick="toggleFavoriteDetail(${event.id})" class="btn ${isFavorite ? 'btn-danger' : 'btn-outline'} btn-large">
                    <span>${isFavorite ? '❤️' : '🤍'}</span>
                    ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>

                <button onclick="shareEvent()" class="btn btn-outline btn-large">
                    <span>🔗</span>
                    Share Event
                </button>
            </div>

            <div class="detail-footer">
                <button onclick="goBackToPrevious()" class="btn btn-text">
                    ← Back
                </button>
            </div>
        `;
    }
}

// Get registration count for event
function getRegistrationCount(eventId) {
    const registrations = StorageManager.getRegistrationsByEventId(eventId);
    return registrations.length;
}

// Toggle favorite
function toggleFavoriteDetail(eventId) {
    const isFavorite = StorageManager.isFavorite(eventId);
    
    if (isFavorite) {
        StorageManager.removeFromFavorites(eventId);
        Toast.info('Removed from favorites');
    } else {
        StorageManager.addToFavorites(eventId);
        Toast.success('Added to favorites!');
    }
    
    // Refresh display
    loadEventDetail();
}

// Share event
function shareEvent() {
    if (!currentEvent) return;

    const shareData = {
        title: currentEvent.title,
        text: currentEvent.description,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => Toast.success('Event shared successfully!'))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    copyToClipboard();
                }
            });
    } else {
        copyToClipboard();
    }
}

// Copy URL to clipboard
function copyToClipboard() {
    const url = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
            .then(() => Toast.success('Link copied to clipboard!'))
            .catch(() => fallbackCopy(url));
    } else {
        fallbackCopy(url);
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
        navigator.clipboard.writeText(text).then(() => {
            Toast.success('Link copied to clipboard!');
        }).catch(() => {
            Toast.error('Failed to copy link');
        });
    } catch (err) {
        Toast.error('Failed to copy link');
    }

    document.body.removeChild(textarea);
}

// Go back to previous page
function goBackToPrevious() {
    const referrer = Utils.getReferrer();
    
    if (referrer && referrer !== window.location.href) {
        window.location.href = referrer;
    } else {
        Utils.goBack();
    }
}

// Show error
function showError(message) {
    const contentSection = document.getElementById('detailContent');
    
    if (contentSection) {
        contentSection.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <h3>${message}</h3>
                <p>The event you're looking for doesn't exist or has been removed</p>
                <a href="event-list.html" class="btn btn-primary btn-large" style="margin-top: 2rem;">
                    Browse All Events
                </a>
            </div>
        `;
    }
}

// Make functions globally available
window.toggleFavoriteDetail = toggleFavoriteDetail;
window.shareEvent = shareEvent;
window.goBackToPrevious = goBackToPrevious;