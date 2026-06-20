const ADMIN_SESSION_STORAGE_KEY = 'awka-admin-session';

const loginShell = document.getElementById('adminLoginShell');
const dashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('adminLoginForm');
const loginFeedback = document.getElementById('adminLoginFeedback');
const dashboardFeedback = document.getElementById('adminDashboardFeedback');
const logoutButton = document.getElementById('adminLogoutButton');
const refreshButton = document.getElementById('adminRefreshButton');
const sessionLogoutButton = document.getElementById('adminSessionLogoutButton');
const sessionRefreshButton = document.getElementById('adminSessionRefreshButton');

const statPending = document.getElementById('adminStatPending');
const statUsed = document.getElementById('adminStatUsed');
const statPoints = document.getElementById('adminStatPoints');
const statRewards = document.getElementById('adminStatRewards');
const segmentNuevo = document.getElementById('adminSegmentNuevo');
const segmentRecurrente = document.getElementById('adminSegmentRecurrente');
const segmentFiel = document.getElementById('adminSegmentFiel');
const metricCustomers = document.getElementById('adminMetricCustomers');
const metricRepeat = document.getElementById('adminMetricRepeat');
const metricTicket = document.getElementById('adminMetricTicket');
const metricRevenue = document.getElementById('adminMetricRevenue');
const metricSpinUsage = document.getElementById('adminMetricSpinUsage');
const metricRewardRate = document.getElementById('adminMetricRewardRate');
const metricTopCampaign = document.getElementById('adminMetricTopCampaign');
const metricTopPrize = document.getElementById('adminMetricTopPrize');

const spinForm = document.getElementById('adminSpinForm');
const pointsForm = document.getElementById('adminPointsForm');
const spinFeedback = document.getElementById('adminSpinFeedback');
const pointsFeedback = document.getElementById('adminPointsFeedback');

const rewardsList = document.getElementById('adminRewardsList');
const rewardRedemptionsList = document.getElementById('adminRewardRedemptionsList');
const rewardsFeedback = document.getElementById('adminRewardsFeedback');
const rewardRedemptionsFeedback = document.getElementById('adminRewardRedemptionsFeedback');
const pointsList = document.getElementById('adminPointsList');
const registeredCustomersList = document.getElementById('adminRegisteredCustomersList');
const pendingList = document.getElementById('adminPendingList');
const usedList = document.getElementById('adminUsedList');
const levelHistoryList = document.getElementById('adminLevelHistoryList');
const campaignsList = document.getElementById('adminCampaignsList');
const campaignActivationList = document.getElementById('adminCampaignActivationList');

function setFeedback(element, message, variant = '') {
    if (!element) return;
    element.textContent = message;
    element.className = `club-profile-feedback${variant ? ` is-${variant}` : ''}`;
}

function clearFeedback(element) {
    if (!element) return;
    element.textContent = '';
    element.className = 'club-profile-feedback';
}

function setText(element, value) {
    if (!element) return;
    element.textContent = value;
}

function formatPhone(phone = '') {
    return String(phone).replace(/\D/g, '').slice(-10);
}

function formatDate(value) {
    if (!value) return 'Sin fecha';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';

    return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatMoney(value = 0) {
    return `$${Number(value || 0).toLocaleString('es-AR')}`;
}

function getNotificationNote(status) {
    if (status === 'sent') return ' WhatsApp enviado.';
    if (status === 'failed') return ' El giro o los puntos se aplicaron, pero el WhatsApp fallo.';
    if (status === 'skipped') return ' El giro o los puntos se aplicaron, pero WhatsApp aun no esta configurado.';
    return '';
}

function saveSession(token) {
    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, token);
}

function loadSession() {
    return localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) || '';
}

function clearSession() {
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

async function adminFetch(path, options = {}) {
    const token = loadSession();
    const response = await fetch(path, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || 'No pudimos completar la operacion admin.');
    }

    return data;
}

function renderList(items, renderer, emptyMessage) {
    if (!items?.length) {
        return `<div class="club-profile-empty">${emptyMessage}</div>`;
    }

    return items.map(renderer).join('');
}

function renderRewards(items) {
    if (!rewardsList) return;
    rewardsList.innerHTML = renderList(
        items,
        (item) => `
            <article class="admin-item admin-item-reward">
                <div class="admin-item-main">
                    <strong>${item.prize}</strong>
                    <span>${item.name} · ${item.phone}</span>
                    <span>${formatDate(item.createdAt)}</span>
                </div>
                <div class="admin-item-side">
                    <span class="admin-badge${item.status === 'entregado' ? ' is-success' : ''}">${item.status}</span>
                    ${item.status === 'pendiente'
                        ? `<button class="club-side-link admin-mini-button is-primary" data-reward-deliver="${item.id}">Marcar como entregado</button>`
                        : `<span class="admin-item-note">${item.deliveryNote || `Entregado ${formatDate(item.deliveredAt)}`}</span>`
                    }
                </div>
            </article>
        `,
        'No hay premios registrados.'
    );
}

function renderRewardRedemptions(items) {
    if (!rewardRedemptionsList) return;
    rewardRedemptionsList.innerHTML = renderList(
        items,
        (item) => `
            <article class="admin-item admin-item-reward">
                <div class="admin-item-main">
                    <strong>${item.productName}${item.sizeLabel ? ` · ${item.sizeLabel}` : ''}</strong>
                    <span>${item.name} · ${item.phone}</span>
                    <span>${item.pointsCost} puntos · ${formatDate(item.createdAt)}</span>
                </div>
                <div class="admin-item-side">
                    <span class="admin-badge${item.status === 'entregado' ? ' is-success' : item.status === 'cancelado' ? ' is-muted' : ''}">${item.status}</span>
                    ${item.status === 'pendiente'
                        ? `
                            <div class="admin-inline-actions">
                                <button class="club-side-link admin-mini-button is-primary" data-redemption-deliver="${item.id}">Marcar como entregado</button>
                                <button class="club-side-link admin-mini-button is-muted" data-redemption-cancel="${item.id}">Cancelar</button>
                            </div>
                        `
                        : `<span class="admin-item-note">${item.deliveryNote || item.requestNote || (item.status === 'cancelado' ? 'Cancelado' : `Entregado ${formatDate(item.deliveredAt)}`)}</span>`
                    }
                </div>
            </article>
        `,
        'No hay puntos canjeados aun.'
    );
}

function renderTopPoints(items) {
    if (!pointsList) return;
    pointsList.innerHTML = renderList(
        items,
        (item) => `
            <article class="admin-item">
                <div class="admin-item-main">
                    <strong>${item.name}</strong>
                    <span>${item.phone}</span>
                    <span>Ultima actividad: ${formatDate(item.lastActivity)}</span>
                </div>
                <div class="admin-item-side">
                    <span class="admin-pill">${item.points} activos</span>
                    <span class="admin-item-note">Canjeados ${item.redeemed}</span>
                </div>
            </article>
        `,
        'No hay clientes con puntos.'
    );
}

function renderRegisteredCustomers(items) {
    if (!registeredCustomersList) return;
    registeredCustomersList.innerHTML = renderList(
        items,
        (item) => `
            <article class="admin-item">
                <div class="admin-item-main">
                    <strong>${item.name}</strong>
                    <span>${item.phone}</span>
                    <span>Ultima actividad: ${formatDate(item.lastActivity)}</span>
                </div>
                <div class="admin-item-side">
                    <span class="admin-pill">${item.points} pts</span>
                    <span class="admin-item-note">${item.purchases} compra${item.purchases === 1 ? '' : 's'}</span>
                </div>
            </article>
        `,
        'No hay clientes registrados.'
    );
}

function renderSpins(target, items, emptyMessage, isUsed = false) {
    if (!target) return;
    target.innerHTML = renderList(
        items,
        (item) => `
            <article class="admin-item">
                <div class="admin-item-main">
                    <strong>${item.nombre}</strong>
                    <span>${item.telefono}</span>
                    <span>${isUsed ? `Usado: ${formatDate(item.used_at || item.created_at)}` : `Creado: ${formatDate(item.created_at)}`}</span>
                </div>
                <div class="admin-item-side">
                    <span class="admin-badge${isUsed ? ' is-muted' : ''}">${isUsed ? 'usado' : 'pendiente'}</span>
                </div>
            </article>
        `,
        emptyMessage
    );
}

function renderLevelHistory(items) {
    if (!levelHistoryList) return;
    levelHistoryList.innerHTML = renderList(
        items,
        (item) => `
            <article class="admin-item">
                <div class="admin-item-main">
                    <strong>${item.from} -> ${item.to}</strong>
                    <span>${item.phone}</span>
                    <span>${item.reason || 'Subida registrada automaticamente.'}</span>
                </div>
                <div class="admin-item-side">
                    <span class="admin-badge is-success">nivel</span>
                    <span class="admin-item-note">${formatDate(item.createdAt)}</span>
                </div>
            </article>
        `,
        'No hay subidas de nivel registradas.'
    );
}

function humanizeCampaignPriority(priority = '') {
    const map = {
        conversion: 'Conversion',
        alto_valor: 'Alto valor',
        reactivacion: 'Reactivacion'
    };

    return map[priority] || 'Campana';
}

function renderCampaigns(items) {
    if (!campaignsList) return;
    campaignsList.innerHTML = renderList(
        items,
        (item) => `
            <article class="admin-item">
                <div class="admin-item-main">
                    <strong>${item.title}</strong>
                    <span>Segmento: ${item.audience} | Alcance actual: ${item.targetCount} | Elegibles hoy: ${item.eligibilityCount || 0}</span>
                    <span>${item.description}</span>
                </div>
                <div class="admin-item-side">
                    <span class="admin-badge is-success">${humanizeCampaignPriority(item.priority)}</span>
                    <span class="admin-item-note">${item.cta}</span>
                </div>
            </article>
        `,
        'No hay campanas segmentadas activas.'
    );
}

function humanizeTrigger(trigger = '') {
    const map = {
        bienvenida_nuevo: 'Bienvenida Nuevo',
        primera_compra: 'Primera compra',
        impulso_recurrente: 'Impulso Recurrente',
        subida_nivel: 'Subida de nivel',
        cadencia_fiel: 'Cadencia Fiel',
        prioridad_fiel: 'Prioridad Fiel',
        reactivacion_regreso: 'Regreso Reactivado',
        compra_premium_fiel: 'Compra Premium Fiel'
    };

    return map[trigger] || trigger || 'Automatico';
}

function renderCampaignActivations(items) {
    if (!campaignActivationList) return;
    campaignActivationList.innerHTML = renderList(
        items,
        (item) => `
            <article class="admin-item">
                <div class="admin-item-main">
                    <strong>${item.name} · ${item.campaignId}</strong>
                    <span>${item.phone}</span>
                    <span>${item.note || 'Activacion registrada automaticamente.'}</span>
                </div>
                <div class="admin-item-side">
                    <span class="admin-badge is-success">${humanizeTrigger(item.triggerType)}</span>
                    <span class="admin-item-note">${formatDate(item.createdAt)}</span>
                </div>
            </article>
        `,
        'No hay automatizaciones registradas.'
    );
}

function askDeliveryNote(actionLabel) {
    const input = window.prompt(`${actionLabel}\n\nSi quieres, deja una nota corta para registro:`, '');
    if (input === null) {
        return null;
    }

    return String(input || '').trim();
}

async function loadDashboard() {
    clearFeedback(dashboardFeedback);
    const data = await adminFetch('/api/admin-dashboard');

    setText(statPending, data.stats.pendingSpins);
    setText(statUsed, data.stats.usedSpins);
    setText(statPoints, data.stats.activePoints);
    setText(statRewards, data.stats.pendingRewards);
    setText(segmentNuevo, data.segments?.nuevo || 0);
    setText(segmentRecurrente, data.segments?.recurrente || 0);
    setText(segmentFiel, data.segments?.fiel || 0);
    setText(metricCustomers, `${data.metrics?.purchasingCustomers || 0}/${data.metrics?.totalCustomers || 0}`);
    setText(metricRepeat, `${data.metrics?.repeatCustomers || 0} recurrentes`);
    setText(metricTicket, formatMoney(data.metrics?.averageTicket || 0));
    setText(metricRevenue, `${formatMoney(data.metrics?.totalRevenue || 0)} facturados`);
    setText(metricSpinUsage, `${Math.round(data.metrics?.spinUsageRate || 0)}%`);
    setText(metricRewardRate, `${Math.round(data.metrics?.rewardDeliveryRate || 0)}%`);
    setText(metricTopCampaign, data.metrics?.topCampaign
        ? `${data.metrics.topCampaign.id} · ${data.metrics.topCampaign.activations} activaciones`
        : 'Sin datos');
    setText(metricTopPrize, data.metrics?.topPrize
        ? `${data.metrics.topPrize.prize} · ${data.metrics.topPrize.count} registro(s)`
        : 'Sin datos');

    renderRewards(data.rewards || []);
    renderRewardRedemptions(data.rewardRedemptions || []);
    renderRegisteredCustomers(data.registeredCustomers || []);
    renderTopPoints(data.topPoints || []);
    renderSpins(pendingList, data.pendingSpins || [], 'No hay giros pendientes.');
    renderSpins(usedList, data.usedSpins || [], 'No hay giros usados aun.', true);
    renderLevelHistory(data.levelHistory || []);
    renderCampaigns(data.campaigns || []);
    renderCampaignActivations(data.campaignActivations || []);

    rewardsList?.querySelectorAll('[data-reward-deliver]').forEach((button) => {
        button.addEventListener('click', async () => {
            const note = askDeliveryNote('Vas a marcar este premio de ruleta como entregado.');
            if (note === null) {
                return;
            }
            button.disabled = true;
            setFeedback(rewardsFeedback, 'Marcando premio como entregado...');
            try {
                await adminFetch('/api/admin-reward-deliver', {
                    method: 'POST',
                    body: JSON.stringify({
                        rewardId: Number(button.dataset.rewardDeliver),
                        note: note || 'Entrega confirmada desde admin'
                    })
                });
                setFeedback(rewardsFeedback, 'Premio marcado como entregado.', 'success');
                await loadDashboard();
            } catch (error) {
                button.disabled = false;
                setFeedback(rewardsFeedback, error.message || 'No pudimos marcar el premio como entregado.', 'error');
            }
        });
    });

    rewardRedemptionsList?.querySelectorAll('[data-redemption-deliver]').forEach((button) => {
        button.addEventListener('click', async () => {
            const note = askDeliveryNote('Vas a marcar este canje como entregado.');
            if (note === null) {
                return;
            }
            button.disabled = true;
            setFeedback(rewardRedemptionsFeedback, 'Marcando canje como entregado...');
            try {
                await adminFetch('/api/admin-reward-deliver', {
                    method: 'POST',
                    body: JSON.stringify({
                        redemptionId: Number(button.dataset.redemptionDeliver),
                        status: 'entregado',
                        note: note || 'Canje entregado desde admin'
                    })
                });
                setFeedback(rewardRedemptionsFeedback, 'Canje marcado como entregado.', 'success');
                await loadDashboard();
            } catch (error) {
                button.disabled = false;
                setFeedback(rewardRedemptionsFeedback, error.message || 'No pudimos marcar el canje como entregado.', 'error');
            }
        });
    });

    rewardRedemptionsList?.querySelectorAll('[data-redemption-cancel]').forEach((button) => {
        button.addEventListener('click', async () => {
            const note = askDeliveryNote('Vas a cancelar este canje y devolver los puntos.');
            if (note === null) {
                return;
            }
            button.disabled = true;
            setFeedback(rewardRedemptionsFeedback, 'Cancelando canje y devolviendo puntos...');
            try {
                await adminFetch('/api/admin-reward-deliver', {
                    method: 'POST',
                    body: JSON.stringify({
                        redemptionId: Number(button.dataset.redemptionCancel),
                        status: 'cancelado',
                        note: note || 'Canje cancelado desde admin con devolucion de puntos'
                    })
                });
                setFeedback(rewardRedemptionsFeedback, 'Canje cancelado y puntos devueltos.', 'success');
                await loadDashboard();
            } catch (error) {
                button.disabled = false;
                setFeedback(rewardRedemptionsFeedback, error.message || 'No pudimos cancelar el canje.', 'error');
            }
        });
    });
}

async function loadDashboardSafely() {
    try {
        await loadDashboard();
    } catch (error) {
        setFeedback(dashboardFeedback, error.message || 'No pudimos cargar los datos del panel admin.', 'error');
        throw error;
    }
}

function showDashboard() {
    loginShell.hidden = true;
    loginShell.setAttribute('hidden', 'hidden');
    loginShell.style.display = 'none';
    dashboard.hidden = false;
    dashboard.removeAttribute('hidden');
    dashboard.style.display = '';
}

function showLogin() {
    loginShell.hidden = false;
    loginShell.removeAttribute('hidden');
    loginShell.style.display = '';
    dashboard.hidden = true;
    dashboard.setAttribute('hidden', 'hidden');
    dashboard.style.display = 'none';
}

async function handleLogin(event) {
    event.preventDefault();

    const password = String(document.getElementById('adminPassword').value || '').trim();
    if (!password) {
        setFeedback(loginFeedback, 'Ingresa la contrasena del admin.', 'error');
        return;
    }

    setFeedback(loginFeedback, 'Validando acceso...');
    let authenticated = false;

    try {
        const response = await fetch('/api/admin-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'No pudimos iniciar sesion.');
        }

        saveSession(data.token);
        authenticated = true;
        showDashboard();
        setFeedback(loginFeedback, 'Sesion iniciada correctamente.', 'success');
        await loadDashboardSafely();
    } catch (error) {
        if (!authenticated) {
            setFeedback(loginFeedback, error.message || 'No pudimos iniciar sesion.', 'error');
            return;
        }
        setFeedback(loginFeedback, 'Sesion iniciada, pero el panel no pudo cargar sus datos.', 'error');
    }
}

async function handleSpinSubmit(event) {
    event.preventDefault();

    const payload = {
        name: String(document.getElementById('adminSpinName').value || '').trim(),
        phone: formatPhone(document.getElementById('adminSpinPhone').value || ''),
        count: Number(document.getElementById('adminSpinCount').value || 1)
    };

    if (!payload.name || payload.phone.length < 8) {
        setFeedback(spinFeedback, 'Ingresa nombre y WhatsApp validos.', 'error');
        return;
    }

    setFeedback(spinFeedback, 'Habilitando giro...');

    try {
        const data = await adminFetch('/api/admin-spin-grant', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        setFeedback(spinFeedback, `${data.message || 'Giro habilitado.'}${getNotificationNote(data.notificationStatus)}`, 'success');
        spinForm.reset();
        document.getElementById('adminSpinCount').value = 1;
        await loadDashboardSafely();
    } catch (error) {
        setFeedback(spinFeedback, error.message || 'No pudimos habilitar el giro.', 'error');
    }
}

async function handlePointsSubmit(event) {
    event.preventDefault();

    const amount = Number(document.getElementById('adminPointsAmount').value || 0);
    const computedPoints = Math.floor(amount / 5000);
    const payload = {
        name: String(document.getElementById('adminPointsName').value || '').trim(),
        phone: formatPhone(document.getElementById('adminPointsPhone').value || ''),
        amount,
        points: computedPoints
    };

    if (payload.phone.length < 8 || !payload.amount) {
        setFeedback(pointsFeedback, 'Ingresa un WhatsApp valido y un monto de compra.', 'error');
        return;
    }

    if (computedPoints <= 0) {
        setFeedback(pointsFeedback, 'El monto debe alcanzar al menos $5000 para sumar 1 punto.', 'error');
        return;
    }

    setFeedback(pointsFeedback, `Acreditando ${computedPoints} punto${computedPoints === 1 ? '' : 's'}...`);

    try {
        const data = await adminFetch('/api/admin-points-adjust', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        setFeedback(pointsFeedback, `${data.message || 'Compra acreditada correctamente.'}${getNotificationNote(data.notificationStatus)}`, 'success');
        pointsForm.reset();
        await loadDashboardSafely();
    } catch (error) {
        setFeedback(pointsFeedback, error.message || 'No pudimos acreditar la compra.', 'error');
    }
}

async function bootAdmin() {
    const token = loadSession();
    if (!token) {
        showLogin();
        return;
    }

    try {
        showDashboard();
        await loadDashboardSafely();
    } catch (error) {
        clearSession();
        showLogin();
        setFeedback(loginFeedback, 'Tu sesion admin vencio. Ingresa de nuevo.', 'error');
    }
}

loginForm?.addEventListener('submit', handleLogin);
spinForm?.addEventListener('submit', handleSpinSubmit);
pointsForm?.addEventListener('submit', handlePointsSubmit);
const handleLogout = () => {
    clearSession();
    showLogin();
};

refreshButton?.addEventListener('click', loadDashboardSafely);
sessionRefreshButton?.addEventListener('click', loadDashboardSafely);
logoutButton?.addEventListener('click', handleLogout);
sessionLogoutButton?.addEventListener('click', handleLogout);

bootAdmin();
