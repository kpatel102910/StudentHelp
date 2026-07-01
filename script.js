// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    updateThemeIcon() {
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.hamburger.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Set active nav link based on current page
        this.setActiveNavLink();
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
    }

    setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
}

// Animation Manager
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.observeElements();
        this.addScrollAnimations();
    }

    observeElements() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.animate-fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    addScrollAnimations() {
        let lastScrollY = window.scrollY;
        const header = document.querySelector('.nav-header');

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }
}

// Videos Page Filter
class VideoFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.videoCards = document.querySelectorAll('.video-card');
        this.init();
    }

    init() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => this.filterVideos(button));
        });
    }

    filterVideos(activeButton) {
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');

        const subject = activeButton.dataset.subject;
        
        // Filter videos with animation
        this.videoCards.forEach((card, index) => {
            const cardSubject = card.dataset.subject;
            
            setTimeout(() => {
                if (subject === 'all' || cardSubject === subject) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out forwards';
                } else {
                    card.style.animation = 'fadeOut 0.3s ease-out forwards';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            }, index * 50);
        });
    }
}

// FAQ Accordion
class FAQAccordion {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => this.toggleItem(item));
        });
    }

    toggleItem(currentItem) {
        const isActive = currentItem.classList.contains('active');
        
        // Close all items
        this.faqItems.forEach(item => {
            item.classList.remove('active');
        });

        // Open current item if it wasn't active
        if (!isActive) {
            currentItem.classList.add('active');
        }
    }
}

// Form Handlers
class FormHandler {
    constructor() {
        this.requestForm = document.getElementById('requestForm');
        this.contactForm = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (this.requestForm) {
            this.requestForm.addEventListener('submit', (e) => this.handleRequestForm(e));
        }
        
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }
    }

    async handleRequestForm(e) {
        e.preventDefault();
        
        const formData = new FormData(this.requestForm);
        const data = Object.fromEntries(formData);
        
        // Save to database
        const success = await this.saveSubmission('request', data);
        
        if (success) {
            // Show success message
            const successMessage = document.getElementById('successMessage');
            const formContainer = document.querySelector('.request-form-container');
            
            formContainer.style.display = 'none';
            successMessage.style.display = 'block';
            successMessage.style.animation = 'fadeInUp 0.5s ease-out forwards';
            
            // Reset form
            this.requestForm.reset();
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert('Failed to save request. Please try again.');
        }
    }

    async handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(this.contactForm);
        const data = Object.fromEntries(formData);
        
        // Save to database
        const success = await this.saveSubmission('request', data);
        
        if (success) {
            // Show success message
            const successMessage = document.getElementById('contactSuccessMessage');
            const form = document.querySelector('.contact-form');
            
            form.style.display = 'none';
            successMessage.style.display = 'block';
            successMessage.style.animation = 'fadeInUp 0.5s ease-out forwards';
            
            // Reset form
            this.contactForm.reset();
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert('Failed to save request. Please try again.');
        }
    }

    async saveSubmission(type, data) {
        try {
            const submission = {
                type: type,
                name: data.name,
                subject: data.subject,
                topic: data.topic,
                description: data.description
            };
            
            // Use Supabase database to save
            const success = await window.supabaseDatabase.saveSubmission(submission);
            
            if (success) {
                console.log('Submission saved to database:', submission);
                return true;
            } else {
                console.error('Failed to save submission');
                return false;
            }
        } catch (error) {
            console.error('Error saving submission:', error);
            return false;
        }
    }
}

// Video Card Interactions
class VideoCardHandler {
    constructor() {
        this.videoCards = document.querySelectorAll('.video-card');
        this.init();
    }

    init() {
        this.videoCards.forEach(card => {
            card.addEventListener('click', () => this.handleVideoClick(card));
        });
    }

    handleVideoClick(card) {
        const title = card.querySelector('h3').textContent;
        console.log(`Video clicked: ${title}`);
        
        // Add click animation
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = 'pulse 0.3s ease-out';
        }, 10);
        
        // In a real application, this would open the video player
        // For demo purposes, we'll just show a message
        this.showVideoMessage(title);
    }

    showVideoMessage(title) {
        // Create a temporary message
        const message = document.createElement('div');
        message.className = 'video-message';
        message.innerHTML = `
            <div class="video-message-content">
                <h3>🎥 ${title}</h3>
                <p>This would open the video player in a real application.</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        // Style the message
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 2rem;
            z-index: 10000;
            box-shadow: var(--shadow-xl);
            animation: fadeInUp 0.3s ease-out forwards;
            max-width: 400px;
            text-align: center;
        `;
        
        document.body.appendChild(message);
    }
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    .video-message-content h3 {
        margin-bottom: 1rem;
        color: var(--text-primary);
    }
    
    .video-message-content p {
        margin-bottom: 1.5rem;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    const themeManager = new ThemeManager();
    const navigationManager = new NavigationManager();
    const animationManager = new AnimationManager();
    const formHandler = new FormHandler();
    
    // Initialize page-specific components
    if (document.querySelector('.filter-btn')) {
        new VideoFilter();
    }
    
    if (document.querySelector('.faq-item')) {
        new FAQAccordion();
    }
    
    if (document.querySelector('.video-card')) {
        new VideoCardHandler();
    }
    
    // Add loading animation removal
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Add smooth reveal animations for page load
window.addEventListener('load', () => {
    const elements = document.querySelectorAll('.animate-fade-in');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Add parallax effect to hero section (if it exists)
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        const parallax = hero.querySelector('.hero-content');
        if (parallax) {
            const speed = 0.5;
            parallax.style.transform = `translateY(${scrolled * speed}px)`;
        }
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        const hamburger = document.getElementById('hamburger');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
    
    // Tab navigation for forms
    if (e.key === 'Tab') {
        // Let browser handle tab navigation naturally
        return;
    }
});

// Performance optimization: Debounce scroll events
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

// Apply debouncing to scroll events
const debouncedScroll = debounce(() => {
    // Scroll-related optimizations
}, 100);

window.addEventListener('scroll', debouncedScroll);

// Add touch support for mobile devices
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('.btn, .filter-btn, .faq-question');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}

// Console message for developers
console.log('%c🎓 Student Academic Help', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%cBuilt by students, for students 🚀', 'color: #8b5cf6; font-size: 14px;');
