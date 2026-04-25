const CLUB_SESSION_STORAGE_KEY = 'awka-club-session';

const spinButton = document.getElementById('ruletaSpinButton');
const feedback = document.getElementById('ruletaFeedback');
const memberName = document.getElementById('ruletaMemberName');
const pendingCount = document.getElementById('ruletaPendingCount');
const statusCopy = document.getElementById('ruletaStatusCopy');
const prizeLabel = document.getElementById('ruletaPrizeLabel');
const prizeCopy = document.getElementById('ruletaPrizeCopy');
const wheel = document.getElementById('ruletaWheel');

const prizeAngles = {
    'Segui participando': 320,
    'Sticker Gratis': 40,
    '5% OFF': 85,
    'Semilla Gratis': 135,
    '10% OFF': 190,
    'Humus Gratis': 240,
    '20% OFF': 285
};

let currentProfile = null;
let spinning = false;

function loadSession() {
    try {
        const raw = window.localStorage.getItem(CLUB_SESSION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function setFeedback(message, variant = '') {
    feedback.textContent = message;
    feedback.className = `club-profile-feedback${variant ? ` is-${variant}` : ''}`;
}

function setSpinEnabled(enabled) {
    spinButton.disabled = !enabled || spinning;
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

function renderProfile(profile) {
    currentProfile = profile;
    memberName.textContent = profile.name || 'Club Awka';
    pendingCount.textContent = profile.spins.pending === 1
        ? '1 giro pendiente'
        : `${profile.spins.pending} giros pendientes`;

    if (profile.spins.pending > 0) {
        statusCopy.textContent = 'Tu acceso ya puede usar la ruleta. El giro se consume cuando presionas el boton.';
        setFeedback('Tu sesion esta lista. Puedes girar cuando quieras.', 'success');
        setSpinEnabled(true);
    } else {
        statusCopy.textContent = 'Ahora mismo no tienes giros pendientes. Sigue comprando o espera una nueva habilitacion.';
        setFeedback('No tienes giros pendientes en este momento.', 'error');
        setSpinEnabled(false);
    }

    if (profile.spins.latestPrize) {
        prizeLabel.textContent = profile.spins.latestPrize;
        prizeCopy.textContent = profile.spins.latestWinPrize
            ? `Ultimo premio ganado: ${profile.spins.latestWinPrize}.`
            : 'Tu ultimo resultado ya fue registrado en el historial del club.';
    }
}

function animateWheel(prize) {
    const angle = prizeAngles[prize] || 0;
    const spins = 5 * 360;
    wheel.style.transform = `rotate(${spins + angle}deg)`;
}

async function loadPlay() {
    const session = loadSession();
    if (!session?.token) {
        setFeedback('Primero inicia sesion en Club Awka para usar la ruleta.', 'error');
        setSpinEnabled(false);
        return;
    }

    try {
        const profile = await fetchProfile(session.token);
        renderProfile(profile);
    } catch (error) {
        setFeedback(error.message || 'No pudimos validar tu acceso.', 'error');
        setSpinEnabled(false);
    }
}

async function handleSpin() {
    const session = loadSession();
    if (!session?.token || spinning || !currentProfile?.spins?.pending) {
        return;
    }

    spinning = true;
    setSpinEnabled(false);
    setFeedback('Girando ruleta...', 'success');

    try {
        const response = await fetch('/api/club-spin', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${session.token}`
            }
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'No pudimos completar el giro.');
        }

        animateWheel(data.prize);
        await new Promise((resolve) => window.setTimeout(resolve, 4200));

        prizeLabel.textContent = data.prize;
        prizeCopy.textContent = data.winner
            ? 'Premio confirmado. Ya quedo registrado en tu historial del club.'
            : 'Este intento tambien ya quedo registrado en tu historial del club.';

        setFeedback(
            data.winner
                ? `Ganaste ${data.prize}.`
                : `Resultado: ${data.prize}.`,
            data.winner ? 'success' : ''
        );

        const profile = await fetchProfile(session.token);
        renderProfile(profile);
    } catch (error) {
        setFeedback(error.message || 'No pudimos completar el giro.', 'error');
        setSpinEnabled(Boolean(currentProfile?.spins?.pending));
    } finally {
        spinning = false;
        setSpinEnabled(Boolean(currentProfile?.spins?.pending));
    }
}

if (spinButton) {
    spinButton.addEventListener('click', handleSpin);
}

loadPlay();
