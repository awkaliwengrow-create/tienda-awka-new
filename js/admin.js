const ADMIN_SESSION_STORAGE_KEY = 'awka-admin-session';

const loginShell = document.getElementById('adminLoginShell');
const dashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('adminLoginForm');
const loginFeedback = document.getElementById('adminLoginFeedback');
const logoutButton = document.getElementById('adminLogoutButton');
const refreshButton = document.getElementById('adminRefreshButton');

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
const pointsList = document.getElementById('adminPointsList');
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
                    ${item.status === 'pendiente' ? `<button class="club-side-link admin-mini-button" data-reward-deliver="${item.id}">Marcar entregado</button>` : `<span class="admin-item-note">${item.deliveryNote || 'Entregado'}</span>`}
                </div>
            </article>
        `,
        'No hay premios registrados todavia.'
    );
}

function renderRewardRedemptions(items) {
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
                    <span class="admin-badge${item.status === 'entregado' ? ' is-success' : ''}">${item.status}</span>
                    ${item.status === 'pendiente'
                        ? `<button class="club-side-link admin-mini-button" data-redemption-deliver="${item.id}">Marcar entregado</button>`
                        : `<span class="admin-item-note">${item.deliveryNote || item.requestNote || 'Entregado'}</span>`
                    }
                </div>
            </article>
        `,
        'Todavia no hay canjes registrados.'
    );
}

function renderTopPoints(items) {
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
                    <span class="admin-pill">Activos ${item.points}</span>
                    <span class="admin-item-note">Canjeados ${item.redeemed}</span>
                </div>
            </article>
        `,
        'No hay clientes con puntos.'
    );
}

function renderSpins(target, items, emptyMessage, isUsed = false) {
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
        'Todavia no hay subidas de nivel registradas.'
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
        'Todavia no hay campanas segmentadas configuradas.'
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
        'Todavia no hay automatizaciones registradas.'
    );
}

async function loadDashboard() {
    const data = await adminFetch('/api/admin-dashboard');

    statPending.textContent = data.stats.pendingSpins;
    statUsed.textContent = data.stats.usedSpins;
    statPoints.textContent = data.stats.activePoints;
    statRewards.textContent = data.stats.pendingRewards;
    segmentNuevo.textContent = data.segments?.nuevo || 0;
    segmentRecurrente.textContent = data.segments?.recurrente || 0;
    segmentFiel.textContent = data.segments?.fiel || 0;
    metricCustomers.textContent = `${data.metrics?.purchasingCustomers || 0}/${data.metrics?.totalCustomers || 0}`;
    metricRepeat.textContent = `${data.metrics?.repeatCustomers || 0} recurrentes`;
    metricTicket.textContent = formatMoney(data.metrics?.averageTicket || 0);
    metricRevenue.textContent = `${formatMoney(data.metrics?.totalRevenue || 0)} facturados`;
    metricSpinUsage.textContent = `${Math.round(data.metrics?.spinUsageRate || 0)}%`;
    metricRewardRate.textContent = `${Math.round(data.metrics?.rewardDeliveryRate || 0)}%`;
    metricTopCampaign.textContent = data.metrics?.topCampaign
        ? `${data.metrics.topCampaign.id} · ${data.metrics.topCampaign.activations} activaciones`
        : 'Todavia sin datos';
    metricTopPrize.textContent = data.metrics?.topPrize
        ? `${data.metrics.topPrize.prize} · ${data.metrics.topPrize.count} registro(s)`
        : 'Todavia sin datos';

    renderRewards(data.rewards || []);
    renderRewardRedemptions(data.rewardRedemptions || []);
    renderTopPoints(data.topPoints || []);
    renderSpins(pendingList, data.pendingSpins || [], 'No hay giros pendientes.');
    renderSpins(usedList, data.usedSpins || [], 'No hay giros usados aun.', true);
    renderLevelHistory(data.levelHistory || []);
    renderCampaigns(data.campaigns || []);
    renderCampaignActivations(data.campaignActivations || []);

    rewardsList.querySelectorAll('[data-reward-deliver]').forEach((button) => {
        button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                await adminFetch('/api/admin-reward-deliver', {
                    method: 'POST',
                    body: JSON.stringify({
                        rewardId: Number(button.dataset.rewardDeliver),
                        note: 'Entrega confirmada desde admin'
                    })
                });
                await loadDashboard();
            } catch (error) {
                button.disabled = false;
                alert(error.message || 'No pudimos marcar el premio como entregado.');
            }
        });
    });

    rewardRedemptionsList.querySelectorAll('[data-redemption-deliver]').forEach((button) => {
        button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                await adminFetch('/api/admin-reward-redemption-deliver', {
                    method: 'POST',
                    body: JSON.stringify({
                        redemptionId: Number(button.dataset.redemptionDeliver),
                        note: 'Canje entregado desde admin'
                    })
                });
                await loadDashboard();
            } catch (error) {
                button.disabled = false;
                alert(error.message || 'No pudimos marcar el canje como entregado.');
            }
        });
    });
}

function showDashboard() {
    loginShell.hidden = true;
    dashboard.hidden = false;
}

function showLogin() {
    loginShell.hidden = false;
    dashboard.hidden = true;
}

async function handleLogin(event) {
    event.preventDefault();

    const password = String(document.getElementById('adminPassword').value || '').trim();
    if (!password) {
        setFeedback(loginFeedback, 'Ingresa la contrasena del admin.', 'error');
        return;
    }

    setFeedback(loginFeedback, 'Validando acceso...');

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
        showDashboard();
        setFeedback(loginFeedback, 'Sesion iniciada correctamente.', 'success');
        await loadDashboard();
    } catch (error) {
        setFeedback(loginFeedback, error.message || 'No pudimos iniciar sesion.', 'error');
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
        setFeedback(spinFeedback, data.message || 'Giro habilitado.', 'success');
        spinForm.reset();
        document.getElementById('adminSpinCount').value = 1;
        await loadDashboard();
    } catch (error) {
        setFeedback(spinFeedback, error.message || 'No pudimos habilitar el giro.', 'error');
    }
}

async function handlePointsSubmit(event) {
    event.preventDefault();

    const payload = {
        name: String(document.getElementById('adminPointsName').value || '').trim(),
        phone: formatPhone(document.getElementById('adminPointsPhone').value || ''),
        amount: Number(document.getElementById('adminPointsAmount').value || 0)
    };

    if (payload.phone.length < 8 || !payload.amount) {
        setFeedback(pointsFeedback, 'Ingresa un WhatsApp valido y un ajuste distinto de cero.', 'error');
        return;
    }

    setFeedback(pointsFeedback, 'Actualizando puntos...');

    try {
        const data = await adminFetch('/api/admin-points-adjust', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        setFeedback(pointsFeedback, data.message || 'Puntos actualizados.', 'success');
        pointsForm.reset();
        await loadDashboard();
    } catch (error) {
        setFeedback(pointsFeedback, error.message || 'No pudimos ajustar los puntos.', 'error');
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
        await loadDashboard();
    } catch (error) {
        clearSession();
        showLogin();
        setFeedback(loginFeedback, 'Tu sesion admin vencio. Ingresa de nuevo.', 'error');
    }
}

loginForm?.addEventListener('submit', handleLogin);
spinForm?.addEventListener('submit', handleSpinSubmit);
pointsForm?.addEventListener('submit', handlePointsSubmit);
refreshButton?.addEventListener('click', loadDashboard);
logoutButton?.addEventListener('click', () => {
    clearSession();
    showLogin();
});

bootAdmin();
