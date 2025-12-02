/**
 * SCROLL-ANIMATIONS.JS
 * Modern scroll animations and interactions
 */

// ============================================
// INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all animations
    initScrollAnimations();
    initSmoothScroll();
    initParallaxEffects();
    initCounterAnimations();
    initNavbarScroll();
    initHoverEffects();
    initLoadingAnimations();
});

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');

                // Unobserve after animation to improve performance
                if (!entry.target.classList.contains('repeat-animation')) {
                    observer.unobserve(entry.target);
                }
            } else if (entry.target.classList.contains('repeat-animation')) {
                entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    // Make observer globally available
    window.scrollObserver = observer;

    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .stagger-children');
    animatedElements.forEach(el => observer.observe(el));

    // Manually trigger for elements already in viewport
    setTimeout(() => {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 0;
            if (isInView) {
                el.classList.add('is-visible');
            }
        });

        // Also check stagger-children
        const staggerElements = document.querySelectorAll('.stagger-children');
        staggerElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 0;
            if (isInView) {
                el.classList.add('is-visible');
            }
        });
    }, 100);

    // Auto-add animation classes to common elements
    const autoAnimateSelectors = [
        '.feature-card',
        '.event-card',
        '.category-card',
        '.stat-card',
        '.section-header',
        '.cta-content'
    ];

    autoAnimateSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            if (!el.classList.contains('animate-on-scroll')) {
                el.classList.add('animate-on-scroll');
                el.style.transitionDelay = `${index * 0.1}s`;
                observer.observe(el);
            }
        });
    });

    // Stagger grid children
    const grids = document.querySelectorAll('.events-grid, .features-grid, .categories-grid');
    grids.forEach(grid => {
        if (!grid.classList.contains('stagger-children')) {
            grid.classList.add('stagger-children');
            observer.observe(grid);
        }
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or "javascript:"
            if (href === '#' || href.startsWith('javascript:')) {
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Add a pulse effect to the target
                target.classList.add('animate-pulse');
                setTimeout(() => target.classList.remove('animate-pulse'), 1000);
            }
        });
    });
}

// ============================================
// PARALLAX EFFECTS
// ============================================

function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax, .hero-background');
    
    if (parallaxElements.length === 0) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                
                parallaxElements.forEach(el => {
                    const speed = el.dataset.parallaxSpeed || 0.5;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================
// COUNTER ANIMATIONS
// ============================================

function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number, .stat-card-value');
    
    const observerOptions = {
        threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
                entry.target.classList.add('counted');
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
    const text = element.textContent.trim();
    const hasRp = text.includes('Rp');
    const numericText = text.replace(/[^0-9]/g, '');
    const target = parseInt(numericText) || 0;
    
    if (target === 0) return;
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
            current = target;
            clearInterval(timer);
        }

        const displayValue = Math.floor(current);
        if (hasRp) {
            element.textContent = `Rp ${displayValue.toLocaleString('id-ID')}`;
        } else {
            element.textContent = displayValue.toLocaleString('id-ID');
        }
    }, duration / steps);
}

// ============================================
// NAVBAR SCROLL EFFECTS
// ============================================

function initNavbarScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;

                // Add shadow on scroll
                if (currentScroll > 10) {
                    header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    header.style.boxShadow = '';
                }

                // Hide/show navbar on scroll (optional)
                // if (currentScroll > lastScroll && currentScroll > 100) {
                //     header.style.transform = 'translateY(-100%)';
                // } else {
                //     header.style.transform = 'translateY(0)';
                // }

                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================
// HOVER EFFECTS & INTERACTIONS
// ============================================

function initHoverEffects() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn, .filter-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Card tilt effect on mouse move
    const cards = document.querySelectorAll('.event-card, .feature-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ============================================
// LOADING ANIMATIONS
// ============================================

function initLoadingAnimations() {
    // Page loaded animation
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Trigger hero animations
        const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-buttons, .hero-stats');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 150);
        });
    });

    // Add loading states to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.complete) {
            img.classList.add('loading');
            img.addEventListener('load', () => {
                img.classList.remove('loading');
                img.classList.add('loaded');
            });
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// ADDITIONAL CSS FOR RIPPLE EFFECT
// ============================================

// Add this style dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    img.loading {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    img.loaded {
        opacity: 1;
        animation: fadeIn 0.5s ease;
    }
    
    body.loaded {
        animation: fadeIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// ============================================
// EXPORT FOR MODULE USE
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initScrollAnimations,
        initSmoothScroll,
        initParallaxEffects,
        initCounterAnimations,
        initNavbarScroll,
        initHoverEffects,
        initLoadingAnimations
    };
}