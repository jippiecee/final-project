// ==========================================
// CONSTANTS.JS - Application Constants
// ==========================================

// Define immediately without waiting
const CONSTANTS = {
    // ============= REGEX PATTERNS =============
    REGEX: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^(\+62|62|0)[8-9][0-9]{7,11}$/,
        URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
    },

    // ============= LIMITS =============
    LIMITS: {
        MIN_TICKETS_PER_REGISTRATION: 1,
        MAX_TICKETS_PER_REGISTRATION: 10,
        SEARCH_DEBOUNCE_MS: 300,
        TOAST_DURATION_MS: 3000
    },

    // ============= IMAGES =============
    IMAGES: {
        DEFAULT_EVENT: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        ERROR_FALLBACK: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
    },

    // ============= STORAGE KEYS =============
    STORAGE_KEYS: {
        EVENTS: 'devent_events',
        REGISTRATIONS: 'devent_registrations',
        FAVORITES: 'devent_favorites'
    }
};

// Make it available globally immediately
if (typeof window !== 'undefined') {
    window.CONSTANTS = CONSTANTS;
    console.log('✅ CONSTANTS loaded successfully');
}

// No need to wait for DOMContentLoaded
console.log('🎯 CONSTANTS initialized');
