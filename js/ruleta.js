const CLUB_SESSION_STORAGE_KEY = 'awka-club-session';
const WHATSAPP_NUMBER = '5492494009164';

const PRIZES = [
    {
        code: 'miss',
        label: 'Segui participando',
        wheelLines: ['SEGUI', 'GIRANDO'],
        mark: 'TRY',
        badge: 'TRY',
        desc: 'La proxima puede ser tuya. Vuelve con tu siguiente compra.',
        color: '#0f2414',
        winner: false,
        type: 'miss'
    },
    {
        code: 'discount-5',
        label: '5% OFF',
        wheelLines: ['5% OFF'],
        mark: '5%',
        badge: '5%',
        desc: 'Descuento para tu proxima compra segun condiciones del local.',
        color: '#1c4025',
        winner: true,
        type: 'discount',
        discountPercent: 5
    },
    {
        code: 'discount-10',
        label: '10% OFF',
        wheelLines: ['10% OFF'],
        mark: '10%',
        badge: '10%',
        desc: 'Un descuento mas fuerte para premiar tu avance.',
        color: '#2a5c30',
        winner: true,
        type: 'discount',
        discountPercent: 10
    },
    {
        code: 'product-raw-classic',
        label: 'Raw Classic',
        wheelLines: ['RAW', 'CLASSIC'],
        mark: 'RAW',
        badge: 'RAW',
        desc: 'Premio real del catalogo para retirar o coordinar con Awka.',
        color: '#173320',
        winner: true,
        type: 'product',
        productId: 2124,
        productCategory: 'papeles'
    },
    {
        code: 'product-tips-silver',
        label: 'Tips Silver',
        wheelLines: ['TIPS', 'SILVER'],
        mark: 'TIPS',
        badge: 'TIP',
        desc: 'Premio real del catalogo para sumar al ecosistema Awka.',
        color: '#224d2a',
        winner: true,
        type: 'product',
        productId: 4156,
        productCategory: 'filtros'
    },
    {
        code: 'product-fumanchu',
        label: 'Fumanchu Blanco',
        wheelLines: ['FUMANCHU'],
        mark: 'FUM',
        badge: 'FUM',
        desc: 'Premio real del catalogo listo para canjear.',
        color: '#183820',
        winner: true,
        type: 'product',
        productId: 3151,
        productCategory: 'papeles'
    },
    {
        code: 'product-zeus-pink',
        label: 'Zeus Pink',
        wheelLines: ['ZEUS', 'PINK'],
        mark: 'ZEUS',
        badge: 'ZS',
        desc: 'Premio real del catalogo para clientes del club.',
        color: '#3a2840',
        winner: true,
        type: 'product',
        productId: 143,
        productCategory: 'papeles'
    },
    {
        code: 'discount-20',
        label: '20% OFF',
        wheelLines: ['20% OFF'],
        mark: '20%',
        badge: '20%',
        desc: 'Premio mayor de esta primera version de la ruleta.',
        color: '#3a2800',
        winner: true,
        type: 'discount',
        discountPercent: 20
    }
];

const spinButton = document.getElementById('ruletaSpinButton');
const readySpinButton = document.getElementById('readySpinButton');
const feedback = document.getElementById('ruletaFeedback');
const memberName = document.getElementById('ruletaMemberName');
const pendingCount = document.getElementById('ruletaPendingCount');
const statusCopy = document.getElementById('ruletaStatusCopy');
const prizeLabel = document.getElementById('ruletaPrizeLabel');
const prizeCopy = document.getElementById('ruletaPrizeCopy');
const summaryPending = document.getElementById('ruletaSummaryPending');
const summaryPrize = document.getElementById('ruletaSummaryPrize');
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
const btnPrizeCatalog = document.getElementById('btnPrizeCatalog');
const confettiWrap = document.getElementById('confettiWrap');
const prizeGuide = document.getElementById('ruletaPrizeGuide');
const canvas = document.getElementById('ruletaCanvas');
const wheelOuter = document.querySelector('.awka-wheel-outer');
const pointerSvg = document.querySelector('.awka-pointer-wrap svg');

const ctx = canvas.getContext('2d');
let size = canvas.width;
let centerX = size / 2;
let centerY = size / 2;
let radius = size / 2 - 6;
const equalArc = (2 * Math.PI) / PRIZES.length;
const arcs = PRIZES.map(() => equalArc);
const arcStarts = arcs.reduce((acc, arc, index) => {
    acc.push(index === 0 ? 0 : acc[index - 1] + arcs[index - 1]);
    return acc;
}, []);

function updateWheelGeometry(nextSize) {
    size = nextSize;
    centerX = size / 2;
    centerY = size / 2;
    radius = size / 2 - Math.max(6, size * 0.018);
}

let currentProfile = null;
let currentSession = null;
let spinning = false;
let currentRotation = 0;

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
    const disabled = !enabled || spinning;
    spinButton.disabled = disabled;
    readySpinButton.disabled = disabled;
}

function renderPrizeGuide() {
    if (!prizeGuide) {
        return;
    }

    const subtitleForPrize = (prize) => {
        if (prize.type === 'discount') {
            return 'Descuento directo';
        }

        if (prize.type === 'miss') {
            return 'Intento sin premio';
        }

        return 'Producto del catalogo';
    };

    prizeGuide.innerHTML = `
        <div class="awka-prize-guide-title">Premios en juego</div>
        <div class="awka-prize-guide-grid">
            ${PRIZES.map((prize) => `
                <div class="awka-prize-guide-item">
                    <div class="awka-prize-swatch" style="background:${prize.color}"></div>
                    <strong>${prize.label}</strong>
                    <span>${subtitleForPrize(prize)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function openOverlay(element) {
    element.classList.add('show');
}

function closeOverlay(element) {
    element.classList.remove('show');
}

function prizeMetaFromCode(code, fallback = {}) {
    return PRIZES.find((prize) => prize.code === code)
        || PRIZES.find((prize) => prize.label === fallback.label)
        || {
            code: fallback.code || 'unknown',
            label: fallback.label || 'Premio Club Awka',
            mark: 'AWKA',
            badge: 'AW',
            desc: fallback.description || 'Tu resultado ya fue guardado dentro del club.',
            winner: true,
            type: fallback.type || 'product',
            productId: fallback.productId || null,
            productCategory: fallback.productCategory || null,
            discountPercent: fallback.discountPercent || null,
            color: '#2a6030'
        };
}

function profileChangedAfterSpin(previousProfile, nextProfile) {
    if (!previousProfile || !nextProfile) {
        return false;
    }

    if ((nextProfile.spins?.pending || 0) < (previousProfile.spins?.pending || 0)) {
        return true;
    }

    if ((nextProfile.spins?.total || 0) > (previousProfile.spins?.total || 0)) {
        return true;
    }

    return (nextProfile.spins?.latestPrize || '') !== (previousProfile.spins?.latestPrize || '');
}

function buildSpinResultFromProfile(previousProfile, nextProfile) {
    const prize = nextProfile?.spins?.latestPrize;
    if (!prize) {
        return null;
    }

    const meta = prizeMetaFromCode('', { label: prize });
    const winner = Boolean(
        nextProfile?.spins?.latestWinPrize &&
        nextProfile.spins.latestWinPrize === prize &&
        nextProfile.spins.latestWinAt === nextProfile.spins.latestPrizeAt
    );

    return {
        ok: true,
        prize,
        prizeMeta: {
            code: meta.code,
            type: meta.type,
            label: meta.label,
            description: meta.desc,
            discountPercent: meta.discountPercent || null,
            productId: meta.productId || null,
            productCategory: meta.productCategory || null
        },
        winner,
        remainingSpins: nextProfile.spins.pending || 0,
        playedAt: nextProfile.spins.latestPrizeAt || new Date().toISOString()
    };
}

function renderWheel(rotation) {
    ctx.clearRect(0, 0, size, size);
    const isCompactWheel = window.matchMedia('(max-width: 520px)').matches;
    const compactTextRadius = radius * 0.56;
    const wideTextRadius = radius * 0.5;

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

        const labelAngle = start + arcs[index] / 2;
        const textRadius = isCompactWheel ? compactTextRadius : wideTextRadius;
        const textX = centerX + Math.cos(labelAngle) * textRadius;
        const textY = centerY + Math.sin(labelAngle) * textRadius;

        if (isCompactWheel) {
            const wheelLines = prize.wheelLines || [prize.label];
            const longestLine = wheelLines.reduce((max, line) => Math.max(max, line.length), 0);
            const fontSize = longestLine >= 12
                ? Math.max(10, size * 0.03)
                : longestLine >= 9
                    ? Math.max(11, size * 0.032)
                    : Math.max(12, size * 0.034);
            const lineGap = fontSize + 1.8;
            let textRotation = labelAngle + Math.PI / 2;

            if (textRotation > Math.PI / 2 && textRotation < (3 * Math.PI) / 2) {
                textRotation += Math.PI;
            }

            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(textRotation);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(245, 236, 214, 0.98)';
            ctx.font = `700 ${fontSize}px "DM Sans", sans-serif`;

            const startY = -((wheelLines.length - 1) * lineGap) / 2;
            wheelLines.forEach((line, lineIndex) => {
                ctx.fillText(line, 0, startY + (lineIndex * lineGap));
            });
            ctx.restore();
        } else {
            const wheelLines = prize.wheelLines || [prize.label];
            const longestLine = wheelLines.reduce((max, line) => Math.max(max, line.length), 0);
            const fontSize = longestLine >= 12
                ? Math.max(12, size * 0.034)
                : longestLine >= 9
                    ? Math.max(13, size * 0.037)
                    : Math.max(14, size * 0.04);
            const lineGap = fontSize + 1.5;
            let textRotation = labelAngle + Math.PI / 2;

            if (textRotation > Math.PI / 2 && textRotation < (3 * Math.PI) / 2) {
                textRotation += Math.PI;
            }

            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(textRotation);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(245, 236, 214, 0.96)';
            ctx.font = `700 ${fontSize}px "DM Sans", sans-serif`;

            const startY = -((wheelLines.length - 1) * lineGap) / 2;
            wheelLines.forEach((line, lineIndex) => {
                ctx.fillText(line, 0, startY + (lineIndex * lineGap));
            });
            ctx.restore();
        }
    });

    const outerCapRadius = size * 0.1;
    const innerCapRadius = size * 0.076;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerCapRadius, 0, 2 * Math.PI);
    const capGradient = ctx.createRadialGradient(
        centerX - (outerCapRadius * 0.24),
        centerY - (outerCapRadius * 0.24),
        2,
        centerX,
        centerY,
        outerCapRadius
    );
    capGradient.addColorStop(0, '#1a3020');
    capGradient.addColorStop(1, '#07100a');
    ctx.fillStyle = capGradient;
    ctx.fill();
    ctx.strokeStyle = '#2a6030';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerCapRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#1a3020';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function resizeCanvas() {
    const outerWidth = wheelOuter?.getBoundingClientRect().width || 340;
    const isCompactWheel = window.matchMedia('(max-width: 520px)').matches;
    const outerPadding = isCompactWheel ? 14 : 24;
    const maxTarget = isCompactWheel ? 258 : 340;
    const minTarget = isCompactWheel ? 214 : 260;
    const target = Math.max(minTarget, Math.min(maxTarget, outerWidth - outerPadding));
    const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const drawSize = Math.round(target * pixelRatio);

    canvas.style.width = `${target}px`;
    canvas.style.height = `${target}px`;
    canvas.width = drawSize;
    canvas.height = drawSize;
    updateWheelGeometry(drawSize);

    const centerSize = Math.round(target * (isCompactWheel ? 0.26 : 0.21));
    spinButton.style.width = `${centerSize}px`;
    spinButton.style.height = `${centerSize}px`;
    spinButton.style.fontSize = `${Math.max(12, centerSize * 0.25)}px`;

    if (pointerSvg) {
        pointerSvg.style.width = `${Math.round(target * (isCompactWheel ? 0.1 : 0.082))}px`;
        pointerSvg.style.height = `${Math.round(target * (isCompactWheel ? 0.15 : 0.124))}px`;
    }

    renderWheel(currentRotation);
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
    if (summaryPending) {
        summaryPending.textContent = formatPending(profile);
    }

    if (profile.spins.pending > 0) {
        statusCopy.textContent = 'Tu giro ya esta listo.';
        setFeedback('Tu sesion esta lista. Presiona GIRAR.', 'success');
        setSpinEnabled(true);
    } else {
        statusCopy.textContent = 'Sin giros por ahora.';
        setFeedback('No tienes giros pendientes.', 'error');
        setSpinEnabled(false);
    }

    if (profile.spins.latestPrize) {
        prizeLabel.textContent = profile.spins.latestPrize;
        if (summaryPrize) {
            summaryPrize.textContent = profile.spins.latestPrize;
        }
        prizeCopy.textContent = profile.spins.latestWinPrize
            ? `Ultimo premio: ${profile.spins.latestWinPrize}.`
            : 'Tu ultimo giro ya quedo guardado.';
    } else if (summaryPrize) {
        summaryPrize.textContent = 'Aun sin girar';
    }
}

function applySpinResultLocally(spinResult) {
    if (!currentProfile) return;

    currentProfile = {
        ...currentProfile,
        spins: {
            ...currentProfile.spins,
            pending: Math.max(0, Number(spinResult.remainingSpins || 0)),
            total: currentProfile.spins.total + 1,
            wins: currentProfile.spins.wins + (spinResult.winner ? 1 : 0),
            latestPrize: spinResult.prize,
            latestPrizeAt: spinResult.playedAt,
            latestWinPrize: spinResult.winner ? spinResult.prize : currentProfile.spins.latestWinPrize,
            latestWinAt: spinResult.winner ? spinResult.playedAt : currentProfile.spins.latestWinAt
        },
        history: [
            {
                prize: spinResult.prize,
                winner: spinResult.winner,
                createdAt: spinResult.playedAt
            },
            ...(currentProfile.history || [])
        ].slice(0, 5)
    };

    renderProfile(currentProfile);
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

function animateToPrize(spinResult) {
    const prize = prizeMetaFromCode(spinResult.prizeMeta?.code, spinResult.prizeMeta || { label: spinResult.prize });
    const prizeIndex = Math.max(0, PRIZES.findIndex((item) => item.code === prize.code));
    const targetAngle = -(arcStarts[prizeIndex] + equalArc / 2) + Math.PI * 1.5;
    const targetDegrees = (((targetAngle * 180) / Math.PI) % 360 + 360) % 360;
    const currentNormalized = ((currentRotation % 360) + 360) % 360;
    const extraSpins = (5 + Math.floor(Math.random() * 5)) * 360;
    const delta = extraSpins + ((targetDegrees - currentNormalized + 360) % 360);
    const duration = 2600;

    return new Promise((resolve) => {
        const nextRotation = currentRotation + delta;
        currentRotation = nextRotation;
        canvas.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        canvas.style.transform = `rotate(${nextRotation}deg)`;
        window.setTimeout(resolve, duration + 60);
    });
}

function buildWhatsappLink(profileName, prize) {
    const message = encodeURIComponent(
        `Hola! Soy ${profileName}. Gire la ruleta de Club Awka y obtuve: ${prize.label} ${prize.emoji}`
    );

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function buildCatalogLink(prize) {
    if (prize.type !== 'product' || !prize.productCategory) {
        return 'shop.html';
    }

    return `shop.html#${prize.productCategory}`;
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

function showPrizeModal(spinResult) {
    const prize = prizeMetaFromCode(spinResult.prizeMeta?.code, spinResult.prizeMeta || { label: spinResult.prize });
    prizeEmoji.textContent = prize.badge || prize.mark || 'AW';
    prizeEyebrow.textContent = spinResult.winner ? 'Felicitaciones' : 'Gracias por participar';
    prizeName.textContent = prize.label;
    prizeDesc.textContent = spinResult.winner
        ? `${prize.desc} Ya quedo guardado en tu historial.`
        : `${prize.desc} Este intento tambien quedo guardado.`;
    btnWsp.href = buildWhatsappLink(currentProfile?.name || 'Club Awka', prize);
    btnPrizeCatalog.href = buildCatalogLink(prize);
    btnPrizeCatalog.hidden = prize.type !== 'product';
    openOverlay(overlayPrize);

    if (spinResult.winner) {
        launchConfetti(prize.color);
    }
}

async function requestSpin(token) {
    const response = await fetch('/api/club-spin', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    let data = {};
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.message || 'No pudimos completar el giro.');
    }

    return data;
}

function refreshProfileSilently(token) {
    fetchProfile(token)
        .then(renderProfile)
        .catch(() => {});
}

async function loadPlay() {
    currentSession = loadSession();
    if (!currentSession?.token) {
        if (summaryPending) {
            summaryPending.textContent = 'Sin sesion';
        }
        if (summaryPrize) {
            summaryPrize.textContent = 'Inicia sesion';
        }
        setFeedback('Primero inicia sesion en Club Awka para usar la ruleta.', 'error');
        setSpinEnabled(false);
        return;
    }

    try {
        const profile = await fetchProfile(currentSession.token);
        renderProfile(profile);
    } catch (error) {
        if (summaryPending) {
            summaryPending.textContent = 'Acceso no valido';
        }
        if (summaryPrize) {
            summaryPrize.textContent = 'Reintenta';
        }
        setFeedback(error.message || 'No pudimos validar tu acceso.', 'error');
        setSpinEnabled(false);
    }
}

async function confirmSpin() {
    if (!currentSession?.token || spinning || !currentProfile?.spins?.pending) {
        return;
    }

    const profileBeforeSpin = currentProfile ? JSON.parse(JSON.stringify(currentProfile)) : null;
    spinning = true;
    setSpinEnabled(false);
    closeOverlay(overlayReady);
    setFeedback('Girando...', 'success');

    let spinResult;
    let recoveredFromProfile = false;
    try {
        spinResult = await requestSpin(currentSession.token);
    } catch (error) {
        try {
            const refreshedProfile = await fetchProfile(currentSession.token);
            if (profileChangedAfterSpin(profileBeforeSpin, refreshedProfile)) {
                renderProfile(refreshedProfile);
                spinResult = buildSpinResultFromProfile(profileBeforeSpin, refreshedProfile);
                recoveredFromProfile = true;
            } else {
                throw error;
            }
        } catch (recoveryError) {
            setFeedback(error.message || 'No pudimos completar el giro.', 'error');
            spinning = false;
            setSpinEnabled(Boolean(currentProfile?.spins?.pending));
            return;
        }
    }

    if (!recoveredFromProfile) {
        applySpinResultLocally(spinResult);
    }

    try {
        await animateToPrize(spinResult);
    } catch (animationError) {
        console.error('Wheel animation error', animationError);
    }

    try {
        showPrizeModal(spinResult);
    } catch (modalError) {
        console.error('Prize modal error', modalError);
    }

    window.awkaAnalytics?.trackSpin({
        prize: spinResult.prize,
        code: spinResult.prizeMeta?.code || '',
        type: spinResult.prizeMeta?.type || '',
        winner: spinResult.winner
    });

    setFeedback(
        spinResult.winner ? `Ganaste ${spinResult.prize}.` : `Resultado: ${spinResult.prize}.`,
        spinResult.winner ? 'success' : ''
    );

    refreshProfileSilently(currentSession.token);
    spinning = false;
    setSpinEnabled(Boolean(currentProfile?.spins?.pending));
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
renderPrizeGuide();
renderWheel(0);
loadPlay();
