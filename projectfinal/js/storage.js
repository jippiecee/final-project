// ==========================================
// STORAGE.JS - FIXED Enhanced Storage Manager
// ==========================================

const StorageManager = {
    EVENTS_KEY: 'devent_events',
    REGISTRATIONS_KEY: 'devent_registrations',
    FAVORITES_KEY: 'devent_favorites',

    // Initialize with dummy data
    init() {
        // Only initialize if CONSTANTS is available
        if (typeof CONSTANTS === 'undefined') {
            console.warn('CONSTANTS not loaded yet');
            return;
        }

        const events = this.getEvents();
        if (events.length < 6) {
            const dummyEvents = [
                {
                    id: Date.now(),
                    title: "Tech Summit Indonesia 2024",
                    date: "2025-02-15",
                    location: "Jakarta Convention Center",
                    price: "500000",
                    category: "Conference",
                    description: "Indonesia's largest technology conference featuring industry leaders, workshops, and networking opportunities with tech professionals.",
                    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
                },
                {
                    id: Date.now() + 1,
                    title: "Digital Marketing Masterclass",
                    date: "2025-02-20",
                    location: "Grand Ballroom Hotel Indonesia",
                    price: "350000",
                    category: "Workshop",
                    description: "Learn advanced digital marketing strategies from industry experts including SEO, social media, and content marketing.",
                    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800"
                },
                {
                    id: Date.now() + 2,
                    title: "Music Festival Jakarta",
                    date: "2025-02-25",
                    location: "Gelora Bung Karno Stadium",
                    price: "750000",
                    category: "Concert",
                    description: "The biggest music festival featuring international and local artists with multiple stages and genres.",
                    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800"
                },
                {
                    id: Date.now() + 3,
                    title: "Startup Pitch Competition",
                    date: "2025-02-28",
                    location: "Innovation Hub Jakarta",
                    price: "0",
                    category: "Seminar",
                    description: "Watch innovative startups pitch their ideas to venture capitalists and angel investors. Free entry for all attendees.",
                    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800"
                },
                {
                    id: Date.now() + 4,
                    title: "Art & Design Exhibition",
                    date: "2025-03-05",
                    location: "National Gallery of Indonesia",
                    price: "150000",
                    category: "Exhibition",
                    description: "Showcasing contemporary art and design from emerging Indonesian artists and designers.",
                    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800"
                },
                {
                    id: Date.now() + 5,
                    title: "Business Networking Night",
                    date: "2025-03-10",
                    location: "Sky Lounge Jakarta",
                    price: "200000",
                    category: "Networking",
                    description: "Connect with professionals, entrepreneurs, and industry leaders in an exclusive networking event.",
                    image: "https://images.unsplash.com/photo-1551833726-5ec94f50d0ff?w=800"
                }
            ];
            this.saveEvents(dummyEvents);
        }

        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === this.EVENTS_KEY || e.key === this.REGISTRATIONS_KEY) {
                // Optional: reload page or emit custom event
                console.log('Storage changed in another tab');
            }
        });
    },

    // ============= EVENTS CRUD =============

    getEvents() {
        try {
            const data = localStorage.getItem(this.EVENTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading events:', e);
            return [];
        }
    },

    getEventById(id) {
        const events = this.getEvents();
        return events.find(event => event.id === parseInt(id));
    },

    saveEvents(events) {
        try {
            localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
            return true;
        } catch (e) {
            console.error('Error saving events:', e);
            if (e.name === 'QuotaExceededError') {
                alert('Storage full! Please delete some events.');
            }
            return false;
        }
    },

    addEvent(eventData) {
        const events = this.getEvents();
        const newEvent = {
            id: Date.now(),
            ...eventData,
            createdAt: new Date().toISOString()
        };
        events.push(newEvent);
        
        if (this.saveEvents(events)) {
            return newEvent;
        }
        return null;
    },

    updateEvent(id, updatedData) {
        const events = this.getEvents();
        const index = events.findIndex(event => event.id === parseInt(id));
        
        if (index !== -1) {
            events[index] = {
                ...events[index],
                ...updatedData,
                id: parseInt(id),
                updatedAt: new Date().toISOString()
            };
            
            if (this.saveEvents(events)) {
                return events[index];
            }
        }
        return null;
    },

    deleteEvent(id) {
        const events = this.getEvents();
        const filteredEvents = events.filter(event => event.id !== parseInt(id));
        
        // Also delete related registrations
        this.deleteRegistrationsByEventId(id);
        
        return this.saveEvents(filteredEvents);
    },

    // ============= SEARCH & FILTER =============

    searchEvents(keyword) {
        const events = this.getEvents();
        if (!keyword || keyword.trim() === '') return events;
        
        const lowerKeyword = keyword.toLowerCase();
        return events.filter(event => {
            return (
                event.title?.toLowerCase().includes(lowerKeyword) ||
                event.description?.toLowerCase().includes(lowerKeyword) ||
                event.location?.toLowerCase().includes(lowerKeyword) ||
                event.category?.toLowerCase().includes(lowerKeyword)
            );
        });
    },

    filterByCategory(category) {
        const events = this.getEvents();
        if (!category || category === 'all') return events;
        return events.filter(event => event.category === category);
    },

    sortEvents(events, sortBy) {
        if (!sortBy) return events;

        const sortConfig = {
            'date-asc': { field: 'date', order: 'asc' },
            'date-desc': { field: 'date', order: 'desc' },
            'price-asc': { field: 'price', order: 'asc' },
            'price-desc': { field: 'price', order: 'desc' },
            'name-asc': { field: 'title', order: 'asc' },
            'name-desc': { field: 'title', order: 'desc' }
        };

        const config = sortConfig[sortBy];
        if (!config) return events;

        return [...events].sort((a, b) => {
            let aVal = a[config.field];
            let bVal = b[config.field];

            // Handle dates
            if (config.field === 'date') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            // Handle numbers
            if (config.field === 'price') {
                aVal = parseInt(aVal) || 0;
                bVal = parseInt(bVal) || 0;
            }

            // Handle strings
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (config.order === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    },

    getCategories() {
        const events = this.getEvents();
        const categories = events.map(event => event.category).filter(Boolean);
        return [...new Set(categories)];
    },

    // ============= REGISTRATIONS CRUD =============

    getRegistrations() {
        try {
            const data = localStorage.getItem(this.REGISTRATIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading registrations:', e);
            return [];
        }
    },

    getRegistrationById(id) {
        const registrations = this.getRegistrations();
        return registrations.find(reg => reg.registrationId === id);
    },

    saveRegistrations(registrations) {
        try {
            localStorage.setItem(this.REGISTRATIONS_KEY, JSON.stringify(registrations));
            return true;
        } catch (e) {
            console.error('Error saving registrations:', e);
            return false;
        }
    },

    addRegistration(registrationData) {
        const registrations = this.getRegistrations();
        
        // Check for duplicate registration
        const duplicate = registrations.find(reg => 
            reg.eventId === registrationData.eventId && 
            reg.email === registrationData.email
        );

        if (duplicate) {
            return null;
        }

        const newRegistration = {
            ...registrationData,
            registrationId: 'REG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            registrationDate: new Date().toISOString()
        };

        registrations.push(newRegistration);
        
        if (this.saveRegistrations(registrations)) {
            return newRegistration;
        }
        return null;
    },

    deleteRegistration(registrationId) {
        const registrations = this.getRegistrations();
        const filtered = registrations.filter(reg => reg.registrationId !== registrationId);
        return this.saveRegistrations(filtered);
    },

    deleteRegistrationsByEventId(eventId) {
        const registrations = this.getRegistrations();
        const filtered = registrations.filter(reg => reg.eventId !== parseInt(eventId));
        return this.saveRegistrations(filtered);
    },

    getRegistrationsByEventId(eventId) {
        const registrations = this.getRegistrations();
        return registrations.filter(reg => reg.eventId === parseInt(eventId));
    },

    // ============= FAVORITES =============

    getFavorites() {
        try {
            const data = localStorage.getItem(this.FAVORITES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading favorites:', e);
            return [];
        }
    },

    addToFavorites(eventId) {
        const favorites = this.getFavorites();
        const id = parseInt(eventId);
        if (!favorites.includes(id)) {
            favorites.push(id);
            try {
                localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
                return true;
            } catch (e) {
                console.error('Error saving favorites:', e);
                return false;
            }
        }
        return false;
    },

    removeFromFavorites(eventId) {
        const favorites = this.getFavorites();
        const filtered = favorites.filter(id => id !== parseInt(eventId));
        try {
            localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error('Error saving favorites:', e);
            return false;
        }
    },

    isFavorite(eventId) {
        const favorites = this.getFavorites();
        return favorites.includes(parseInt(eventId));
    },

    getFavoriteEvents() {
        const favorites = this.getFavorites();
        const events = this.getEvents();
        return events.filter(event => favorites.includes(event.id));
    },

    // ============= STATISTICS =============

    getStatistics() {
        const events = this.getEvents();
        const registrations = this.getRegistrations();
        const categories = this.getCategories();

        const totalRevenue = registrations.reduce((sum, reg) => sum + (parseInt(reg.totalPrice) || 0), 0);
        const totalTickets = registrations.reduce((sum, reg) => sum + (parseInt(reg.ticketQty) || 0), 0);

        return {
            totalEvents: events.length,
            totalCategories: categories.length,
            totalRegistrations: registrations.length,
            totalRevenue,
            totalTickets
        };
    },

    // ============= UTILITY =============

    clearAll() {
        localStorage.removeItem(this.EVENTS_KEY);
        localStorage.removeItem(this.REGISTRATIONS_KEY);
        localStorage.removeItem(this.FAVORITES_KEY);
    },

    exportData() {
        return {
            events: this.getEvents(),
            registrations: this.getRegistrations(),
            favorites: this.getFavorites(),
            exportDate: new Date().toISOString()
        };
    },

    importData(data) {
        try {
            if (data.events) this.saveEvents(data.events);
            if (data.registrations) this.saveRegistrations(data.registrations);
            if (data.favorites) {
                localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(data.favorites));
            }
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
};

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        StorageManager.init();
    });
    // Also try to init immediately if constants is available
    if (typeof CONSTANTS !== 'undefined') {
        StorageManager.init();
    }
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}