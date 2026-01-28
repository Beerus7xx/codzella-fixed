/**
 * CoDZeLLa Portfolio Logic
 * High-performance UI management and dynamic content injection
 */

const UI = {
    links: document.querySelectorAll('.nav-links li'),
    sections: document.querySelectorAll('section, header, footer'),
    isManualScroll: false,
    scrollTimeout: null
};

/**
 * Helper: Convert Hex color to RGBA
 */
const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Apply site-wide theme configuration
 */
const applyTheme = () => {
    if (typeof SITE_CONFIG === 'undefined' || !SITE_CONFIG.themeColor) return;

    const root = document.documentElement;
    const color = SITE_CONFIG.themeColor;

    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-dim', hexToRgba(color, 0.15));
};

/**
 * Helper: Generate the Wifi/Status SVG
 */
const getStatusIcon = (color = '#22c55e') => `
    <svg class="wifi-icon" viewBox="0 0 24 24" style="color: ${color}">
        <circle cx="12" cy="19" r="2"></circle>
        <path class="wave-1" d="M8.5 15.5a5 5 0 0 1 7 0"></path>
        <path class="wave-2" d="M5.5 12.5a10 10 0 0 1 13 0"></path>
        <path class="wave-3" d="M2.5 9.5a15 15 0 0 1 19 0"></path>
    </svg>
`;

/**
 * Load and inject dynamic content from SITE_CONFIG
 */
const loadContent = () => {
    if (typeof SITE_CONFIG === 'undefined') return;

    // About Section
    if (SITE_CONFIG.aboutSection) {
        const aboutWidget = document.getElementById('about-widget');
        if (aboutWidget) {
            const h3 = aboutWidget.querySelector('h3');
            const p = aboutWidget.querySelector('p');
            const stats = aboutWidget.querySelector('.stats-row');

            if (h3) h3.innerHTML = `<i data-lucide="user"></i> ${SITE_CONFIG.aboutSection.title}`;
            if (p) p.textContent = SITE_CONFIG.aboutSection.description;
            if (stats && SITE_CONFIG.aboutSection.stats) {
                stats.innerHTML = SITE_CONFIG.aboutSection.stats.map(s => `
                    <div class="stat">
                        <span class="value">${s.value}</span>
                        <span class="label">${s.label}</span>
                    </div>
                `).join('');
            }
        }
    }

    // Recent Activity
    if (SITE_CONFIG.recentActivity) {
        const activityWidget = document.getElementById('activity-widget');
        if (activityWidget) {
            const h3 = activityWidget.querySelector('h3');
            const p = activityWidget.querySelector('p');
            const list = activityWidget.querySelector('.server-list');

            if (h3) h3.innerHTML = `<i data-lucide="activity"></i> ${SITE_CONFIG.recentActivity.title}`;
            if (p) p.textContent = SITE_CONFIG.recentActivity.description;
            if (list && SITE_CONFIG.recentActivity.servers) {
                list.innerHTML = SITE_CONFIG.recentActivity.servers.map(s => `
                    <div class="server-item">
                        <div class="server-info">
                            <span class="server-status">${getStatusIcon(s.online ? '#22c55e' : '#ef4444')}</span>
                            <span class="server-name">${s.name}</span>
                        </div>
                        <a href="${s.discordUrl}" target="_blank" class="btn-tactical btn-mini">Join Discord</a>
                    </div>
                `).join('');
            }
        }
    }

    // Server Solutions
    if (SITE_CONFIG.serverSolutions) {
        const container = document.getElementById('scripts');
        if (container) {
            const header = container.querySelector('.section-header h2');
            const grid = container.querySelector('.grid-3');

            if (header) header.innerHTML = `<i data-lucide="star"></i> ${SITE_CONFIG.serverSolutions.title}`;
            if (grid && SITE_CONFIG.serverSolutions.cards) {
                grid.innerHTML = SITE_CONFIG.serverSolutions.cards.map(c => `
                    <div class="card">
                        <div class="card-image">
                            <img src="${c.image}" alt="${c.title}">
                            ${c.badge ? `<span class="badge">${c.badge}</span>` : ''}
                        </div>
                        <div class="card-body">
                            <h4>${c.title}</h4>
                            <p>${c.description}</p>
                            <button class="btn-tactical btn-buy" 
                                data-title="${c.detailsTitle}"
                                data-info="${c.detailsDescription}">View Details</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // Custom Services
    if (SITE_CONFIG.customServices) {
        const servicesSection = document.getElementById('services-section');
        if (servicesSection) {
            const header = servicesSection.querySelector('.section-header h2');
            const list = document.getElementById('services-list');

            if (header) header.innerHTML = `<i data-lucide="layout"></i> ${SITE_CONFIG.customServices.title}`;
            if (list && SITE_CONFIG.customServices.services) {
                list.innerHTML = SITE_CONFIG.customServices.services.map(s => `
                    <div class="service-item">
                        <div class="icon-box"><i data-lucide="${s.icon}"></i></div>
                        <div class="service-info">
                            <h4>${s.title}</h4>
                            <p>${s.description}</p>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // Promo Ticker
    const ticker = document.getElementById('promoTicker');
    if (ticker && SITE_CONFIG.promoTicker?.active) {
        const config = SITE_CONFIG.promoTicker;
        ticker.classList.add('active');
        ticker.style.backgroundColor = config.backgroundColor;

        const inner = ticker.querySelector('.ticker');
        if (inner) {
            inner.style.animationDuration = config.speed;
            inner.innerHTML = Array(10).fill(`<span class="ticker-item">${config.text}</span>`).join('');
        }
    }

    // Update Hero Button
    const heroBtn = document.querySelector('.hero-btn');
    if (heroBtn && SITE_CONFIG.contactSalesLink) {
        heroBtn.setAttribute('href', SITE_CONFIG.contactSalesLink);
    }

    // Refresh Lucide Icons once at the end
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

/**
 * Handle Navigation and Scroll Behavior
 */
const setupNavigation = () => {
    const handleActiveLink = (id) => {
        UI.links.forEach(li => {
            const href = li.querySelector('a')?.getAttribute('href');
            li.classList.toggle('active', href === `#${id}`);
        });
    };

    // Smooth Scroll Link Handling
    UI.links.forEach(li => {
        const link = li.querySelector('a');
        if (!link || !link.getAttribute('href').startsWith('#')) return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');

            UI.isManualScroll = true;
            clearTimeout(UI.scrollTimeout);
            UI.scrollTimeout = setTimeout(() => UI.isManualScroll = false, 1000);

            handleActiveLink(href.substring(1));

            if (href === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (href === '#scripts') {
                const target = document.querySelector(href);
                const pos = target.getBoundingClientRect().top + window.pageYOffset - 120;
                window.scrollTo({ top: pos, behavior: 'smooth' });
            } else if (href === '#ui') {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            } else {
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Logo Home Link
    document.querySelector('.logo')?.addEventListener('click', (e) => {
        e.preventDefault();
        UI.isManualScroll = true;
        clearTimeout(UI.scrollTimeout);
        UI.scrollTimeout = setTimeout(() => UI.isManualScroll = false, 1000);
        handleActiveLink('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Scroll Spy
    window.addEventListener('scroll', () => {
        if (UI.isManualScroll) return;

        let activeId = 'home';
        const threshold = window.scrollY + 250;

        UI.sections.forEach(sec => {
            const top = sec.offsetTop;
            if (threshold >= top) {
                activeId = sec.getAttribute('id') || activeId;
            }
        });

        if (window.scrollY < 50) activeId = 'home';
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) activeId = 'ui';

        handleActiveLink(activeId);
    });
};

/**
 * Universal Notification System (Ox_Lib Style)
 */
const notify = (title, desc, type = 'success') => {
    const container = document.getElementById('notif-container');
    if (!container) return;

    const notif = document.createElement('div');
    notif.className = `notification notif-${type}`;

    const icons = {
        success: 'fa-solid fa-circle-check',
        error: 'fa-solid fa-circle-xmark',
        warning: 'fa-solid fa-circle-exclamation',
        info: 'fa-solid fa-circle-info'
    };

    notif.innerHTML = `
        <div class="notif-bg-border"><div class="notif-inner-border"></div></div>
        <div class="notif-header">
            <div class="notif-icon"><i class="${icons[type]}"></i></div>
            <div class="notif-title">${title}</div>
        </div>
        <div class="notif-desc">${desc}</div>
        <div class="notif-timer"><svg><circle cx="9" cy="9" r="7"></circle></svg></div>
    `;

    container.appendChild(notif);

    const circle = notif.querySelector('.notif-timer circle');
    circle.style.strokeDashoffset = '44';

    setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 5000ms linear';
        circle.style.strokeDashoffset = '0';
    }, 10);

    setTimeout(() => {
        notif.classList.add('notif-exit');
        setTimeout(() => notif.remove(), 400);
    }, 5000);
};

/**
 * Modal System Management
 */
const setupModal = () => {
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const info = document.getElementById('modal-info');

    const openModal = (t, i) => {
        title.innerText = t;
        info.innerText = i;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Global Modal Listeners
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-buy')) {
            openModal(e.target.dataset.title, e.target.dataset.info);
        }
        if (e.target.classList.contains('modal-cancel')) {
            notify('Error', 'Action cancelled', 'error');
            closeModal();
        }
        if (e.target.classList.contains('modal-confirm')) {
            notify('Success', 'Viewed details successfully', 'success');
            closeModal();
        }
        if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
};

/**
 * Entry Point
 */
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    loadContent();
    setupNavigation();
    setupModal();

    setTimeout(() => {
        notify('System', `Welcome back, CoDZeLLa. Theme applied.`, 'info');
    }, 1000);
});
