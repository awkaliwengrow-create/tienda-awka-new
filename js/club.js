const CLUB_SESSION_STORAGE_KEY = 'awka-club-session';

const phoneForm = document.getElementById('clubPhoneForm');
const pinForm = document.getElementById('clubPinForm');
const phoneInput = document.getElementById('clubPhone');
const nameInput = document.getElementById('clubName');
const pinInput = document.getElementById('clubPin');
const phoneFeedback = document.getElementById('clubPhoneFeedback');
const pinFeedback = document.getElementById('clubPinFeedback');
const authMode = document.getElementById('clubAuthMode');
const authPhone = document.getElementById('clubAuthPhone');
const authNameField = document.getElementById('clubAuthNameField');
const authBackButton = document.getElementById('clubAuthBack');
const logoutButton = document.getElementById('clubLogoutButton');
const clubResult = document.getElementById('clubProfileResult');
const memberPanel = document.getElementById('clubMemberPanel');
const authStage = document.querySelector('.club-auth-stage');

const PRIZE_EMOJIS = {
    'Sin resultado': '🎯',
    'Segui participando': '🎯',
    '¡Segui participando!': '🎯',
    'Sticker Gratis': '🖼️',
    '5% OFF': '✨',
    'Semilla Gratis': '🌱',
    '10% OFF': '💸',
    'Humus Gratis': '🪱',
    '20% OFF': '🔥'
};

const authState = {
    phone: '',
    mode: 'login',
    requiresName: false,
    name: '',
    token: ''
};

function formatPhone(phone = '') {
    return String(phone).replace(/\D/g, '').slice(-10);
}

function formatDate(value) {
    if (!value) return 'Sin actividad aun';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Sin actividad aun';

    return parsed.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function findProductById(productId) {
    const productList = Array.isArray(window.products)
        ? window.products
        : (typeof products !== 'undefined' && Array.isArray(products) ? products : null);

    if (!productList) {
        return null;
    }

    return productList.find((item) => Number(item.id) === Number(productId)) || null;
}

function getPointsEarningValue(profile) {
    return Number(profile?.rewardPolicy?.earningValue || 5000);
}

function resolveRewardCatalog(profile) {
    const rewardCatalog = Array.isArray(profile?.rewardCatalog) ? profile.rewardCatalog : [];

    return rewardCatalog.map((reward) => {
        const product = findProductById(reward.productId);
        if (!product) return null;

        const sizeMatch = Array.isArray(product.sizes)
            ? product.sizes.find((size) => size.size === reward.sizeLabel)
            : null;

        return {
            ...reward,
            product,
            sizeLabel: reward.sizeLabel,
            productName: reward.productName || product.name,
            brand: product.brand,
            image: product.image || '',
            category: product.category,
            price: sizeMatch?.price || product.sizes?.[0]?.price || 0
        };
    }).filter(Boolean);
}

function buildRewardLink(reward) {
    const category = reward.category || 'todos';
    return `shop.html#${category}`;
}

/*
function renderRedemptions(profile) {
    const items = Array.isArray(profile.redemptions?.items) ? profile.redemptions.items : [];
    if (!items.length) {
        return '';
    }

    return `
        <div class="club-reward-history">
            <div class="club-profile-history-title">Canjes recientes</div>
            <div class="club-reward-history-list">
                ${items.map((item) => `
                    <article class="club-history-item">
                        <div class="club-history-main">
                            <div class="club-history-icon">★</div>
                            <div>
                                <strong>${escapeHtml(item.productName)}${item.sizeLabel ? ` · ${escapeHtml(item.sizeLabel)}` : ''}</strong>
                                <span>${item.pointsCost} puntos · ${formatDate(item.createdAt)}</span>
                            </div>
                        </div>
                        <span class="club-history-badge${item.status === 'entregado' ? ' is-win' : ''}">${item.status}</span>
                    </article>
                `).join('')}
            </div>
        </div>
    `;
}

*/
function prizeEmoji(prize) {
    return PRIZE_EMOJIS[prize] || '🎁';
}

function setFeedback(element, message, variant = '') {
    if (!element) return;
    element.textContent = message;
    element.className = `club-profile-feedback${variant ? ` is-${variant}` : ''}`;
}

function saveSession(session) {
    window.localStorage.setItem(CLUB_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function loadSession() {
    try {
        const raw = window.localStorage.getItem(CLUB_SESSION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function clearSession() {
    window.localStorage.removeItem(CLUB_SESSION_STORAGE_KEY);
}

function syncMemberPanel(visible) {
    if (memberPanel) {
        memberPanel.hidden = !visible;
    }
}

function syncAuthStage(visible) {
    if (authStage) {
        authStage.hidden = !visible;
    }
}

function resetProfilePlaceholder() {
    syncAuthStage(true);
    syncMemberPanel(false);
    clubResult.innerHTML = `
        <div class="club-profile-empty">
            Aqui vas a ver tu panel del club: puntos, compras, nivel, giros y actividad reciente.
        </div>
    `;
}

function setAuthMode(mode, phone, name = '') {
    authState.mode = mode;
    authState.phone = phone;
    authState.name = name;
    authState.requiresName = mode !== 'login';

    const config = {
        login: {
            label: 'Ingreso',
            button: 'Entrar',
            message: 'Ingresa tu PIN para entrar a tu club.',
            showName: false
        },
        activate: {
            label: 'Activar acceso',
            button: 'Activar',
            message: 'Este numero ya existe. Crea tu PIN para activar el acceso.',
            showName: false
        },
        create: {
            label: 'Crear acceso',
            button: 'Crear acceso',
            message: 'Todavia no existe una cuenta. Completa tu nombre y crea un PIN.',
            showName: true
        }
    }[mode];

    authMode.textContent = config.label;
    authPhone.textContent = phone;
    authNameField.hidden = !config.showName;
    pinForm.querySelector('button[type="submit"]').textContent = config.button;
    setFeedback(pinFeedback, config.message);

    if (config.showName) {
        nameInput.value = name || '';
        nameInput.focus();
    } else {
        nameInput.value = name || '';
        pinInput.focus();
    }
}

function showPhoneStep(message = 'Ingresa tu numero para revisar tu acceso al club.', variant = '') {
    phoneForm.hidden = false;
    pinForm.hidden = true;
    setFeedback(phoneFeedback, message, variant);
    setFeedback(pinFeedback, 'Usa un PIN de 4 digitos para entrar o crear tu acceso.');
}

function showPinStep() {
    phoneForm.hidden = true;
    pinForm.hidden = false;
}

function getNextGoal(profile) {
    if (profile.level.nextLabel && profile.level.purchasesToNext > 0) {
        return `${profile.level.purchasesToNext} compra${profile.level.purchasesToNext === 1 ? '' : 's'} para ${profile.level.nextLabel}`;
    }

    return 'Nivel mas alto activo';
}

function getFirstAvailableReward(profile) {
    const currentPoints = Number(profile.points?.current || 0);
    return resolveRewardCatalog(profile).find((reward) => reward.pointsCost <= currentPoints) || null;
}

function getPrimaryAction(profile) {
    if (profile.spins.pending > 0) {
        return {
            href: 'ruleta.html',
            label: 'Girar ahora',
            note: profile.spins.pending === 1
                ? 'Tienes 1 giro listo para usar.'
                : `Tienes ${profile.spins.pending} giros listos para usar.`
        };
    }

    const availableReward = getFirstAvailableReward(profile);
    if (availableReward) {
        return {
            href: '#clubRewardsPanel',
            label: 'Canjear recompensa',
            note: `Ya puedes canjear ${availableReward.productName}${availableReward.sizeLabel ? ` (${availableReward.sizeLabel})` : ''}.`
        };
    }

    return {
        href: '#clubWaysToGrow',
        label: 'Ver como ganar giros',
        note: 'Suma compras, sube de nivel y activa nuevas ventajas.'
    };
}

function getSecondaryAction(profile) {
    const availableReward = getFirstAvailableReward(profile);

    if (profile.spins.pending > 0 && availableReward) {
        return {
            href: '#clubRewardsPanel',
            label: 'Canjear recompensa'
        };
    }

    return null;
}

function renderActionSummary(profile) {
    const availableReward = getFirstAvailableReward(profile);

    return `
        <section class="club-summary-panel" aria-label="Resumen accionable">
            <article class="club-summary-hero-card">
                <span class="club-summary-label">Puntos acumulados</span>
                <strong>${profile.points.current}</strong>
                <small>${profile.points.redeemed} canjeados</small>
                ${availableReward ? `
                    <div class="club-summary-actions">
                        <a href="#clubRewardsPanel" class="club-summary-cta">Canjear recompensa</a>
                        <span class="club-summary-note">${availableReward.productName}${availableReward.sizeLabel ? ` (${availableReward.sizeLabel})` : ''} disponible para canje.</span>
                    </div>
                ` : ''}
            </article>
        </section>
    `;
}

function renderPrimaryAction(profile) {
    const action = getPrimaryAction(profile);
    const spinsLabel = profile.spins.pending === 1 ? '1 giro disponible' : `${profile.spins.pending} giros disponibles`;
    const spinsMeta = `${profile.spins.wins}/${profile.spins.total} premios / giros`;

    return `
        <section class="club-primary-action-panel" aria-label="Accion principal">
            <div class="club-primary-action-copy">
                <div class="club-profile-history-title">Accion principal</div>
                <p>${action.note}</p>
            </div>
            <div class="club-primary-action-kpi">
                <span class="club-summary-label">Giros disponibles</span>
                <strong>${spinsLabel}</strong>
                <small>${spinsMeta}</small>
            </div>
            <div class="club-primary-action-buttons">
                <a href="${action.href}" class="hero-cta club-primary-action-link">${action.label}</a>
            </div>
        </section>
    `;
}

function splitBenefitCopy(benefit) {
    const normalized = String(benefit || '').trim();

    if (/Giro bonus automatico/i.test(normalized)) {
        return {
            title: 'Giro bonus por nivel',
            detail: normalized
        };
    }

    if (/impulso en la cuarta compra/i.test(normalized)) {
        return {
            title: 'Impulso en cuarta compra',
            detail: normalized
        };
    }

    if (/activaciones mas frecuentes/i.test(normalized)) {
        return {
            title: 'Activaciones mas frecuentes',
            detail: normalized
        };
    }

    return {
        title: normalized,
        detail: 'Beneficio activo dentro de tu nivel actual.'
    };
}

function renderBenefits(profile) {
    const benefits = Array.isArray(profile.level.benefits) ? profile.level.benefits : [];
    const featuredBenefits = benefits.slice(0, 3);
    const nextUnlock = profile.level.nextUnlock || 'Sigue sumando compras para desbloquear nuevas ventajas.';

    return `
        <section class="club-benefits-panel" id="clubWaysToGrow">
            <div class="club-section-heading">
                <div class="club-profile-history-title">Beneficios de tu nivel</div>
                <span>${profile.level.label}</span>
            </div>
            <div class="club-benefits-list club-disclosure-list">
                ${featuredBenefits.map((benefit) => {
                    const item = splitBenefitCopy(benefit);
                    return `
                    <details class="club-disclosure-item">
                        <summary class="club-disclosure-summary">
                            <div class="club-disclosure-main">
                                <span class="club-benefit-mark"></span>
                                <strong>${item.title}</strong>
                            </div>
                            <span class="club-disclosure-toggle">Ver</span>
                        </summary>
                        <div class="club-disclosure-body">
                            <p>${item.detail}</p>
                        </div>
                    </details>
                    `;
                }).join('')}
            </div>
            <p class="club-benefits-footnote">
                <strong>Proximo desbloqueo:</strong> ${nextUnlock}
            </p>
        </section>
    `;
}

function buildCampaignDetail(campaign) {
    return campaign.cta || campaign.benefit || 'Campana activa dentro de tu nivel actual.';
}

function renderCampaignDisclosure(campaign, featured = false) {
    return `
        <details class="club-disclosure-item club-campaign-disclosure${featured ? ' is-featured' : ''}"${featured ? ' open' : ''}>
            <summary class="club-disclosure-summary">
                <div class="club-disclosure-main">
                    <span class="club-campaign-audience">${campaign.audience}</span>
                    <div>
                        <strong>${campaign.title}</strong>
                        <span class="club-disclosure-caption">${campaign.benefit}</span>
                    </div>
                </div>
                <span class="club-disclosure-toggle">Ver</span>
            </summary>
            <div class="club-disclosure-body">
                <p>${buildCampaignDetail(campaign)}</p>
            </div>
        </details>
    `;
}

function renderCampaignsPanel(profile) {
    const items = Array.isArray(profile.campaigns?.items) ? profile.campaigns.items : [];
    const latestActivation = profile.campaigns?.latestActivation || null;

    if (!items.length) {
        return '';
    }

    const [featuredCampaign, ...secondaryCampaigns] = items;

    return `
        <section class="club-campaigns-panel">
            <div class="club-section-heading">
                <div class="club-profile-history-title">Campanas activas</div>
                <span>${items.length} activa${items.length === 1 ? '' : 's'}</span>
            </div>
            ${latestActivation ? `
                <div class="club-campaign-activation">
                    <strong>Ultima activacion</strong>
                    <span>${latestActivation.title}</span>
                    <small>${formatDate(latestActivation.createdAt)}</small>
                </div>
            ` : ''}
            <div class="club-campaign-stack club-disclosure-list">
                ${renderCampaignDisclosure(featuredCampaign, true)}
                ${secondaryCampaigns.map((campaign) => renderCampaignDisclosure(campaign)).join('')}
            </div>
        </section>
    `;
}

function renderRewardsCatalog(profile) {
    const rewards = resolveRewardCatalog(profile);
    if (!rewards.length) {
        return '';
    }

    const currentPoints = Number(profile.points?.current || 0);
    const earningValue = getPointsEarningValue(profile);

    return `
        <section class="club-rewards-panel" aria-label="Canje de puntos">
            <div class="club-rewards-head">
                <div>
                    <div class="club-profile-history-title">Canjea tus puntos</div>
                    <p>1 punto se suma cada $${earningValue.toLocaleString('es-AR')} de compra. Usa tus puntos en productos seleccionados.</p>
                </div>
                <div class="club-rewards-points">
                    <strong>${currentPoints}</strong>
                    <span>puntos disponibles</span>
                </div>
            </div>
            <div class="club-rewards-grid">
                ${rewards.map((reward) => {
                    const missingPoints = Math.max(0, reward.pointsCost - currentPoints);
                    const isAvailable = missingPoints === 0;
                    const priceLabel = reward.price
                        ? `$${Number(reward.price).toLocaleString('es-AR')}`
                        : 'Catalogo oficial';

                    return `
                        <article class="club-reward-card${isAvailable ? ' is-available' : ''}">
                            <div class="club-reward-image-wrap">
                                <img src="${escapeHtml(reward.image)}" alt="${escapeHtml(reward.productName)}" class="club-reward-image" loading="lazy">
                            </div>
                            <div class="club-reward-copy">
                                <strong>${escapeHtml(reward.productName)}</strong>
                                <span>${escapeHtml(reward.brand)}${reward.sizeLabel ? ` · ${escapeHtml(reward.sizeLabel)}` : ''}</span>
                            </div>
                            <div class="club-reward-meta">
                                <span class="club-reward-points">${reward.pointsCost} pts</span>
                                <small>${priceLabel}</small>
                            </div>
                            <div class="club-reward-actions">
                                ${isAvailable
                                    ? `<button type="button" class="club-reward-cta club-reward-redeem-button" data-reward-key="${escapeHtml(reward.key)}">Canjear ahora</button>`
                                    : `<button type="button" class="club-side-link club-side-link-disabled" disabled>Te faltan ${missingPoints}</button>`
                                }
                                <a href="${buildRewardLink(reward)}" class="club-reward-link">Ver producto</a>
                            </div>
                        </article>
                    `;
                }).join('')}
            </div>
            <div id="clubRewardsFeedback" class="club-profile-feedback" hidden></div>
        </section>
    `;
}

function renderRewardsPanel(profile) {
    const rewards = resolveRewardCatalog(profile);
    const currentPoints = Number(profile.points?.current || 0);
    const availableCount = rewards.filter((reward) => reward.pointsCost <= currentPoints).length;
    const heading = availableCount > 0 ? 'Canje disponible' : 'Canjea tus puntos';
    const earningValue = getPointsEarningValue(profile);
    const intro = availableCount > 0
        ? `${availableCount} recompensa${availableCount === 1 ? '' : 's'} lista${availableCount === 1 ? '' : 's'} para pedir.`
        : `1 punto cada $${earningValue.toLocaleString('es-AR')} de compra. Elige productos seleccionados.`;

    return renderRewardsCatalog(profile)
        .replace('<section class="club-rewards-panel" aria-label="Canje de puntos">', '<section class="club-rewards-panel" id="clubRewardsPanel" aria-label="Canje de puntos">')
        .replace('<div class="club-profile-history-title">Canjea tus puntos</div>', `<div class="club-profile-history-title">${heading}</div>`)
        .replace(`1 punto se suma cada $${earningValue.toLocaleString('es-AR')} de compra. Usa tus puntos en productos seleccionados.`, intro);
}


function buildActivityFeed(profile) {
    const spinItems = (profile.history || []).map((item) => ({
        title: item.prize,
        meta: formatDate(item.createdAt),
        badge: item.winner ? 'Premio' : 'Intento',
        badgeClass: item.winner ? ' is-win' : '',
        icon: prizeEmoji(item.prize),
        sortTime: item.createdAt ? new Date(item.createdAt).getTime() : 0
    }));

    const redemptionItems = (profile.redemptions?.items || []).map((item) => ({
        title: `${item.productName}${item.sizeLabel ? ` · ${item.sizeLabel}` : ''}`,
        meta: `${item.pointsCost} puntos · ${formatDate(item.createdAt)}`,
        badge: item.status,
        badgeClass: item.status === 'entregado' ? ' is-win' : '',
        icon: '★',
        sortTime: item.createdAt ? new Date(item.createdAt).getTime() : 0
    }));

    return [...spinItems, ...redemptionItems]
        .sort((a, b) => b.sortTime - a.sortTime)
        .slice(0, 4);
}

function renderHistorySection(profile) {
    const latestPrize = profile.spins.latestPrize || 'Sin resultado';
    const latestWinPrize = profile.spins.latestWinPrize || 'Sin premio';
    const latestRedemption = profile.redemptions?.items?.[0] || null;
    const activityFeed = buildActivityFeed(profile);

    return `
        <section class="club-profile-history">
            <div class="club-section-heading">
                <div class="club-profile-history-title">Historial</div>
                <span>Ultimos movimientos</span>
            </div>
            <div class="club-history-glance">
                <article class="club-history-glance-item">
                    <span class="club-summary-label">Ultimo giro</span>
                    <strong>${latestPrize}</strong>
                    <small>${profile.spins.latestPrizeAt ? formatDate(profile.spins.latestPrizeAt) : 'Todavia sin giros'}</small>
                </article>
                <article class="club-history-glance-item">
                    <span class="club-summary-label">Ultimo premio</span>
                    <strong>${latestWinPrize}</strong>
                    <small>${profile.spins.latestWinAt ? formatDate(profile.spins.latestWinAt) : 'Todavia sin premios'}</small>
                </article>
                <article class="club-history-glance-item">
                    <span class="club-summary-label">${latestRedemption ? 'Ultimo canje' : 'Ultima actividad'}</span>
                    <strong>${latestRedemption ? latestRedemption.productName : 'Club Awka activo'}</strong>
                    <small>${latestRedemption ? formatDate(latestRedemption.createdAt) : formatDate(profile.points.lastActivity)}</small>
                </article>
            </div>
            <div class="club-history-feed">
                ${activityFeed.length
                    ? activityFeed.map((item) => `
                        <article class="club-history-item">
                            <div class="club-history-main">
                                <div class="club-history-icon">${item.icon}</div>
                                <div>
                                    <strong>${item.title}</strong>
                                    <span>${item.meta}</span>
                                </div>
                            </div>
                            <span class="club-history-badge${item.badgeClass}">${item.badge}</span>
                        </article>
                    `).join('')
                    : '<div class="club-profile-empty">Todavia no hay movimientos registrados en tu panel.</div>'
                }
            </div>
        </section>
    `;
}

function renderProfile(profile) {
    clubResult.innerHTML = `
        <div class="club-profile-card">
            <div class="club-profile-header">
                <div>
                    <div class="club-member-eyebrow">Sesion activa</div>
                    <h3>${profile.name}</h3>
                    <p>Tu avance del club en un solo lugar.</p>
                </div>
                <div class="club-profile-phone">${profile.phone}</div>
            </div>
            ${renderActionSummary(profile)}
            ${renderPrimaryAction(profile)}
            ${renderRewardsPanel(profile)}
            ${renderBenefits(profile)}
            ${renderCampaignsPanel(profile)}
            ${renderHistorySection(profile)}
        </div>
    `;

    const rewardsFeedback = document.getElementById('clubRewardsFeedback');
    clubResult.querySelectorAll('.club-reward-redeem-button').forEach((button) => {
        button.addEventListener('click', async () => {
            const rewardKey = String(button.dataset.rewardKey || '').trim();
            if (!rewardKey || !authState.token) return;

            button.disabled = true;
            if (rewardsFeedback) {
                rewardsFeedback.hidden = false;
                setFeedback(rewardsFeedback, 'Registrando canje...');
            }

            try {
                const response = await fetch('/api/club-reward-redeem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authState.token}`
                    },
                    body: JSON.stringify({ rewardKey })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'No pudimos registrar el canje.');
                }

                if (rewardsFeedback) {
                    setFeedback(rewardsFeedback, 'Actualizando tu panel...', 'success');
                }

                await loadProfileFromSession({
                    token: authState.token,
                    phone: authState.phone,
                    name: authState.name
                });

                const refreshedFeedback = document.getElementById('clubRewardsFeedback');
                if (refreshedFeedback) {
                    refreshedFeedback.hidden = false;
                    setFeedback(refreshedFeedback, `${data.message} Ya quedo en revision desde Awka Admin.`, 'success');
                }
            } catch (error) {
                button.disabled = false;
                if (rewardsFeedback) {
                    rewardsFeedback.hidden = false;
                    setFeedback(rewardsFeedback, error.message || 'No pudimos registrar el canje.', 'error');
                }
            }
        });
    });
}

async function fetchProfile(token) {
    const response = await fetch('/api/club-profile', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'No pudimos cargar tu perfil.');
    }

    return data;
}

async function loadProfileFromSession(session) {
    if (!session?.token) {
        return;
    }

    setFeedback(pinFeedback, 'Cargando tu panel...', 'success');

    try {
        const profile = await fetchProfile(session.token);
        authState.token = session.token;
        authState.phone = session.phone || profile.phone;
        authState.name = session.name || profile.name;
        logoutButton.hidden = false;
        syncAuthStage(false);
        syncMemberPanel(true);
        showPinStep();
        setAuthMode('login', profile.phone, profile.name);
        pinInput.value = '';
        setFeedback(pinFeedback, 'Sesion activa. Tu panel ya esta listo para usar.', 'success');
        renderProfile(profile);
    } catch (error) {
        clearSession();
        logoutButton.hidden = true;
        syncAuthStage(true);
        syncMemberPanel(false);
        showPhoneStep('Tu sesion vencio. Ingresa de nuevo para continuar.', 'error');
        resetProfilePlaceholder();
    }
}

async function handlePhoneSubmit(event) {
    event.preventDefault();

    const phone = formatPhone(phoneInput.value);
    phoneInput.value = phone;

    if (phone.length < 8) {
        setFeedback(phoneFeedback, 'Ingresa un WhatsApp valido.', 'error');
        return;
    }

    setFeedback(phoneFeedback, 'Revisando estado de tu cuenta...');

    try {
        const response = await fetch(`/api/club-account?phone=${encodeURIComponent(phone)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'No pudimos revisar el estado de tu cuenta.');
        }

        if (!data.exists) {
            setAuthMode('create', phone);
        } else if (!data.hasPin) {
            setAuthMode('activate', phone, data.name || '');
        } else {
            setAuthMode('login', phone, data.name || '');
        }

        showPinStep();
    } catch (error) {
        setFeedback(phoneFeedback, error.message || 'No pudimos revisar el estado de tu cuenta.', 'error');
    }
}

async function handlePinSubmit(event) {
    event.preventDefault();

    const payload = {
        phone: authState.phone,
        pin: String(pinInput.value || '').trim(),
        name: authState.requiresName ? String(nameInput.value || '').trim() : ''
    };

    if (!payload.phone || payload.phone.length < 8) {
        setFeedback(pinFeedback, 'Primero revisa tu numero de WhatsApp.', 'error');
        showPhoneStep('Primero ingresa tu numero.', 'error');
        return;
    }

    if (authState.requiresName && !payload.name) {
        setFeedback(pinFeedback, 'Ingresa tu nombre para continuar.', 'error');
        return;
    }

    if (!/^\d{4}$/.test(payload.pin)) {
        setFeedback(pinFeedback, 'El PIN debe tener 4 digitos.', 'error');
        return;
    }

        setFeedback(pinFeedback, 'Validando acceso...');

    try {
        const response = await fetch('/api/club-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'No pudimos iniciar tu sesion.');
        }

        const session = {
            token: data.token,
            phone: data.phone,
            name: data.name
        };

        saveSession(session);
        phoneInput.value = data.phone;
        pinInput.value = '';
        logoutButton.hidden = false;
        syncAuthStage(false);
        syncMemberPanel(true);

        const successMessage = data.created
            ? 'Acceso creado correctamente.'
            : data.activated
                ? 'Acceso activado correctamente.'
                : 'Sesion iniciada correctamente.';

        setFeedback(pinFeedback, `${successMessage} Cargando tu panel...`, 'success');
        await loadProfileFromSession(session);
    } catch (error) {
        setFeedback(pinFeedback, error.message || 'No pudimos iniciar tu sesion.', 'error');
    }
}

function handleBack() {
    authState.phone = '';
    authState.mode = 'login';
    authState.requiresName = false;
    authState.name = '';
    pinInput.value = '';
    nameInput.value = '';
    showPhoneStep();
    phoneInput.focus();
}

function handleLogout() {
    clearSession();
    logoutButton.hidden = true;
    syncAuthStage(true);
    syncMemberPanel(false);
    handleBack();
    resetProfilePlaceholder();
    setFeedback(phoneFeedback, 'Sesion cerrada. Puedes volver a ingresar cuando quieras.', 'success');
}

if (phoneForm) {
    phoneForm.addEventListener('submit', handlePhoneSubmit);
}

if (pinForm) {
    pinForm.addEventListener('submit', handlePinSubmit);
}

if (authBackButton) {
    authBackButton.addEventListener('click', handleBack);
}

if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}

const existingSession = loadSession();
if (existingSession?.token) {
    phoneInput.value = existingSession.phone || '';
    loadProfileFromSession(existingSession);
}
