const clubForm = document.getElementById('clubProfileForm');
const clubPhoneInput = document.getElementById('clubPhone');
const clubFeedback = document.getElementById('clubFeedback');
const clubResult = document.getElementById('clubProfileResult');

const PRIZE_EMOJIS = {
    'Sin resultado': '🎯',
    '¡Seguí participando!': '🎯',
    'Sticker Gratis': '🖼️',
    '5% OFF': '✨',
    'Semilla Gratis': '🌱',
    '10% OFF': '💸',
    'Humus Gratis': '🪱',
    '20% OFF': '🔥'
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

function prizeEmoji(prize) {
    return PRIZE_EMOJIS[prize] || '🎁';
}

function renderSpinSummary(profile) {
    if (!profile.spins.total) {
        return `
            <div class="club-spin-highlight is-empty">
                <strong>Todavia no giro la ruleta</strong>
                <span>Cuando tenga su primer giro registrado, aca vamos a mostrar el ultimo resultado y el ultimo premio ganado.</span>
            </div>
        `;
    }

    const latestPrize = profile.spins.latestPrize || 'Sin resultado';
    const latestWinPrize = profile.spins.latestWinPrize || 'Todavia sin premio';

    return `
        <div class="club-spin-highlight">
            <div class="club-spin-highlight-icon">${prizeEmoji(latestPrize)}</div>
            <div class="club-spin-highlight-copy">
                <strong>Ultimo giro: ${latestPrize}</strong>
                <span>${formatDate(profile.spins.latestPrizeAt)}</span>
            </div>
        </div>
        <div class="club-spin-highlight">
            <div class="club-spin-highlight-icon">${prizeEmoji(latestWinPrize)}</div>
            <div class="club-spin-highlight-copy">
                <strong>Ultimo premio ganado: ${latestWinPrize}</strong>
                <span>${profile.spins.latestWinAt ? formatDate(profile.spins.latestWinAt) : 'Aun no registra premios ganados'}</span>
            </div>
        </div>
    `;
}

function renderHistory(items = []) {
    if (!items.length) {
        return '<div class="club-profile-empty">Todavia no hay historial de giros cargado para este perfil.</div>';
    }

    return items.map((item) => `
        <article class="club-history-item">
            <div class="club-history-main">
                <div class="club-history-icon">${prizeEmoji(item.prize)}</div>
                <div>
                    <strong>${item.prize}</strong>
                    <span>${formatDate(item.createdAt)}</span>
                </div>
            </div>
            <span class="club-history-badge${item.winner ? ' is-win' : ''}">${item.winner ? 'Premio' : 'Intento'}</span>
        </article>
    `).join('');
}

function renderLevel(profile) {
    const nextStep = profile.level.nextLabel
        ? `Te faltan ${profile.level.purchasesToNext} compra${profile.level.purchasesToNext === 1 ? '' : 's'} para pasar a ${profile.level.nextLabel}.`
        : 'Ya estas en el nivel mas alto de esta primera version del club.';

    return `
        <div class="club-level-banner">
            <div class="club-level-badge">${profile.level.label}</div>
            <div class="club-level-copy">
                <strong>${profile.level.purchaseCount} compra${profile.level.purchaseCount === 1 ? '' : 's'} aprobada${profile.level.purchaseCount === 1 ? '' : 's'}</strong>
                <span>${nextStep}</span>
            </div>
            <div class="club-level-total">$${Number(profile.level.totalSpent || 0).toLocaleString('es-AR')}</div>
        </div>
    `;
}

function renderProfile(profile) {
    const stateLabel = profile.exists ? 'Perfil encontrado' : 'Perfil listo para activarse';
    const stateCopy = profile.exists
        ? 'Este cliente ya tiene trazabilidad dentro del club y puede crecer sobre puntos, beneficios y giros.'
        : 'El numero todavia no tiene cuenta registrada, pero la base ya esta lista para conectarlo al sistema.';

    clubResult.innerHTML = `
        <div class="club-profile-card">
            <div class="club-profile-header">
                <div>
                    <div class="club-member-eyebrow">${stateLabel}</div>
                    <h3>${profile.name}</h3>
                    <p>${stateCopy}</p>
                </div>
                <div class="club-profile-phone">${profile.phone}</div>
            </div>
            ${renderLevel(profile)}
            <div class="club-profile-stats club-profile-stats-5">
                <div class="club-profile-stat">
                    <strong>${profile.points.current}</strong>
                    <span>Puntos activos</span>
                </div>
                <div class="club-profile-stat">
                    <strong>${profile.points.redeemed}</strong>
                    <span>Canjeados</span>
                </div>
                <div class="club-profile-stat">
                    <strong>${profile.spins.pending}</strong>
                    <span>Giros pendientes</span>
                </div>
                <div class="club-profile-stat">
                    <strong>${profile.spins.wins}/${profile.spins.total}</strong>
                    <span>Premios / giros</span>
                </div>
                <div class="club-profile-stat">
                    <strong>${profile.level.label}</strong>
                    <span>Nivel actual</span>
                </div>
            </div>
            <div class="club-profile-meta">
                <span>Ultima actividad: ${formatDate(profile.points.lastActivity)}</span>
            </div>
            <div class="club-profile-spin-summary">
                ${renderSpinSummary(profile)}
            </div>
            <div class="club-profile-history">
                <div class="club-profile-history-title">Historial reciente</div>
                ${renderHistory(profile.history)}
            </div>
        </div>
    `;
}

async function handleClubProfileSubmit(event) {
    event.preventDefault();

    const phone = formatPhone(clubPhoneInput.value);

    if (phone.length < 8) {
        clubFeedback.textContent = 'Ingresa un WhatsApp valido para consultar el perfil.';
        clubFeedback.className = 'club-profile-feedback is-error';
        return;
    }

    clubFeedback.textContent = 'Consultando perfil...';
    clubFeedback.className = 'club-profile-feedback';
    clubResult.innerHTML = '';

    try {
        const response = await fetch(`/api/club-profile?phone=${encodeURIComponent(phone)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'No pudimos cargar el perfil.');
        }

        clubFeedback.textContent = 'Perfil cargado correctamente.';
        clubFeedback.className = 'club-profile-feedback is-success';
        renderProfile(data);
    } catch (error) {
        clubFeedback.textContent = error.message || 'No pudimos cargar el perfil.';
        clubFeedback.className = 'club-profile-feedback is-error';
        clubResult.innerHTML = `
            <div class="club-profile-empty">
                Esta consulta deberia traer puntos, giros, compras y nivel real del cliente.
            </div>
        `;
    }
}

if (clubForm) {
    clubForm.addEventListener('submit', handleClubProfileSubmit);
}
