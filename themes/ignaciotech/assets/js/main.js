// Enhance code blocks with a Copy button
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const burger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('hidden', '');
      burger.setAttribute('aria-expanded', 'false');
    };
    const openMenu = () => {
      mobileMenu.classList.add('open');
      mobileMenu.removeAttribute('hidden');
      burger.setAttribute('aria-expanded', 'true');
    };
    burger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) closeMenu(); else openMenu();
    });
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('open')) return;
      const t = e.target;
      if (!t.closest('#mobile-menu') && !t.closest('#hamburger')) {
        closeMenu();
      }
    }, { capture: true });
  }
  // Make whole cards clickable via data-href, without breaking inner links
  const interactiveSkip = (el) => !!el.closest('a, button, .project-links, .copy-code-btn');
  document.querySelectorAll('.card[data-href]').forEach((card) => {
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

  // Reveal on scroll animations
  const revealTargets = [
    ...document.querySelectorAll('.card'),
    ...document.querySelectorAll('.timeline-item'),
    ...document.querySelectorAll('.projects-section'),
    ...document.querySelectorAll('.blog-nav-link')
  ];
  revealTargets.forEach(el => el.classList.add('reveal-on-scroll'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  revealTargets.forEach(el => io.observe(el));
});
