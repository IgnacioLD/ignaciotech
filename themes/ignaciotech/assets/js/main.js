// Enhance code blocks with a Copy button
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const burger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  
  if (burger && mobileMenu && mobileOverlay) {
    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('hidden', '');
      mobileOverlay.setAttribute('hidden', '');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    
    const openMenu = () => {
      mobileMenu.classList.add('open');
      mobileMenu.removeAttribute('hidden');
      mobileOverlay.removeAttribute('hidden');
      burger.classList.add('active');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    
    burger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    
    // Close menu when clicking on a link
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        closeMenu();
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });
    
    // Close menu when clicking overlay
    mobileOverlay.addEventListener('click', closeMenu);
    
    // Close menu on window resize if open
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }
  // Make whole cards clickable via data-href, without breaking inner links
  const interactiveSkip = (el) => !!el.closest('a, button, .project-links, .copy-code-btn');
  document.querySelectorAll('.card[data-href], .blog-card[data-href], .featured-project-card[data-href]').forEach((card) => {
    const href = card.getAttribute('data-href');
    // removed pointer-follow glow
    card.addEventListener('click', (e) => {
      if (interactiveSkip(e.target)) return;
      if (window.getSelection && String(window.getSelection())) return;
      window.location.href = href;
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !interactiveSkip(document.activeElement)) {
        window.location.href = href;
      }
    });
  });

  const blocks = document.querySelectorAll('.blog-content pre code, .project-content pre code');
  blocks.forEach((code) => {
    const pre = code.closest('pre');
    if (!pre || pre.dataset.copyAdded) return;
    pre.dataset.copyAdded = 'true';
    pre.classList.add('code-block');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-code-btn';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const text = code.innerText;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
      } catch (e) {
        btn.textContent = 'Error';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      }
    });
    pre.appendChild(btn);
  });

  // Smooth page transitions
  const addPageTransitions = () => {
    // Add loading class to body for fade-in effect
    document.body.classList.add('page-loaded');
    
    // Smooth scroll for internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.hash && link.hostname === location.hostname) {
        e.preventDefault();
        const target = document.querySelector(link.hash);
        if (target) {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }
    });
    
    // Intersection observer for cards fade-in
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.style.opacity = '';
            entry.target.style.transform = '';
          }
        });
      }, { threshold: 0.1, rootMargin: '50px' });

      // Observe cards and sections (exclude blog post content)
      document.querySelectorAll('.card, .content-section:not(.blog-content)').forEach(el => {
        // Skip if this is within a blog post
        if (el.closest('.blog-post, .single-blog')) return;
        // Use CSS classes instead of inline styles to avoid conflicts
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
      });
    }
  };
  
  // Initialize page transitions
  addPageTransitions();
});
