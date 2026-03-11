/**
 * Synapsis AI - Main JavaScript
 * Handles navigation, testimonials slider, and scroll effects
 */

(function() {
    'use strict';

    // ==========================================
    // Mobile Navigation
    // ==========================================
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // ==========================================
    // Smooth Scroll for anchor links
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // Testimonials Slider
    // ==========================================
    const slider = {
        track: document.querySelector('.testimonials-track'),
        dots: document.querySelectorAll('.slider-dots .dot'),
        prevBtn: document.querySelector('.slider-btn.prev'),
        nextBtn: document.querySelector('.slider-btn.next'),
        currentSlide: 0,
        totalSlides: 3,
        autoplayInterval: null,

        init() {
            if (!this.track) return;
            
            this.bindEvents();
            this.startAutoplay();
            this.updateSlider();
        },

        bindEvents() {
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.prev();
                    this.resetAutoplay();
                });
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.next();
                    this.resetAutoplay();
                });
            }

            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    this.goToSlide(index);
                    this.resetAutoplay();
                });
            });

            // Pause autoplay on hover
            const sliderContainer = document.querySelector('.testimonials-slider');
            if (sliderContainer) {
                sliderContainer.addEventListener('mouseenter', () => this.stopAutoplay());
                sliderContainer.addEventListener('mouseleave', () => this.startAutoplay());
            }

            // Touch support
            let touchStartX = 0;
            let touchEndX = 0;

            if (this.track) {
                this.track.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                this.track.addEventListener('touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    this.handleSwipe(touchStartX, touchEndX);
                }, { passive: true });
            }
        },

        handleSwipe(startX, endX) {
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
                this.resetAutoplay();
            }
        },

        updateSlider() {
            if (this.track) {
                this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
            }

            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentSlide);
                dot.setAttribute('aria-selected', index === this.currentSlide);
            });
        },

        next() {
            this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
            this.updateSlider();
        },

        prev() {
            this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
            this.updateSlider();
        },

        goToSlide(index) {
            this.currentSlide = index;
            this.updateSlider();
        },

        startAutoplay() {
            this.autoplayInterval = setInterval(() => this.next(), 5000);
        },

        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
            }
        },

        resetAutoplay() {
            this.stopAutoplay();
            this.startAutoplay();
        }
    };

    slider.init();

    // ==========================================
    // Navbar scroll effect
    // ==========================================
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // ==========================================
    // Intersection Observer for fade-in animations
    // ==========================================
    const fadeElements = document.querySelectorAll('.service-card, .about-card, .testimonial-card');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in', 'visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => {
        el.classList.add('fade-in');
        fadeObserver.observe(el);
    });

    // ==========================================
    // Active navigation link on scroll
    // ==========================================
    const sections = document.querySelectorAll('section[id], header[id]');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3
    });

    sections.forEach(section => navObserver.observe(section));

})();