const CLUB_SESSION_STORAGE_KEY = 'awka-club-session';
const WHATSAPP_NUMBER = '5492494009164';

const PRIZES = [
    { label: 'Segui participando', emoji: '🎯', desc: 'La proxima puede ser tuya. Vuelve con tu siguiente compra.', color: '#0f2414', winner: false },
    { label: 'Sticker Gratis', emoji: '🖼️', desc: 'Llevate un sticker exclusivo de Awka Liwen.', color: '#173320', winner: true },
    { label: '5% OFF', emoji: '✨', desc: 'Descuento para tu proxima compra segun condiciones del local.', color: '#1c4025', winner: true },
    { label: 'Semilla Gratis', emoji: '🌱', desc: 'Premio sorpresa para seguir creciendo dentro del club.', color: '#224d2a', winner: true },
    { label: '10% OFF', emoji: '💸', desc: 'Un descuento mas fuerte para premiar tu avance.', color: '#2a5c30', winner: true },
    { label: 'Humus Gratis', emoji: '🪱', desc: 'Premio natural para acompañar tu cultivo.', color: '#183820', winner: true },
    { label: '20% OFF', emoji: '🔥', desc: 'Premio mayor de esta primera version de la ruleta.', color: '#3a2800', winner: true }
];

const spinButton = document.getElementById('ruletaSpinButton');
const readySpinButton = document.getElementById('readySpinButton');
const feedback = document.getElementById('ruletaFeedback');
const memberName = document.getElementById('ruletaMemberName');
const pendingCount = document.getElementById('ruletaPendingCount');
const statusCopy = document.getElementById('ruletaStatusCopy');
const prizeLabel = document.getElementById('ruletaPrizeLabel');
const prizeCopy = document.getElementById('ruletaPrizeCopy');
const readyName = document.getElementById('readyName');
const blockedMessage = document.getElementById('blockedMessage');
const overlayBlocked = document.getElementById('overlayBlocked');
const overlayReady = document.getElementById('overlayReady');
const overlayPrize = document.getElementById('overlayPrize');
const prizeEmoji = document.getElementById('prizeEmoji');
const prizeEyebrow = document.getElementById('prizeEyebrow');
const prizeName = document.getElementById('prizeName');
const prizeDesc = document.getElementById('prizeDesc');
const btnWsp = document.getElementById('btnWsp');
const confettiWrap = document.getElementById('confettiWrap');
const canvas = document.getElementById('ruletaCanvas');

const ctx = canvas.getContext('2d');
const size = canvas.width;
const centerX = size / 2;
const centerY = size / 2;
const radius = size / 2 - 6;
const equalArc = (2 * Math.PI) / PRIZES.length;
const arcs = PRIZES.map(() => equalArc);
const arcStarts = arcs.reduce((acc, arc, index) => {
    acc.push(index === 0 ? 0 : acc[index - 1] + arcs[index - 1]);
    return acc;
}, []);

let currentProfile = null;
let currentSession = null;
let spinning = false;
let angle = 0;
let pendingSpinResult = null;

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
    feedback.className = `awka-play-feedback${variant ? ` is-${variant}` : ''}`;
}

function setSpinEnabled(enabled) {
    const state = !enabled || spinning;
    spinButton.disabled = state;
    readySpinButton.disabled = state;
}

function openOverlay(element) {
    element.classList.add('show');
}

function closeOverlay(element) {
    element.classList.remove('show');
}

function closeAllOverlays() {
    [overlayBlocked, overlayReady, overlayPrize].forEach(closeOverlay);
}

function prizeMeta(label) {
    return PRIZES.find((prize) => prize.label === label) || {
        label,
        emoji: '🎁',
        desc: 'Tu resultado ya fue guardado dentro del club.',
        winner: true
    };
}

function renderWheel(rotation) {
    ctx.clearRect(0, 0, size, size);

    PRIZES.forEach((prize, index) => {
        const start = rotation + arcStarts[index];
        const end = start + arcs[index];

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.fillStyle = prize.color;
        ctx.fill();

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(255,255,255,0.06)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.12)');
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#07100a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(start + arcs[index] / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(240,232,212,0.95)';
        ctx.font = '600 12px "DM Sans", sans-serif';

        const lines = prize.label.split('\n');
        const textRadius = radius - 12;
        if (lines.length === 1) {
            ctx.fillText(lines[0], textRadius, 5);
        } else {
            ctx.fillText(lines[0], textRadius, -5);
            ctx.fillText(lines[1], textRadius, 10);
        }

        ctx.restore();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(start + arcs[index] / 2);
        ctx.font = '15px serif';
        ctx.fillText(prize.emoji, radius - 95, 6);
        ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 34, 0, 2 * Math.PI);
    const capGradient = ctx.createRadialGradient(centerX - 8, centerY - 8, 2, centerX, centerY, 34);
    capGradient.addColorStop(0, '#1a3020');
    capGradient.addColorStop(1, '#07100a');
    ctx.fillStyle = capGradient;
    ctx.fill();
    ctx.strokeStyle = '#2a6030';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 26, 0, 2 * Math.PI);
    ctx.strokeStyle = '#1a3020';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function resizeCanvas() {
    const viewportWidth = Math.min(window.innerWidth - 40, 360);
    const scale = viewportWidth / 340;
    canvas.style.width = `${340 * scale}px`;
    canvas.style.height = `${340 * scale}px`;
}

function formatPending(profile) {
    return profile.spins.pending === 1
        ? '1 giro pendiente'
        : `${profile.spins.pending} giros pendientes`;
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
    readyName.textContent = `Listo, ${profile.name || 'Awka'}!`;
    pendingCount.textContent = formatPending(profile);

    if (profile.spins.pending > 0) {
        statusCopy.textContent = 'Tu acceso ya puede usar la ruleta. El giro se consume cuando confirmas.';
        setFeedback('Tu sesion esta lista. Presiona GIRAR para continuar.', 'success');
        setSpinEnabled(true);
    } else {
        statusCopy.textContent = 'Ahora mismo no tienes giros pendientes. Sigue comprando o espera una nueva habilitacion.';
        setFeedback('No tienes giros pendientes en este momento.', 'error');
        setSpinEnabled(false);
    }

    if (profile.spins.latestPrize) {
        const meta = prizeMeta(profile.spins.latestPrize);
        prizeLabel.textContent = profile.spins.latestPrize;
        prizeCopy.textContent = meta.winner
            ? `Ultimo premio ganado: ${profile.spins.latestPrize}.`
            : 'Tu ultimo intento ya fue registrado en el historial del club.';
    }
}

function openBlocked(message) {
    blockedMessage.textContent = message;
    openOverlay(overlayBlocked);
}

function openReady() {
    if (!currentSession?.token) {
        openBlocked('Primero inicia sesion en Club Awka para usar la ruleta.');
        return;
    }

    if (!currentProfile?.spins?.pending) {
        openBlocked('Este acceso no tiene un giro habilitado en este momento.');
        return;
    }

    openOverlay(overlayReady);
}

function easeOut(time) {
    return 1 - Math.pow(1 - time, 4);
}

function animateToPrize(prizeLabelValue) {
    const prizeIndex = Math.max(0, PRIZES.findIndex((prize) => prize.label === prizeLabelValue));
    const targetAngle = -(arcStarts[prizeIndex] + equalArc / 2) + Math.PI * 1.5;
    const extraSpins = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
    const totalRotation = extraSpins + (((targetAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
    const duration = 4200;
    const startedAt = performance.now();
    const initialAngle = angle % (2 * Math.PI);

    return new Promise((resolve) => {
        function frame(now) {
            const progress = Math.min((now - startedAt) / duration, 1);
            angle = initialAngle + totalRotation * easeOut(progress);
            renderWheel(angle);
            if (progress < 1) {
                window.requestAnimationFrame(frame);
            } else {
                resolve();
            }
        }

        window.requestAnimationFrame(frame);
    });
}

function buildWhatsappLink(profileName, prize) {
    const message = encodeURIComponent(
        `Hola! Soy ${profileName}. Gire la ruleta de Club Awka y obtuve: ${prize.label} ${prize.emoji}`
    );

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function launchConfetti(accent) {
    confettiWrap.innerHTML = '';
    ['#7ec850', '#c9a84c', '#f0ead6', accent].forEach((color) => {
        for (let index = 0; index < 18; index += 1) {
            const particle = document.createElement('div');
            const sizePx = 6 + Math.random() * 8;
            particle.style.cssText = [
                'position:absolute',
                `left:${Math.random() * 100}%`,
                'top:-10px',
                `width:${sizePx}px`,
                `height:${sizePx}px`,
                `background:${color}`,
                `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
                `animation:awka-fall ${2 + Math.random() * 2}s ease-in forwards`,
                `animation-delay:${Math.random() * 0.8}s`
            ].join(';');
            confettiWrap.appendChild(particle);
        }
    });
}

function showPrizeModal(prizeLabelValue, winner) {
    const prize = prizeMeta(prizeLabelValue);
    prizeEmoji.textContent = prize.emoji;
    prizeEyebrow.textContent = winner ? 'Felicitaciones' : 'Gracias por participar';
    prizeName.textContent = prize.label;
    prizeDesc.textContent = winner
        ? `${prize.desc} El resultado ya quedo registrado en tu historial del club.`
        : `${prize.desc} Este intento tambien ya quedo registrado en tu historial del club.`;
    btnWsp.href = buildWhatsappLink(currentProfile?.name || 'Club Awka', prize);
    openOverlay(overlayPrize);

    if (winner) {
        launchConfetti(prize.color);
    }
}

async function loadPlay() {
    currentSession = loadSession();
    if (!currentSession?.token) {
        setFeedback('Primero inicia sesion en Club Awka para usar la ruleta.', 'error');
        setSpinEnabled(false);
        return;
    }

    try {
        const profile = await fetchProfile(currentSession.token);
        renderProfile(profile);
    } catch (error) {
        setFeedback(error.message || 'No pudimos validar tu acceso.', 'error');
        setSpinEnabled(false);
    }
}

async function confirmSpin() {
    if (!currentSession?.token || spinning || !currentProfile?.spins?.pending) {
        return;
    }

    spinning = true;
    setSpinEnabled(false);
    closeOverlay(overlayReady);
    setFeedback('Girando ruleta...', 'success');

    try {
        const response = await fetch('/api/club-spin', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${currentSession.token}`
            }
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'No pudimos completar el giro.');
        }

        pendingSpinResult = data;
        await animateToPrize(data.prize);
        showPrizeModal(data.prize, data.winner);
        setFeedback(
            data.winner ? `Ganaste ${data.prize}.` : `Resultado: ${data.prize}.`,
            data.winner ? 'success' : ''
        );

        const profile = await fetchProfile(currentSession.token);
        renderProfile(profile);
    } catch (error) {
        setFeedback(error.message || 'No pudimos completar el giro.', 'error');
        setSpinEnabled(Boolean(currentProfile?.spins?.pending));
    } finally {
        spinning = false;
        setSpinEnabled(Boolean(currentProfile?.spins?.pending));
    }
}

spinButton.addEventListener('click', openReady);
readySpinButton.addEventListener('click', confirmSpin);

document.querySelectorAll('[data-close-overlay]').forEach((button) => {
    button.addEventListener('click', () => {
        closeOverlay(document.getElementById(button.dataset.closeOverlay));
    });
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
renderWheel(angle);
loadPlay();
