(function() {
  'use strict';
  const utils = {
    throttle(func, delay) {
      let lastCall = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          return func(...args);
        }
      };
    },
    debounce(func, delay) {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    },
    lerp(start, end, factor) {
      return start + (end - start) * factor;
    },
    getMousePos(e, el) {
      const rect = el.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };
  function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);
    const updateProgress = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    };
    window.addEventListener('scroll', utils.throttle(updateProgress, 10));
    updateProgress();
  }
  function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return; 
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    const trail = document.createElement('div');
    trail.id = 'cursor-trail';
    document.body.appendChild(cursor);
    document.body.appendChild(trail);
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let trailX = 0, trailY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursor.classList.contains('active')) {
        cursor.classList.add('active');
      }
    });
    function animateCursor() {
      cursorX = utils.lerp(cursorX, mouseX, 0.2);
      cursorY = utils.lerp(cursorY, mouseY, 0.2);
      trailX = utils.lerp(trailX, mouseX, 0.1);
      trailY = utils.lerp(trailY, mouseY, 0.1);
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      trail.style.left = trailX + 'px';
      trail.style.top = trailY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    const interactiveElements = 'a, button, .gallery-lightbox, .nav-link, .button-2, .button-3';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveElements)) {
        cursor.classList.add('hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveElements)) {
        cursor.classList.remove('hover');
      }
    });
  }
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const particleCount = Math.min(100, Math.floor(canvas.width * canvas.height / 15000));
    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = `rgba(55, 250, 178, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.strokeStyle = `rgba(55, 250, 178, ${(1 - distance / 100) * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
      requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', utils.debounce(() => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }, 250));
  }
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!reveals.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          setTimeout(() => {
            entry.target.classList.add('animation-complete');
          }, 1000);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    reveals.forEach(el => observer.observe(el));
  }
  function initTextReveal() {
    const textElements = document.querySelectorAll('.text-reveal');
    textElements.forEach(element => {
      const text = element.textContent;
      element.textContent = '';
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--char-index', index);
        element.appendChild(span);
      });
    });
  }
  function initRippleEffect() {
    const buttons = document.querySelectorAll('.button-2, .button-3, button');
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        this.appendChild(ripple);
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }
  function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.button-2, .button-3');
    magneticElements.forEach(el => {
      el.classList.add('button-magnetic');
      el.addEventListener('mousemove', function(e) {
        const pos = utils.getMousePos(e, this);
        const rect = this.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = (pos.x - centerX) / 3;
        const deltaY = (pos.y - centerY) / 3;
        this.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });
      el.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(0, 0)';
      });
    });
  }
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      parallaxElements.forEach(el => {
        const speed = el.dataset.parallax || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    };
    window.addEventListener('scroll', utils.throttle(handleScroll, 10));
  }
  function initImageLoading() {
    const images = document.querySelectorAll('.gallery-thumbnail');
    images.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => {
          img.classList.add('loaded');
        });
        img.addEventListener('error', () => {
          console.warn('Image failed to load:', img.src);
          img.classList.add('loaded'); 
        });
      }
    });
  }
  function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', utils.throttle(toggleVisibility, 100));
    toggleVisibility();
  }
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#home') {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else if (href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 100;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }
  function initDynamicTheme() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      document.body.classList.add('night-mode');
    } else if (hour >= 6 && hour < 9) {
      document.body.classList.add('dawn-mode');
    } else if (hour >= 9 && hour < 18) {
      document.body.classList.add('day-mode');
    } else if (hour >= 18 && hour < 21) {
      document.body.classList.add('dusk-mode');
    } else {
      document.body.classList.add('night-mode');
    }
  }
  function init3DTilt() {
    const tiltElements = document.querySelectorAll('.gallery-lightbox');
    tiltElements.forEach(el => {
      el.classList.add('tilt-3d');
      let rafId = null;
      let isAnimating = true;
      
      el.addEventListener('mouseenter', function() {
        isAnimating = true;
        // Let CSS handle the initial lift animation
        this.style.transition = 'transform 0.3s var(--transition-smooth), box-shadow 0.4s var(--transition-smooth)';
        
        // After lift animation completes, enable instant rotation
        setTimeout(() => {
          isAnimating = false;
          this.style.transition = 'box-shadow 0.4s var(--transition-smooth)';
        }, 300);
      });
      
      el.addEventListener('mousemove', function(e) {
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 15;
          const rotateY = (centerX - x) / 15;
          
          // During initial animation, don't override transform
          if (!isAnimating) {
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
          }
        });
      });
      
      el.addEventListener('mouseleave', function() {
        isAnimating = true;
        if (rafId) cancelAnimationFrame(rafId);
        this.style.transition = 'transform 0.4s var(--transition-smooth), box-shadow 0.4s var(--transition-smooth)';
        this.style.transform = '';
      });
    });
  }
  function initSpotlight() {
    const spotlight = document.createElement('div');
    spotlight.id = 'spotlight';
    document.body.appendChild(spotlight);
    let isActive = false;
    document.addEventListener('mousemove', utils.throttle((e) => {
      if (!isActive) {
        spotlight.classList.add('active');
        isActive = true;
      }
      spotlight.style.left = (e.clientX - 250) + 'px';
      spotlight.style.top = (e.clientY - 250) + 'px';
    }, 10));
    document.addEventListener('mouseleave', () => {
      spotlight.classList.remove('active');
      isActive = false;
    });
  }
  function initNavScroll() {
    const nav = document.querySelector('.sticky-nav');
    if (!nav) return;
    const handleScroll = () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', utils.throttle(handleScroll, 50));
    handleScroll();
  }
  function initGalleryStagger() {
    return;
  }
  function initPageTransition() {
    const transition = document.createElement('div');
    transition.className = 'page-transition';
    document.body.appendChild(transition);
    window.addEventListener('load', () => {
      setTimeout(() => {
        transition.classList.add('hidden');
        setTimeout(() => transition.remove(), 500);
      }, 300);
    });
  }
  function initFloatingElements() {
    return;
  }
  function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      element.textContent = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
  function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
      }
      if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (e.key === 'End') {
        e.preventDefault();
        window.scrollTo({ 
          top: document.documentElement.scrollHeight, 
          behavior: 'smooth' 
        });
      }
    });
  }
  function initPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', entry.duration + 'ms');
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
      }
    }
  }
  function initReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      document.body.style.setProperty('--transition-smooth', 'none');
      document.body.style.setProperty('--transition-bounce', 'none');
    }
  }
  function syncFooterLinks() {
    const headerNav = document.querySelector('.nav-grid');
    const footerLinks = document.getElementById('footer-social-links');
    if (!headerNav || !footerLinks) return;
    const navLinks = Array.from(headerNav.querySelectorAll('li')).filter(li => {
      const link = li.querySelector('a');
      const isLogo = link && link.classList.contains('nav-logo-link');
      const isHireMe = link && link.getAttribute('href') === '#terms';
      const isHidden = li.style.display === 'none' || window.getComputedStyle(li).display === 'none';
      return link && !isLogo && !isHireMe && !isHidden;
    });
    navLinks.forEach(li => {
      const originalLink = li.querySelector('a');
      const clonedLi = document.createElement('li');
      const clonedLink = document.createElement('a');
      clonedLink.href = originalLink.href;
      clonedLink.textContent = originalLink.textContent;
      clonedLink.target = originalLink.target;
      clonedLink.className = 'footer-link';
      clonedLi.appendChild(clonedLink);
      footerLinks.appendChild(clonedLi);
    });
  }
  function initPaletteSwitcher() {
    const savedTheme = localStorage.getItem('color-theme') || 'green';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const paletteOptions = document.querySelectorAll('.palette-option');
    paletteOptions.forEach(option => {
      if (option.getAttribute('data-palette') === savedTheme) {
        option.classList.add('active');
      }
      option.addEventListener('click', function() {
        const palette = this.getAttribute('data-palette');
        document.documentElement.setAttribute('data-theme', palette);
        localStorage.setItem('color-theme', palette);
        paletteOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    initReducedMotion();
    initPaletteSwitcher();
    syncFooterLinks();
    initPageTransition();
    initScrollProgress();
    initCustomCursor();
    initParticles();
    initScrollReveal();
    initTextReveal();
    initRippleEffect();
    initMagneticButtons();
    initParallax();
    initImageLoading();
    initBackToTop();
    initSmoothScroll();
    initDynamicTheme();
    init3DTilt();
    initSpotlight();
    initNavScroll();
    initGalleryStagger();
    initFloatingElements();
    initKeyboardNav();
    initPerformanceMonitoring();
    console.log('%cEnhancements Loaded', 'color: #37fab2; font-size: 16px; font-weight: bold;');
  }
  init();
  window.modernUtils = utils;
})();