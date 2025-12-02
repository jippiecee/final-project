// ==========================================
// UTILS.JS - FIXED Utility Functions
// ==========================================

const Utils = {
    // ============= VALIDATION =============
    
    isValidEmail(email) {
        return CONSTANTS.REGEX.EMAIL.test(email);
    },

    isValidPhone(phone) {
        return CONSTANTS.REGEX.PHONE.test(phone);
    },

    isValidURL(url) {
        return CONSTANTS.REGEX.URL.test(url);
    },

    // ============= FORMATTING =============

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
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

    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    },

    formatPrice(price) {
        if (price === undefined || price === null) return '0';
        return parseInt(price).toLocaleString('id-ID');
    },

    formatCurrency(price) {
        if (price === undefined || price === null) return 'Rp 0';
        if (parseInt(price) === 0) return 'FREE';
        return 'Rp ' + this.formatPrice(price);
    },

    // ============= DATE UTILITIES =============

    isDateInPast(dateString) {
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today;
    },

    isDateInFuture(dateString) {
        return !this.isDateInPast(dateString);
    },

    // ============= STRING UTILITIES =============

    sanitizeHTML(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    truncate(str, maxLength) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    },

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // ============= STORAGE UTILITIES =============

    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error loading from storage:', e);
            return defaultValue;
        }
    },

    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to storage:', e);
            if (e.name === 'QuotaExceededError') {
                Toast.error('Storage full! Please delete some data.');
            }
            return false;
        }
    },

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from storage:', e);
            return false;
        }
    },

    // ============= ARRAY UTILITIES =============

    searchArray(array, keyword, fields) {
        if (!keyword || keyword.trim() === '') return array;
        
        const lowerKeyword = keyword.toLowerCase();
        return array.filter(item => {
            return fields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(lowerKeyword);
            });
        });
    },

    sortArray(array, field, order = 'asc') {
        return [...array].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            // Handle dates
            if (field === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            // Handle numbers
            if (field === 'price') {
                aVal = parseInt(aVal) || 0;
                bVal = parseInt(bVal) || 0;
            }

            // Handle strings
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (order === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    },

    // ============= URL UTILITIES =============

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    setUrlParameter(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    removeUrlParameter(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    },

    // ============= NAVIGATION =============

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    },

    redirect(url) {
        window.location.href = url;
    },

    setReferrer() {
        sessionStorage.setItem('referrer', window.location.href);
    },

    getReferrer() {
        return sessionStorage.getItem('referrer');
    },

    // ============= DEBOUNCE =============

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // ============= ID GENERATION =============

    generateId() {
        return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    // ============= IMAGE UTILITIES =============

    handleImageError(img) {
        img.onerror = null;
        img.src = CONSTANTS.IMAGES.ERROR_FALLBACK;
    },

    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }
};

// ============= TOAST NOTIFICATIONS =============

const Toast = {
    show(message, type = 'info', duration = CONSTANTS.LIMITS.TOAST_DURATION_MS) {
        // Remove existing toasts
        const existing = document.querySelectorAll('.toast-notification');
        existing.forEach(el => el.remove());

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${this.getColor(type)};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            font-size: 14px;
            font-weight: 500;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    getColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        return colors[type] || colors.info;
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    warning(message) {
        this.show(message, 'warning');
    },

    info(message) {
        this.show(message, 'info');
    }
};

// ============= MODAL SYSTEM =============

const Modal = {
    create(content, options = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease-out;
        `;

        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: scaleIn 0.3s ease-out;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        `;
        modal.innerHTML = content;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Close on overlay click
        if (!options.disableOverlayClose) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        return overlay;
    },

    close() {
        const overlays = document.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => overlay.remove(), 300);
        });
    },

    alert(options) {
        const {
            title = 'Alert',
            message = '',
            type = 'info',
            buttonText = 'OK'
        } = options;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const content = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">
                    ${icons[type] || icons.info}
                </div>
                <h2 style="margin-bottom: 1rem; color: #111827;">
                    ${title}
                </h2>
                <p style="color: #6B7280; white-space: pre-line; margin-bottom: 1.5rem;">
                    ${message}
                </p>
                <button id="modalConfirmBtn" class="btn btn-primary" style="width: 100%;">
                    ${buttonText}
                </button>
            </div>
        `;

        return new Promise((resolve) => {
            this.create(content);
            setTimeout(() => {
                const btn = document.getElementById('modalConfirmBtn');
                if (btn) {
                    btn.onclick = () => {
                        this.close();
                        resolve(true);
                    };
                }
            }, 100);
        });
    },

    confirm(options) {
        const {
            title = 'Confirm',
            message = '',
            confirmText = 'Confirm',
            cancelText = 'Cancel'
        } = options;

        const content = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h2 style="margin-bottom: 1rem; color: #111827;">${title}</h2>
                <p style="color: #6B7280; white-space: pre-line; margin-bottom: 1.5rem;">
                    ${message}
                </p>
                <div style="display: flex; gap: 1rem;">
                    <button id="modalCancelBtn" class="btn btn-outline" style="flex: 1;">
                        ${cancelText}
                    </button>
                    <button id="modalConfirmBtn" class="btn btn-primary" style="flex: 1;">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        return new Promise((resolve) => {
            this.create(content, { disableOverlayClose: true });
            setTimeout(() => {
                const confirmBtn = document.getElementById('modalConfirmBtn');
                const cancelBtn = document.getElementById('modalCancelBtn');
                
                if (confirmBtn) {
                    confirmBtn.onclick = () => {
                        this.close();
                        resolve(true);
                    };
                }
                
                if (cancelBtn) {
                    cancelBtn.onclick = () => {
                        this.close();
                        resolve(false);
                    };
                }
            }, 100);
        });
    },

    loading(message = 'Loading...') {
        const content = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                <p style="color: #6B7280; font-size: 1.1rem;">${message}</p>
            </div>
        `;
        return this.create(content, { disableOverlayClose: true });
    }
};

// Add CSS animations
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Make available globally
if (typeof window !== 'undefined') {
    window.Utils = Utils;
    window.Toast = Toast;
    window.Modal = Modal;
}