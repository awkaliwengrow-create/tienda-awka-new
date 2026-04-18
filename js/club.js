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

function resetProfilePlaceholder() {
    clubResult.innerHTML = `
        <div class="club-profile-empty">
            Aca vas a ver tu panel real del club cuando inicies sesion: puntos, compras aprobadas, nivel actual, progreso y ultimos movimientos.
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
    setFeedback(pinFeedback, 'Usa un PIN de 4 digitos para ingresar o crear tu acceso.');
}

function showPinStep() {
    phoneForm.hidden = true;
    pinForm.hidden = false;
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
    clubResult.innerHTML = `
        <div class="club-profile-card">
            <div class="club-profile-header">
                <div>
                    <div class="club-member-eyebrow">Sesion activa</div>
                    <h3>${profile.name}</h3>
                    <p>Este perfil ya esta conectado al sistema del club y puede crecer sobre puntos, beneficios y giros.</p>
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
        showPinStep();
        setAuthMode('login', profile.phone, profile.name);
        pinInput.value = '';
        setFeedback(pinFeedback, 'Sesion activa. Tu panel ya esta listo.', 'success');
        renderProfile(profile);
    } catch (error) {
        clearSession();
        logoutButton.hidden = true;
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
