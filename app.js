(() => {
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.2;
    let currentX = targetX;
    let currentY = targetY;
    let animationFrame;
    const renderGlow = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      cursorGlow.style.setProperty('--cursor-x', `${currentX}px`);
      cursorGlow.style.setProperty('--cursor-y', `${currentY}px`);
      animationFrame = requestAnimationFrame(renderGlow);
    };
    const handlePointerMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursorGlow.classList.add('is-visible');
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    animationFrame = requestAnimationFrame(renderGlow);
    window.addEventListener('pagehide', () => cancelAnimationFrame(animationFrame), { once: true });
  }

  const nicheSubcategories = {
    'Beauty & Personal Care': [],
    'Fashion & Apparel': [],
    Gadgets: [],
    Fitness: []
  };
  const nicheStructure = document.getElementById('niche-subcategories');
  const navigation = document.querySelector('header nav');
  if (navigation) {
    ['home', 'services', 'work', 'about', 'facts', 'contact'].forEach((path) => {
      const link = navigation.querySelector(`a[data-path="${path}"]`);
      if (!link) return;
      if (path === 'contact') {
        link.textContent = 'Contact Us';
        link.href = '#get-started';
      }
      navigation.append(link);
    });
  }
  document.querySelectorAll('#services a[href="#work"]').forEach((link) => {
    link.href = '#work';
  });
  document.querySelectorAll('a[data-path="contact"]').forEach((link) => {
    link.textContent = 'Contact Us';
    link.href = '#get-started';
  });
  const footerServices = [...document.querySelectorAll('footer span')].find((item) => item.textContent.trim() === 'Creative Services');
  footerServices?.parentElement?.querySelectorAll('a[href="#"]').forEach((link) => {
    link.href = '#services';
  });
  if (nicheStructure) {
    const nicheSubcategoryStyles = document.createElement('style');
    nicheSubcategoryStyles.textContent = '#niche-subcategories{width:100%;min-width:0;max-width:100%}.niche-subcategory-viewport{width:100%;overflow-x:auto;overflow-y:hidden;padding:.25rem 0 .5rem}.niche-subcategory-tabs{display:grid;grid-template-columns:minmax(0,1fr) minmax(32px,1fr) minmax(0,1fr) minmax(32px,1fr) minmax(0,1fr);align-items:center;width:100%;max-width:900px;margin:0 auto}.niche-subcategory-item{display:flex;align-items:center;min-width:0}.niche-subcategory-item .subcategory-tab{position:relative;display:inline-flex;align-items:center;justify-content:center;width:100%;padding:.5rem .75rem;font-size:.875rem;line-height:1.25rem}.niche-subcategory-item .subcategory-tab::before{content:"";width:6px;height:6px;flex:0 0 auto;margin-right:.5rem;border:1px solid currentColor;border-radius:9999px;opacity:.8;transition:background-color .25s ease,box-shadow .25s ease}.niche-subcategory-item .subcategory-tab[aria-selected="true"]::before{background:#00f0d0;box-shadow:0 0 10px rgba(0,240,208,.55)}.niche-subcategory-connector{height:1px;width:100%;background:linear-gradient(90deg,rgba(0,240,208,.45),rgba(132,148,143,.35),rgba(0,240,208,.45));opacity:.7;transition:opacity .25s ease}.niche-subcategory-viewport::-webkit-scrollbar{display:none}@media (max-width:640px){.niche-subcategory-tabs{min-width:560px;margin:0}.niche-subcategory-item .subcategory-tab{padding-inline:.5rem;font-size:.8125rem}.niche-subcategory-connector{min-width:24px}}';
    document.head.append(nicheSubcategoryStyles);
  }
  const videoCards = [...document.querySelectorAll('[data-video-container^="portfolio-"]')];
  const videoLightbox = document.getElementById('video-lightbox');
  const videoModalPlayer = document.getElementById('video-modal-player');
  const videoModalSource = document.getElementById('video-modal-source');
  const closeVideoModal = document.getElementById('close-video-modal');
  const portfolioSliderStyles = document.createElement('style');
  portfolioSliderStyles.textContent = '.portfolio-slider{position:relative;overflow:hidden}.portfolio-slider-track{display:flex;gap:1.5rem;transition:transform .35s ease;touch-action:pan-y;user-select:none}.portfolio-card-shell{flex:0 0 calc((100% - (var(--slides-per-view) - 1) * 1.5rem) / var(--slides-per-view));max-width:calc((100% - (var(--slides-per-view) - 1) * 1.5rem) / var(--slides-per-view));}.portfolio-slider-control{display:inline-flex;align-items:center;justify-content:center;width:2.5rem;height:2.5rem;border-radius:9999px;background:rgba(28,31,40,.9);border:1px solid rgba(0,240,208,.25);color:#e0e2ee;transition:all .2s ease}.portfolio-slider-control:hover{background:rgba(0,240,208,.12);border-color:rgba(0,240,208,.5);transform:translateY(-1px)}.portfolio-slider-control:disabled{opacity:.35;cursor:not-allowed}.portfolio-slider-control:disabled:hover{transform:none}.video-modal-open{overflow:hidden}.video-lightbox{opacity:0;transition:opacity .2s ease}.video-lightbox.flex{opacity:1}.video-lightbox-panel{transform:translateY(12px) scale(.98);opacity:0;transition:transform .25s ease,opacity .25s ease}.video-lightbox.flex .video-lightbox-panel{transform:translateY(0) scale(1);opacity:1}@media (max-width:768px){.portfolio-card-shell{flex-basis:100%;max-width:100%}}';
  document.head.append(portfolioSliderStyles);
  const allSlider = document.querySelector('.portfolio-slider[data-slider="all"]');
  const allTrack = allSlider?.querySelector('.portfolio-slider-track');
  document.querySelectorAll('#fashion-apparel .portfolio-card-shell, #fitness .portfolio-card-shell').forEach((card) => {
    if (allTrack) allTrack.append(card);
  });
  document.querySelector('#fashion-apparel')?.remove();
  document.querySelector('#fitness')?.remove();
  const portfolioSliders = allSlider ? [allSlider] : [];
  const nicheAliases = {
    'beauty & skincare': 'Beauty & Personal Care',
    technology: 'Gadgets',
    'health & wellness': 'Fitness'
  };
  function closeVideoPlayer() {
    if (videoModalPlayer) {
      videoModalPlayer.pause();
      videoModalPlayer.removeAttribute('src');
      if (videoModalSource) videoModalSource.removeAttribute('src');
      videoModalPlayer.load();
    }
    if (videoLightbox) {
      videoLightbox.classList.add('hidden');
      videoLightbox.classList.remove('flex');
      videoLightbox.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('video-modal-open');
  }
  function openVideoPlayer(card) {
    if (!card || !videoModalPlayer || !videoLightbox) return;
    const videoPath = card.dataset.videoSrc;
    if (!videoPath) return;
    const videoUrl = new URL(videoPath, document.baseURI).href;
    videoModalPlayer.pause();
    videoModalPlayer.removeAttribute('src');
    if (videoModalSource) videoModalSource.removeAttribute('src');
    videoModalPlayer.load();
    if (videoModalSource) videoModalSource.src = videoUrl;
    videoModalPlayer.controls = true;
    videoLightbox.classList.remove('hidden');
    videoLightbox.classList.add('flex');
    videoLightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('video-modal-open');
    const startPlayback = () => {
      videoModalPlayer.play().catch(() => {});
      videoModalPlayer.removeEventListener('loadedmetadata', startPlayback);
    };
    videoModalPlayer.addEventListener('loadedmetadata', startPlayback, { once: true });
    videoModalPlayer.load();
  }
  if (closeVideoModal) {
    closeVideoModal.addEventListener('click', closeVideoPlayer);
  }
  if (videoLightbox) {
    videoLightbox.addEventListener('click', (event) => {
      if (event.target === videoLightbox) closeVideoPlayer();
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && videoLightbox?.classList.contains('flex')) closeVideoPlayer();
  });

  function updatePortfolioSliders() {
    portfolioSliders.forEach((slider) => {
      const cards = [...slider.querySelectorAll('.portfolio-card-shell:not(.hidden)')];
      if (!cards.length) return;
      const visible = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
      slider.style.setProperty('--slides-per-view', String(visible));
      const maxIndex = Math.max(0, cards.length - visible);
      const current = Math.min(Number(slider.dataset.index || '0'), maxIndex);
      slider.dataset.index = String(current);
      const track = slider.querySelector('.portfolio-slider-track');
      if (!track) return;
      const offset = (cards[0].offsetWidth + 24) * current;
      track.style.transform = `translateX(-${offset}px)`;
      const prev = slider.querySelector('[data-slide="prev"]');
      const next = slider.querySelector('[data-slide="next"]');
      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current >= maxIndex;
    });
  }

  portfolioSliders.forEach((slider) => {
    const track = slider.querySelector('.portfolio-slider-track');
    if (!track) return;
    slider.dataset.index = '0';
    slider.querySelectorAll('[data-slide]').forEach((button) => {
      button.addEventListener('click', () => {
        const cards = [...slider.querySelectorAll('.portfolio-card-shell:not(.hidden)')];
        const current = Number(slider.dataset.index || '0');
        const visible = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
        const maxIndex = Math.max(0, cards.length - visible);
        const direction = button.dataset.slide === 'next' ? 1 : -1;
        const nextIndex = Math.min(maxIndex, Math.max(0, current + direction));
        slider.dataset.index = String(nextIndex);
        updatePortfolioSliders();
      });
    });
    let startX = 0;
    track.addEventListener('pointerdown', (event) => {
      startX = event.clientX;
    });
    track.addEventListener('pointerup', (event) => {
      const distance = event.clientX - startX;
      if (Math.abs(distance) < 40) return;
      const direction = distance < 0 ? 'next' : 'prev';
      slider.querySelector(`[data-slide="${direction}"]`)?.click();
    });
  });

  window.addEventListener('resize', updatePortfolioSliders);
  updatePortfolioSliders();

  videoCards.forEach((card) => {
    const category = card.querySelector('span[class*="uppercase"]')?.textContent.trim().toLowerCase() || '';
    const wrapper = card.closest('.group');
    if (wrapper) {
      wrapper.dataset.niche = nicheAliases[category] || wrapper.dataset.niche || '';
      wrapper.dataset.subcategory = wrapper.dataset.subcategory || '';
    }
  });

  const form = document.getElementById('lead-form');
  const success = document.getElementById('form-success');

  document.querySelectorAll('#portfolio-filters .filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.textContent.trim();
      if (nicheStructure) {
        const subcategories = nicheSubcategories[filter] || [];
        nicheStructure.innerHTML = filter === 'All' || !subcategories.length ? '' : `<div class="niche-subcategory-viewport"><div class="niche-subcategory-tabs" role="tablist" aria-label="${filter} subcategories">${subcategories.map((subcategory, index) => `${index > 0 ? '<span class="niche-subcategory-connector" aria-hidden="true"></span>' : ''}<div class="niche-subcategory-item"><button type="button" class="subcategory-tab font-label-sm text-xs transition-colors ${index === 0 ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'}" data-subcategory="${subcategory}" role="tab" aria-selected="${index === 0}">${subcategory}</button></div>`).join('')}</div></div>`;
        nicheStructure.querySelectorAll('.subcategory-tab').forEach((tab) => {
          tab.addEventListener('click', () => {
            nicheStructure.querySelectorAll('.subcategory-tab').forEach((item) => {
              item.classList.toggle('text-primary-container', item === tab);
              item.classList.toggle('border-b', item === tab);
              item.classList.toggle('border-primary-container', item === tab);
              item.classList.toggle('text-on-surface-variant', item !== tab);
              item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
            });
            filterVideos(filter, tab.dataset.subcategory);
          });
        });
      }
      filterVideos(filter);
    });
  });

  function filterVideos(niche, subcategory) {
      document.querySelectorAll('#portfolio-filters .filter-btn').forEach((item) => {
        item.classList.toggle('active', item.textContent.trim() === niche);
        item.classList.toggle('bg-primary-container', item.textContent.trim() === niche);
        item.classList.toggle('text-on-primary-container', item.textContent.trim() === niche);
        item.classList.toggle('bg-surface-container', item.textContent.trim() !== niche);
        item.classList.toggle('text-on-surface-variant', item.textContent.trim() !== niche);
      });

      videoCards.forEach((card) => {
        const wrapper = card.closest('.group');
        const visible = niche === 'All' || (wrapper?.dataset.niche === niche && (!subcategory || wrapper.dataset.subcategory === subcategory));
        if (wrapper) wrapper.classList.toggle('hidden', !visible);
      });
      if (allSlider) {
        allSlider.dataset.index = '0';
        updatePortfolioSliders();
      }
  }

  document.addEventListener('click', (event) => {
    const card = event.target.closest('[data-video-src].video-card');
    if (!card || !videoModalPlayer || !videoLightbox) return;
    event.preventDefault();
    event.stopPropagation();
    openVideoPlayer(card);
  });
  document.querySelectorAll('[data-video-src].video-card .video-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openVideoPlayer(trigger.closest('[data-video-src].video-card'));
    });
  });
  document.querySelector('.hero-video-trigger')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openVideoPlayer(document.querySelector('[data-video-container="hero-ad"]'));
  });

  if (form && success) {
    form.onsubmit = null;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const productDescriptionValue = form.querySelector('[name="productDescription"]')?.value.trim() || '';
      const phone = form.querySelector('[name="phone"]')?.value.trim() || '';
      const productUrl = form.querySelector('[name="productUrl"]')?.value.trim() || '';
      const website = form.querySelector('[name="website"]')?.value.trim() || '';
      const spend = form.querySelector('select')?.value || '';
      const customSpend = form.querySelector('[name="customSpend"]')?.value.trim() || '';
      const productDescription = [
        productDescriptionValue,
        phone && `Phone: ${phone}`,
        productUrl && `Product URL: ${productUrl}`,
        website && `Website: ${website}`
      ].filter(Boolean).join('\n\n') || 'No product details provided yet.';
      const lead = { name, email, productDescription, spend, customSpend };
      if (window.location.protocol === 'file:') {
        window.alert('Please run the website with "npm start" before submitting this form.');
        return;
      }

      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Lead submission failed.');
      } catch (error) {
        window.alert(error.message || 'Your request could not be sent. Check the server SMTP configuration and try again.');
        return;
      }

      form.classList.add('hidden');
      success.classList.remove('hidden');
    });
  }

  const authLinks = document.querySelectorAll('a[data-path="login"], a[data-path="sign-up"]');
  const authStyles = document.createElement('style');
  authStyles.textContent = '.authenticated-user{color:#00f0d0!important;font-weight:700;text-shadow:0 0 14px rgba(0,240,208,.28)}.auth-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:rgba(5,8,16,.78);backdrop-filter:blur(12px)}.auth-modal{width:min(100%,460px);padding:28px;border:1px solid rgba(0,240,208,.28);border-radius:16px;background:#1c1f28;color:#e0e2ee;box-shadow:0 24px 80px rgba(0,0,0,.55)}.auth-modal h2{margin:0;color:#e0e2ee}.auth-modal label{display:grid;gap:6px;color:#b9cac4;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em}.auth-modal input{width:100%;padding:13px 15px;border:1px solid #3a4a46;border-radius:8px;background:#0b0e16;color:#e0e2ee;font:inherit}.auth-modal input:focus{outline:2px solid rgba(0,240,208,.45);outline-offset:1px;border-color:#00f0d0}.auth-modal form{display:grid;gap:14px;margin-top:20px}.auth-error{min-height:20px;color:#ffb4ab;font-size:13px}.auth-success{color:#00f0d0;font-size:13px}.auth-close{float:right;background:transparent;color:#b9cac4;padding:4px 8px;font-size:20px}.auth-close:hover{color:#00f0d0}.auth-submit{width:100%;padding:13px 16px;border:0;border-radius:999px;background:#00f0d0;color:#00382f;font-weight:700;cursor:pointer;box-shadow:0 0 20px rgba(0,240,208,.35);transition:transform .2s ease,box-shadow .2s ease,opacity .2s ease}.auth-submit:hover:not(:disabled){background:#30fddd;box-shadow:0 0 28px rgba(0,240,208,.55);transform:translateY(-1px)}.auth-submit:disabled{opacity:.8;cursor:wait}.password-wrap{position:relative}.password-wrap input{padding-right:52px}.password-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);padding:7px;background:transparent;color:#84948f}.password-toggle:hover{color:#00f0d0}.auth-link{padding:0;background:transparent;color:#00f0d0;font-size:13px;text-align:right;cursor:pointer}.auth-link:hover{text-decoration:underline}.auth-actions{display:flex;justify-content:space-between;align-items:center;gap:12px}.auth-countdown{color:#b9cac4;font-size:13px}.auth-hint{color:#b9cac4;font-size:13px;line-height:1.5}.password-strength{color:#b9cac4;font-size:12px}.account-record{border:1px solid rgba(0,240,208,.18);background:rgba(28,31,40,.78);border-radius:12px;padding:18px}.account-status{color:#00f0d0;text-transform:capitalize}.account-hero{position:relative;overflow:hidden;border:1px solid rgba(0,240,208,.22);border-radius:20px;padding:clamp(24px,5vw,56px);background:linear-gradient(135deg,rgba(38,42,51,.98),rgba(16,19,28,.96));box-shadow:0 24px 70px rgba(0,0,0,.28)}.account-hero::after{content:"";position:absolute;right:-90px;top:-120px;width:300px;height:300px;border:1px solid rgba(0,240,208,.16);border-radius:50%;box-shadow:0 0 0 28px rgba(0,240,208,.035),0 0 0 56px rgba(0,240,208,.025);pointer-events:none}.account-welcome{position:relative;z-index:1;max-width:760px;font-size:clamp(2.2rem,5vw,4.8rem);line-height:1.02;letter-spacing:-.02em}.account-welcome-name{color:#00f0d0}.account-intro{position:relative;z-index:1;max-width:620px}.account-email{overflow-wrap:anywhere}';
  document.head.append(authStyles);

  function updateAuthenticatedNav(user) {
    const loginLink = document.querySelector('a[data-path="login"]');
    const signupLink = document.querySelector('a[data-path="sign-up"]');
    if (!loginLink || !signupLink) return;
    loginLink.textContent = user ? `Welcome ${user.name}` : 'Login';
    loginLink.classList.toggle('authenticated-user', Boolean(user));
    loginLink.title = user ? `Signed in as ${user.name}` : '';
    loginLink.href = user ? '#account' : '#';
    loginLink.dataset.authenticated = user ? 'true' : 'false';
    signupLink.textContent = user ? 'Log out' : 'Sign Up';
    signupLink.href = '#';
    signupLink.dataset.authenticated = user ? 'true' : 'false';
    signupLink.dataset.action = user ? 'logout' : 'signup';
    signupLink.classList.remove('hidden');
  }

  function maskEmail(email) {
    const [localPart, domain] = String(email || '').split('@');
    if (!localPart || !domain) return '';
    const visibleCharacters = Math.min(6, Math.max(2, Math.ceil(localPart.length / 2)));
    return `${localPart.slice(0, visibleCharacters)}***@${domain}`;
  }

  async function loadAccount(user) {
    updateAuthenticatedNav(user);
    const target = document.getElementById('get-started');
    if (!target) return;
    document.getElementById('account')?.remove();
    const accountSection = document.createElement('section');
    accountSection.id = 'account';
    accountSection.className = 'py-space-3xl lg:py-space-4xl bg-surface relative';
    accountSection.innerHTML = '<div class="max-w-[1240px] mx-auto px-gutter-desktop"><div class="account-hero mb-space-xl"><span class="relative z-10 font-label-sm text-label-sm text-primary uppercase tracking-widest">YOUR CLIENT PORTAL</span><h2 class="account-welcome text-on-surface mt-space-md">Welcome back, <span class="account-welcome-name"></span>.</h2><p class="account-intro font-body-lg text-body-lg text-on-surface-variant mt-space-md">You are securely signed in to your personal INKNOVIO TECH workspace. Your account and project activity are ready whenever you are.</p></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-space-lg"><div class="account-record lg:col-span-1"><span class="font-label-sm text-primary uppercase tracking-wider">Account</span><h3 class="font-headline-sm text-on-surface mt-space-sm account-email"></h3><p class="font-body-sm text-on-surface-variant mt-space-xs">Member since <span class="account-date"></span></p></div><div class="account-record lg:col-span-2"><div class="flex items-center justify-between gap-space-md"><div><span class="font-label-sm text-primary uppercase tracking-wider">Client activity</span><h3 class="font-headline-sm text-on-surface mt-space-sm">Projects and requests</h3></div><span class="account-status font-label-sm"></span></div><div class="account-projects grid gap-space-sm mt-space-md"></div></div></div></div>';
    target.parentNode.insertBefore(accountSection, target);
    accountSection.querySelector('.account-welcome-name').textContent = user.name;
    accountSection.querySelector('.account-email').textContent = maskEmail(user.email);
    const accountResponse = await fetch('/api/account');
    if (!accountResponse.ok) return;
    const account = await accountResponse.json();
    accountSection.querySelector('.account-welcome-name').textContent = account.user.name;
    accountSection.querySelector('.account-email').textContent = maskEmail(account.user.email);
    accountSection.querySelector('.account-date').textContent = new Date(account.user.createdAt).toLocaleDateString();
    accountSection.querySelector('.account-status').textContent = account.projects.length ? `${account.projects.length} record${account.projects.length === 1 ? '' : 's'}` : 'New client';
    const projects = accountSection.querySelector('.account-projects');
    projects.innerHTML = account.projects.length ? account.projects.map((project) => `<div class="flex items-center justify-between gap-space-md account-record"><div><strong class="text-on-surface">${project.name}</strong><p class="font-body-sm text-on-surface-variant">${project.service}</p></div><span class="account-status font-label-sm">${project.status}</span></div>`).join('') : '<p class="font-body-md text-on-surface-variant">No previous projects or activity yet. Your first project will appear here after you get started.</p>';
  }

  async function requestAuthApi(path, options) {
    let response;
    try {
      response = await fetch(path, options);
    } catch {
      throw new Error('Unable to connect to the authentication server. Please try again.');
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'The authentication service is temporarily unavailable.');
    return result;
  }

  function openPasswordRecovery() {
    document.querySelector('.auth-backdrop')?.remove();
    const backdrop = document.createElement('div');
    backdrop.className = 'auth-backdrop';
    backdrop.innerHTML = '<section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button class="auth-close" type="button" aria-label="Close">&times;</button><div class="auth-body"></div></section>';
    document.body.append(backdrop);
    const body = backdrop.querySelector('.auth-body');
    let countdownTimer;
    const close = () => { clearInterval(countdownTimer); backdrop.remove(); };
    backdrop.querySelector('.auth-close').addEventListener('click', close);
    backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
    const setBusy = (button, busyText, busy) => { if (!button) return; if (busy) { button.dataset.originalText = button.textContent; button.textContent = busyText; } else { button.textContent = button.dataset.originalText || button.textContent; } button.disabled = busy; };
    const wirePasswordToggles = () => backdrop.querySelectorAll('.password-toggle').forEach((toggle) => toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      toggle.setAttribute('aria-label', `${visible ? 'Show' : 'Hide'} password`);
    }));
    const renderIdentifier = () => {
      clearInterval(countdownTimer);
      body.innerHTML = '<span class="font-label-sm text-primary uppercase tracking-widest">Account recovery</span><h2 id="auth-title" class="font-headline-lg text-on-surface">Forgot Password?</h2><p class="font-body-sm text-on-surface-variant">Enter your registered email address or mobile number. We will send a verification code if an account matches.</p><form novalidate><div class="auth-error" role="alert"></div><label>Email or phone number<input name="identifier" autocomplete="email tel" required placeholder="you@example.com or +1 555 123 4567"></label><button class="auth-submit" type="submit">Send verification code</button></form>';
      const form = body.querySelector('form');
      const error = body.querySelector('.auth-error');
      form.querySelector('input').focus();
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        error.textContent = '';
        const button = form.querySelector('.auth-submit');
        setBusy(button, 'Sending code...', true);
        try {
          const result = await requestAuthApi('/api/auth/password-reset/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: form.identifier.value }) });
          renderVerify(result.challengeId, result.expiresAt);
        } catch (recoveryError) {
          error.textContent = recoveryError.message;
          setBusy(button, '', false);
        }
      });
    };
    const renderVerify = (challengeId, expiresAt) => {
      clearInterval(countdownTimer);
      body.innerHTML = '<span class="font-label-sm text-primary uppercase tracking-widest">Verification</span><h2 id="auth-title" class="font-headline-lg text-on-surface">Enter your code</h2><p class="auth-hint">Enter the six-digit verification code sent to your registered email or phone. Your code expires in 5 minutes.</p><form novalidate><div class="auth-error" role="alert"></div><label>Verification code<input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required></label><div class="auth-actions"><span class="auth-countdown" aria-live="polite"></span><button class="auth-link" type="button" data-resend>Resend code</button></div><button class="auth-submit" type="submit">Verify code</button></form>';
      const form = body.querySelector('form');
      const error = body.querySelector('.auth-error');
      const countdown = body.querySelector('.auth-countdown');
      const resend = body.querySelector('[data-resend]');
      let expiresAtMs = Number(expiresAt);
      let resendAvailableAt = Date.now() + 60 * 1000;
      const updateCountdown = () => {
        const secondsLeft = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = String(secondsLeft % 60).padStart(2, '0');
        countdown.textContent = secondsLeft ? `Code expires in ${minutes}:${seconds}` : 'Code expired. Request a new code.';
        resend.disabled = Date.now() < resendAvailableAt;
      };
      updateCountdown();
      countdownTimer = setInterval(updateCountdown, 1000);
      form.querySelector('input').focus();
      resend.addEventListener('click', async () => {
        error.textContent = '';
        setBusy(resend, 'Sending...', true);
        try {
          const result = await requestAuthApi('/api/auth/password-reset/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId }) });
          expiresAtMs = Number(result.expiresAt);
          resendAvailableAt = Date.now() + 60 * 1000;
          updateCountdown();
        } catch (resendError) {
          error.textContent = resendError.message;
        } finally {
          setBusy(resend, '', false);
        }
      });
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        error.textContent = '';
        const button = form.querySelector('.auth-submit');
        setBusy(button, 'Verifying...', true);
        try {
          await requestAuthApi('/api/auth/password-reset/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId, code: form.code.value }) });
          renderReset();
        } catch (verifyError) {
          error.textContent = verifyError.message;
          setBusy(button, '', false);
        }
      });
    };
    const renderReset = () => {
      clearInterval(countdownTimer);
      body.innerHTML = '<span class="font-label-sm text-primary uppercase tracking-widest">New credentials</span><h2 id="auth-title" class="font-headline-lg text-on-surface">Create New Password</h2><p class="font-body-sm text-on-surface-variant">Use 8-72 characters with uppercase, lowercase, number, and symbol.</p><form novalidate><div class="auth-error" role="alert"></div><label>New password<span class="password-wrap"><input name="password" type="password" autocomplete="new-password" required minlength="8" maxlength="72"><button class="password-toggle" type="button" aria-label="Show password">&#128065;</button></span></label><label>Confirm new password<span class="password-wrap"><input name="confirmPassword" type="password" autocomplete="new-password" required minlength="8" maxlength="72"><button class="password-toggle" type="button" aria-label="Show password">&#128065;</button></span></label><div class="password-strength">Password must include uppercase, lowercase, number, and symbol.</div><button class="auth-submit" type="submit">Reset password</button></form>';
      wirePasswordToggles();
      const form = body.querySelector('form');
      const error = body.querySelector('.auth-error');
      form.querySelector('input').focus();
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        error.textContent = '';
        const button = form.querySelector('.auth-submit');
        setBusy(button, 'Updating password...', true);
        try {
          await requestAuthApi('/api/auth/password-reset/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: form.password.value, confirmPassword: form.confirmPassword.value }) });
          clearInterval(countdownTimer);
          body.innerHTML = '<span class="font-label-sm text-primary uppercase tracking-widest">Complete</span><h2 id="auth-title" class="font-headline-lg text-on-surface">Password updated successfully.</h2><p class="font-body-sm text-on-surface-variant">Your password has been changed. You can now log in with your new password.</p><button class="auth-submit" type="button" data-continue-login>Continue to Login</button>';
          body.querySelector('[data-continue-login]').addEventListener('click', () => { backdrop.remove(); openAuth('login'); });
        } catch (resetError) {
          error.textContent = resetError.message;
          setBusy(button, '', false);
        }
      });
    };
    renderIdentifier();
  }

  function openAuth(mode) {
    document.querySelector('.auth-backdrop')?.remove();
    const signup = mode === 'signup';
    const backdrop = document.createElement('div');
    backdrop.className = 'auth-backdrop';
    const passwordField = (name, autocomplete, label) => `<label>${label}<span class="password-wrap"><input name="${name}" type="password" autocomplete="${autocomplete}" required${signup ? ' minlength="8" maxlength="72"' : ''}><button class="password-toggle" type="button" aria-label="Show ${label.toLowerCase()}">&#128065;</button></span></label>`;
    backdrop.innerHTML = `<section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button class="auth-close" type="button" aria-label="Close">&times;</button><span class="font-label-sm text-primary uppercase tracking-widest">${signup ? 'Create your account' : 'Welcome back'}</span><h2 id="auth-title" class="font-headline-lg text-on-surface">${signup ? 'Join INKNOVIO TECH' : 'Log in to your workspace'}</h2><p class="font-body-sm text-on-surface-variant">${signup ? 'Create an account to manage your creative projects.' : 'Use your registered account credentials.'}</p><form novalidate><div class="auth-error" role="alert"></div>${signup ? '<label>Full name<input name="name" autocomplete="name" required minlength="2" maxlength="80"></label>' : ''}<label>Email address<input name="email" type="email" autocomplete="email" required></label>${signup ? '<label>Mobile number <span class="font-body-sm text-on-surface-variant">(optional, international format)</span><input name="phone" type="tel" autocomplete="tel" placeholder="+1 555 123 4567"></label>' : ''}${passwordField('password', signup ? 'new-password' : 'current-password', 'Password')}${signup ? passwordField('confirmPassword', 'new-password', 'Confirm password') : '<button class="auth-link" type="button" data-forgot-password>Forgot Password?</button>'}<button class="auth-submit" type="submit">${signup ? 'Create account' : 'Log in'}</button></form></section>`;
    document.body.append(backdrop);
    const formElement = backdrop.querySelector('form');
    const error = backdrop.querySelector('.auth-error');
    backdrop.querySelector('.auth-close').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (event) => { if (event.target === backdrop) backdrop.remove(); });
    backdrop.querySelector('[data-forgot-password]')?.addEventListener('click', openPasswordRecovery);
    backdrop.querySelectorAll('.password-toggle').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const input = toggle.previousElementSibling;
        const visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        toggle.setAttribute('aria-label', `${visible ? 'Show' : 'Hide'} ${input.name === 'confirmPassword' ? 'confirm password' : 'password'}`);
      });
    });
    formElement.querySelector('input').focus();
    formElement.addEventListener('submit', async (event) => {
      event.preventDefault();
      error.textContent = '';
      const data = Object.fromEntries(new FormData(formElement));
      if (signup && data.name.trim().length < 2) return error.textContent = 'Please enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return error.textContent = 'Please enter a valid email address.';
      if (signup && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,72}$/.test(data.password)) return error.textContent = 'Use 8-72 characters with uppercase, lowercase, number, and symbol.';
      if (signup && data.password !== data.confirmPassword) return error.textContent = 'Passwords do not match.';
      const button = formElement.querySelector('button[type="submit"]');
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = signup ? 'Creating account...' : 'Logging in...';
      try {
        const response = await fetch(`/api/auth/${signup ? 'signup' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Authentication failed.');
        backdrop.remove();
        await loadAccount(result.user);
      } catch (authError) {
        error.textContent = authError.message;
        button.textContent = originalText;
        button.disabled = false;
      }
    });
  }

  authLinks.forEach((link) => link.addEventListener('click', async (event) => {
    event.preventDefault();
    if (link.dataset.action === 'logout') {
      await fetch('/api/auth/logout', { method: 'POST' });
      document.getElementById('account')?.remove();
      updateAuthenticatedNav(null);
      return;
    }
    if (link.dataset.authenticated === 'true') {
      document.getElementById('account')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    openAuth(link.dataset.path === 'sign-up' ? 'signup' : 'login');
  }));

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.matches('[data-path="login"], [data-path="sign-up"], .brand-logo-link')) return;
    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  fetch('/api/auth/me').then((response) => response.json()).then(({ user }) => { if (user) loadAccount(user); });
})();
