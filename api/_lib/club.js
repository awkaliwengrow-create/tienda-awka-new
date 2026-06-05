const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CLUB_ENV_ERROR = 'AWKA_CLUB_NOT_CONFIGURED';
const POINTS_PER_AMOUNT = Number(process.env.AWKA_POINTS_PER_AMOUNT) || 5000;
const REDEEM_VALUE_PER_POINT = Number(process.env.AWKA_REDEEM_VALUE_PER_POINT) || 500;
const LEVELS = [
    { key: 'nuevo', label: 'Nuevo', minPurchases: 0, maxPurchases: 1 },
    { key: 'recurrente', label: 'Recurrente', minPurchases: 2, maxPurchases: 4 },
    { key: 'fiel', label: 'Fiel', minPurchases: 5, maxPurchases: Infinity }
];
const LEVEL_BENEFITS = {
    nuevo: {
        current: [
            'Perfil privado con puntos, compras y giros visibles.',
            'Acceso a activaciones generales del club.',
            '1 giro de bienvenida en tu primera compra aprobada.',
            'Posibilidad de giros puntuales por campanas operativas.'
        ],
        nextUnlock: 'Al llegar a Recurrente desbloqueas 1 giro bonus y una ventana de activaciones mas frecuente.'
    },
    recurrente: {
        current: [
            'Giro bonus automatico al alcanzar este nivel.',
            '1 giro de impulso en la cuarta compra aprobada.',
            'Acceso a activaciones mas frecuentes dentro del club.',
            'Mayor prioridad para giros y dinamicas promocionales.',
            'Seguimiento claro del progreso hacia el nivel Fiel.'
        ],
        nextUnlock: 'Al llegar a Fiel desbloqueas 2 giros bonus, beneficios exclusivos y premios mejorados.'
    },
    fiel: {
        current: [
            'Dos giros bonus automaticos al alcanzar este nivel.',
            'Acceso a beneficios exclusivos del club.',
            'Prioridad en activaciones especiales y premios destacados.',
            'Mejor posicion para campanas y ventajas reservadas a clientes fieles.',
            'Cadencia premium: 1 giro extra cada 3 compras aprobadas despues de llegar a Fiel.',
            'Compras premium pueden activar un giro extra dentro del nivel Fiel.'
        ],
        nextUnlock: 'Ya estas en el nivel mas alto de esta etapa del club.'
    }
};
const SEGMENT_CAMPAIGNS = {
    nuevo: [
        {
            id: 'nuevo-bienvenida-play',
            title: 'Bienvenida Play',
            audience: 'Nuevo',
            benefit: '1 giro de bienvenida en tu primera compra aprobada.',
            description: 'El primer avance real dentro del club ya abre una experiencia de juego para conectar compra, perfil y premio.',
            cta: 'Completa tu primera compra aprobada para entrar con un giro a Awka Play.',
            automation: 'Se dispara automaticamente en la primera compra aprobada.'
        },
        {
            id: 'nuevo-segunda-compra',
            title: 'Campana segunda compra',
            audience: 'Nuevo',
            benefit: 'Acerca tu salto a Recurrente.',
            description: 'Con tu proxima compra quedas a un paso del primer desbloqueo fuerte del club.',
            cta: 'Suma una compra mas para entrar a Recurrente y recibir 1 giro bonus automatico.',
            automation: 'Se muestra a perfiles Nuevo con margen corto al siguiente nivel.'
        }
    ],
    recurrente: [
        {
            id: 'recurrente-ventana-play',
            title: 'Ventana Play Recurrente',
            audience: 'Recurrente',
            benefit: 'Mas prioridad para dinamicas y giros.',
            description: 'Este segmento entra en activaciones mas frecuentes y puede recibir beneficios de play antes que el ingreso general.',
            cta: 'Mantente activo para consolidar tu avance hacia Fiel.',
            automation: 'Se activa automaticamente al llegar a Recurrente.'
        },
        {
            id: 'recurrente-impulso-fiel',
            title: 'Impulso a Fiel',
            audience: 'Recurrente',
            benefit: '1 giro extra en tu cuarta compra aprobada.',
            description: 'El ultimo tramo antes de Fiel tiene un empuje adicional para no cortar el ritmo de compra.',
            cta: 'Sosten tu frecuencia: la cuarta compra activa un giro extra y te deja a un paso de Fiel.',
            automation: 'Se dispara automaticamente en la cuarta compra aprobada.'
        }
    ],
    fiel: [
        {
            id: 'fiel-mesa-exclusiva',
            title: 'Mesa Fiel',
            audience: 'Fiel',
            benefit: 'Acceso a campanas reservadas y premios mas altos.',
            description: 'Los perfiles Fiel entran primero a beneficios especiales y ocupan la prioridad mas alta del club.',
            cta: 'Sigue comprando para sostener tu ventaja y entrar a activaciones premium.',
            automation: 'Siempre visible para clientes Fiel.'
        },
        {
            id: 'fiel-spin-cadencia',
            title: 'Cadencia Fiel',
            audience: 'Fiel',
            benefit: '1 giro extra cada 3 compras aprobadas despues de llegar a Fiel.',
            description: 'La fidelidad alta ya no solo desbloquea un hito: genera una ventaja repetible.',
            cta: 'Cada nuevo tramo de 3 compras vuelve a activar un giro de fidelidad.',
            automation: 'Se dispara automaticamente en las compras 8, 11, 14 y siguientes.'
        },
        {
            id: 'fiel-prioridad-premium',
            title: 'Prioridad premium Fiel',
            audience: 'Fiel',
            benefit: 'Entrada prioritaria a activaciones premium despues de consolidar el nivel.',
            description: 'El cliente Fiel no solo mantiene beneficios: pasa a una capa mas prioritaria dentro del ecosistema.',
            cta: 'Mantente activo para seguir entrando primero en acciones premium y premios especiales.',
            automation: 'Se registra automaticamente desde la compra 6 como consolidacion del nivel Fiel.'
        },
        {
            id: 'fiel-compra-premium',
            title: 'Compra premium Fiel',
            audience: 'Fiel',
            benefit: '1 giro extra cuando una compra Fiel supera el umbral premium.',
            description: 'El tramo mas alto del club tambien reconoce compras de mayor valor con una activacion adicional.',
            cta: 'Mantener compras de valor alto puede abrir un giro extra ademas de la cadencia de fidelidad.',
            automation: 'Se dispara automaticamente cuando una compra Fiel supera el umbral premium.'
        }
    ]
};
const CAMPAIGN_TITLES = {
    ...Object.fromEntries(
        Object.values(SEGMENT_CAMPAIGNS)
            .flat()
            .map((campaign) => [campaign.id, campaign.title])
    ),
    'club-reactivacion-regreso': 'Regreso con reactivacion'
};
const REWARD_CATALOG = [
    { key: '9:45ml', productId: 9, sizeLabel: '45ml', pointsCost: 3, productName: 'Biocann 45ml' },
    { key: '2:45ml', productId: 2, sizeLabel: '45ml', pointsCost: 4, productName: 'Tree Mix F 45ml' },
    { key: '3:45ml', productId: 3, sizeLabel: '45ml', pointsCost: 4, productName: 'Tree Mix Candy 45ml' },
    { key: '1:45ml', productId: 1, sizeLabel: '45ml', pointsCost: 4, productName: 'Tree Mix N 45ml' },
    { key: '4:45ml', productId: 4, sizeLabel: '45ml', pointsCost: 5, productName: 'Tree Mix Pro 45ml' },
    { key: '5:45ml', productId: 5, sizeLabel: '45ml', pointsCost: 6, productName: 'Tree Mix Mico 45ml' }
];
const GENERATED_REWARD_CATALOG_PATH = path.join(__dirname, 'reward-catalog.generated.json');
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function diffDaysFromNow(value) {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const diffMs = Date.now() - parsed.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function normalizePhone(phone = '') {
    return String(phone).replace(/\D/g, '').slice(-10);
}

function json(res, statusCode, payload) {
    res.status(statusCode).setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
}

function calculateLevel(totalPurchases = 0) {
    const current = LEVELS.find((level) => totalPurchases >= level.minPurchases && totalPurchases <= level.maxPurchases) || LEVELS[0];
    const next = LEVELS.find((level) => level.minPurchases > current.minPurchases) || null;
    const benefits = LEVEL_BENEFITS[current.key] || LEVEL_BENEFITS.nuevo;

    return {
        key: current.key,
        label: current.label,
        purchaseCount: totalPurchases,
        nextLabel: next?.label || null,
        purchasesToNext: next ? Math.max(0, next.minPurchases - totalPurchases) : 0,
        benefits: benefits.current,
        nextUnlock: benefits.nextUnlock
    };
}

function getCampaignsForLevel(levelKey, context = {}) {
    const baseCampaigns = SEGMENT_CAMPAIGNS[levelKey] || [];
    const campaigns = baseCampaigns.map((campaign) => ({
        ...campaign,
        status: 'activa'
    }));

    if (levelKey === 'nuevo' && context.purchasesToNext > 1) {
        const secondPurchaseIndex = campaigns.findIndex((campaign) => campaign.id === 'nuevo-segunda-compra');
        if (secondPurchaseIndex >= 0) {
            campaigns[secondPurchaseIndex] = {
                ...campaigns[secondPurchaseIndex],
                cta: `Te faltan ${context.purchasesToNext} compras para desbloquear Recurrente.`,
                description: 'Todavia estas construyendo tu primer tramo fuerte dentro del club.'
            };
        }
    }

    if (levelKey === 'nuevo' && context.purchaseCount === 1) {
        campaigns.push({
            id: 'nuevo-cierre-recurrente',
            title: 'Cierre a Recurrente',
            audience: 'Nuevo',
            benefit: 'Estas a una compra de salir del tramo inicial del club.',
            description: 'Tu siguiente compra no solo suma puntos: te mueve a Recurrente y activa un giro bonus automatico.',
            cta: 'Aprovecha este momento para hacer la segunda compra y destrabar el primer salto fuerte del ecosistema.',
            automation: 'Se muestra cuando el cliente Nuevo ya tiene 1 compra aprobada.',
            status: 'activa'
        });
    }

    if (context.daysSinceActivity !== null && context.daysSinceActivity >= 30) {
        campaigns.push({
            id: `${levelKey}-reactivacion-suave`,
            title: 'Reactivacion del ritmo',
            audience: levelKey === 'fiel' ? 'Fiel' : levelKey === 'recurrente' ? 'Recurrente' : 'Nuevo',
            benefit: 'Tu perfil lleva varios dias sin actividad reciente.',
            description: 'El sistema detecta una pausa en tu ritmo. Volver a comprar o usar un giro te mantiene dentro de las activaciones vigentes.',
            cta: `Tu ultima actividad fue hace ${context.daysSinceActivity} dias. Tu proxima compra aprobada puede reactivar el perfil con un giro adicional.`,
            automation: 'Se muestra automaticamente despues de 30 dias sin actividad registrada.',
            status: 'activa'
        });
    }

    if (levelKey === 'recurrente' && typeof context.pendingSpins === 'number') {
        campaigns.push({
            id: 'recurrente-play-activo',
            title: 'Seguimiento de giros',
            audience: 'Recurrente',
            benefit: context.pendingSpins > 0 ? 'Ya tienes giros listos para usar.' : 'Tu proximo giro puede venir por compra, admin o activacion.',
            description: context.pendingSpins > 0
                ? 'Tu perfil ya tiene una ventana play activa. Aprovechala antes de perder el ritmo.'
                : 'Este nivel entra primero en activaciones operativas del club y suele recibir giros antes que un perfil Nuevo.',
            cta: context.pendingSpins > 0 ? 'Entra a Awka Play para usar tus giros pendientes.' : 'Sosten tu ritmo de compra para acercarte a Fiel.',
            automation: 'Se ajusta automaticamente segun tu disponibilidad de giros.'
        });
    }

    if (levelKey === 'recurrente' && context.purchasesToNext === 1) {
        campaigns.push({
            id: 'recurrente-cierre-fiel',
            title: 'Cierre a Fiel',
            audience: 'Recurrente',
            benefit: 'Estas a una compra del nivel mas alto del club.',
            description: 'Tu siguiente compra aprobada te mueve a Fiel, libera 2 giros bonus y abre la capa premium.',
            cta: 'Mantente activo ahora para no perder la ventana mas valiosa de progresion.',
            automation: 'Se muestra cuando el cliente Recurrente queda a una compra de Fiel.',
            status: 'activa'
        });
    }

    if (levelKey === 'fiel' && typeof context.totalPurchases === 'number') {
        const fidelityCampaignIndex = campaigns.findIndex((campaign) => campaign.id === 'fiel-spin-cadencia');
        const purchasesSinceFiel = Math.max(0, context.totalPurchases - 5);
        const remainder = purchasesSinceFiel % 3;
        const purchasesToCadence = remainder === 0 ? 3 : 3 - remainder;

        if (fidelityCampaignIndex >= 0) {
            campaigns[fidelityCampaignIndex] = {
                ...campaigns[fidelityCampaignIndex],
                cta: `Te faltan ${purchasesToCadence} compra${purchasesToCadence === 1 ? '' : 's'} para el proximo giro de fidelidad.`,
                description: purchasesSinceFiel === 0
                    ? 'Acabas de consolidar Fiel. La siguiente capa automatica vuelve a premiar tu continuidad.'
                    : 'Cada nuevo tramo completo de 3 compras aprobadas vuelve a abrir un giro premium.'
            };
        }

        if (purchasesSinceFiel >= 1) {
            campaigns.push({
                id: 'fiel-mantenimiento-premium',
                title: 'Mantenimiento premium',
                audience: 'Fiel',
                benefit: 'Tu perfil ya esta sosteniendo el tramo premium del club.',
                description: 'El objetivo ahora no es solo sostener puntos, sino mantener frecuencia para seguir entrando primero en activaciones y premios.',
                cta: `Te faltan ${purchasesToCadence} compra${purchasesToCadence === 1 ? '' : 's'} para volver a disparar un giro de fidelidad.`,
                automation: 'Se muestra cuando el cliente Fiel ya supero el desbloqueo inicial.'
            });
        }
    }

    return campaigns;
}

function getCampaignCatalog() {
    return Object.values(SEGMENT_CAMPAIGNS).flat();
}

function getRewardCatalog() {
    try {
        if (fs.existsSync(GENERATED_REWARD_CATALOG_PATH)) {
            const raw = fs.readFileSync(GENERATED_REWARD_CATALOG_PATH, 'utf8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length) {
                return parsed;
            }
        }
    } catch (error) {
        // Fallback silencioso al catalogo interno.
    }

    return REWARD_CATALOG;
}

function getClubEnv() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const sessionSecret = process.env.CLUB_SESSION_SECRET;

    if (!url || !serviceRoleKey || !sessionSecret) {
        return null;
    }

    return {
        url: url.replace(/\/$/, ''),
        serviceRoleKey,
        sessionSecret
    };
}

async function supabaseRequest(path, options = {}) {
    const env = getClubEnv();
    if (!env) {
        const error = new Error(CLUB_ENV_ERROR);
        error.code = CLUB_ENV_ERROR;
        throw error;
    }

    const response = await fetch(`${env.url}/rest/v1/${path}`, {
        ...options,
        headers: {
            apikey: env.serviceRoleKey,
            Authorization: `Bearer ${env.serviceRoleKey}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const detail = await response.text();
        const error = new Error(`SUPABASE_${response.status}`);
        error.code = `SUPABASE_${response.status}`;
        error.detail = detail;
        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function savePointsLedger({ phone, name, points, redeemedPoints, lastActivity }) {
    const normalizedPhone = normalizePhone(phone);
    const encodedPhone = encodeURIComponent(normalizedPhone);
    const payload = {
        telefono: normalizedPhone,
        nombre: name || 'Cliente Awka',
        puntos: Number(points || 0),
        puntos_canjeados: Number(redeemedPoints || 0),
        ultima_actividad: lastActivity || new Date().toISOString()
    };

    const existingRows = await supabaseRequest(
        `puntos?select=id&telefono=eq.${encodedPhone}&limit=1`
    );

    if (existingRows?.[0]?.id) {
        await supabaseRequest(`puntos?telefono=eq.${encodedPhone}`, {
            method: 'PATCH',
            headers: {
                Prefer: 'return=representation'
            },
            body: JSON.stringify(payload)
        });
        return;
    }

    await supabaseRequest('puntos', {
        method: 'POST',
        headers: {
            Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
    });
}

function createPinHash(pin) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.pbkdf2Sync(pin, salt, 100000, 32, 'sha256').toString('hex');
    return `pbkdf2$${salt}$${derived}`;
}

function verifyPin(pin, storedValue = '') {
    if (!storedValue || typeof storedValue !== 'string') {
        return false;
    }

    if (!storedValue.startsWith('pbkdf2$')) {
        return storedValue === pin;
    }

    const [, salt, expected] = storedValue.split('$');
    const derived = crypto.pbkdf2Sync(pin, salt, 100000, 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(expected, 'hex'));
}

function createSessionToken(phone) {
    const env = getClubEnv();
    if (!env) {
        const error = new Error(CLUB_ENV_ERROR);
        error.code = CLUB_ENV_ERROR;
        throw error;
    }

    const payload = {
        phone,
        exp: Date.now() + SESSION_DURATION_MS
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', env.sessionSecret)
        .update(encodedPayload)
        .digest('base64url');

    return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token = '') {
    const env = getClubEnv();
    if (!env || !token || !token.includes('.')) {
        return null;
    }

    const [encodedPayload, signature] = token.split('.');
    const expected = crypto
        .createHmac('sha256', env.sessionSecret)
        .update(encodedPayload)
        .digest('base64url');

    if (signature !== expected) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
        if (!payload.phone || !payload.exp || payload.exp < Date.now()) {
            return null;
        }

        return payload;
    } catch (error) {
        return null;
    }
}

function getBearerToken(req) {
    const header = req.headers?.authorization || '';
    if (!header.startsWith('Bearer ')) {
        return '';
    }

    return header.slice(7).trim();
}

async function fetchCustomerByPhone(phone) {
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || normalizedPhone.length < 8) {
        const error = new Error('INVALID_PHONE');
        error.code = 'INVALID_PHONE';
        throw error;
    }

    const rows = await supabaseRequest(
        `clientes?select=id,nombre,telefono,pin,created_at&telefono=eq.${encodeURIComponent(normalizedPhone)}&limit=1`
    );

    return rows?.[0] || null;
}

function buildProfile({ phone, customer, pointsRow, spins, pendingSpins, purchases, levelHistory, campaignHistory, redemptions }) {
    const normalizedSpins = (spins || []).map((spin) => ({
        prize: spin.premio || 'Sin resultado',
        winner: Boolean(spin.ganador),
        createdAt: spin.created_at || spin.fecha || null
    }));
    const history = normalizedSpins.slice(0, 5);
    const latestWin = normalizedSpins.find((spin) => spin.winner) || null;
    const latestSpin = normalizedSpins[0] || null;
    const totalPurchases = purchases?.length || 0;
    const totalSpent = (purchases || []).reduce((sum, purchase) => sum + (Number(purchase.monto_total) || 0), 0);
    const latestPurchaseAt = purchases?.[0]?.created_at || null;
    const latestActivityAt = pointsRow?.ultima_actividad || latestPurchaseAt || latestSpin?.createdAt || null;
    const level = calculateLevel(totalPurchases);
    const latestLevelUnlock = levelHistory?.[0] || null;
    const campaigns = getCampaignsForLevel(level.key, {
        purchaseCount: totalPurchases,
        purchasesToNext: level.purchasesToNext,
        pendingSpins: pendingSpins?.length || 0,
        totalPurchases,
        totalSpent,
        daysSinceActivity: diffDaysFromNow(latestActivityAt)
    });
    const latestCampaignActivation = campaignHistory?.[0] || null;

    return {
        exists: Boolean(customer),
        phone,
        name: customer?.nombre || 'Invitado Awka',
        level: {
            ...level,
            totalSpent,
            latestUnlock: latestLevelUnlock
                ? {
                    from: latestLevelUnlock.nivel_anterior,
                    to: latestLevelUnlock.nivel_nuevo,
                    reason: latestLevelUnlock.motivo || '',
                    createdAt: latestLevelUnlock.created_at || null
                }
                : null
        },
        points: {
            current: pointsRow?.puntos || 0,
            redeemed: pointsRow?.puntos_canjeados || 0,
            lastActivity: pointsRow?.ultima_actividad || null
        },
        rewardPolicy: {
            earningValue: POINTS_PER_AMOUNT,
            redeemValue: REDEEM_VALUE_PER_POINT
        },
        rewardCatalog: getRewardCatalog().map((reward) => ({
            key: reward.key,
            productId: reward.productId,
            productName: reward.productName,
            sizeLabel: reward.sizeLabel,
            pointsCost: reward.pointsCost,
            referencePrice: reward.referencePrice || 0
        })),
        campaigns: {
            audience: level.label,
            total: campaigns.length,
            featured: campaigns[0] || null,
            items: campaigns,
            latestActivation: latestCampaignActivation
                ? {
                    id: latestCampaignActivation.campaign_id,
                    title: CAMPAIGN_TITLES[latestCampaignActivation.campaign_id] || latestCampaignActivation.campaign_id,
                    trigger: latestCampaignActivation.trigger_type || 'automatico',
                    createdAt: latestCampaignActivation.created_at || null,
                    note: latestCampaignActivation.note || ''
                }
                : null
        },
        spins: {
            pending: pendingSpins?.length || 0,
            total: normalizedSpins.length,
            wins: normalizedSpins.filter((spin) => spin.winner).length,
            latestPrize: latestSpin?.prize || null,
            latestPrizeAt: latestSpin?.createdAt || null,
            latestWinPrize: latestWin?.prize || null,
            latestWinAt: latestWin?.createdAt || null
        },
        redemptions: {
            total: redemptions?.length || 0,
            items: (redemptions || []).slice(0, 4).map((item) => ({
                id: item.id,
                productId: item.product_id,
                productName: item.product_name,
                sizeLabel: item.size_label,
                pointsCost: item.points_cost,
                status: item.estado,
                createdAt: item.created_at || null,
                deliveredAt: item.delivered_at || null
            }))
        },
        history
    };
}

async function fetchClubProfile(phone) {
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || normalizedPhone.length < 8) {
        const error = new Error('INVALID_PHONE');
        error.code = 'INVALID_PHONE';
        throw error;
    }

    const encodedPhone = encodeURIComponent(normalizedPhone);
    const [customerRows, pointsRows, spinRows, pendingRows, purchaseRows, levelHistoryRows, campaignHistoryRows, redemptionRows] = await Promise.all([
        supabaseRequest(`clientes?select=nombre,telefono&telefono=eq.${encodedPhone}&limit=1`),
        supabaseRequest(`puntos?select=puntos,puntos_canjeados,ultima_actividad&telefono=eq.${encodedPhone}&limit=1`),
        supabaseRequest(`ruleta_registros?select=premio,ganador,created_at,fecha&telefono=eq.${encodedPhone}&order=created_at.desc.nullslast,fecha.desc.nullslast`),
        supabaseRequest(`giros_habilitados?select=id,estado&telefono=eq.${encodedPhone}&estado=eq.pendiente`),
        supabaseRequest(`club_compras?select=referencia,monto_total,created_at&telefono=eq.${encodedPhone}&estado=eq.aprobada&order=created_at.desc`),
        supabaseRequest(`club_niveles_historial?select=nivel_anterior,nivel_nuevo,motivo,created_at&telefono=eq.${encodedPhone}&order=created_at.desc&limit=1`).catch(() => []),
        supabaseRequest(`club_campaign_activations?select=campaign_id,trigger_type,note,created_at&telefono=eq.${encodedPhone}&order=created_at.desc&limit=3`).catch(() => []),
        supabaseRequest(`club_reward_redemptions?select=id,product_id,product_name,size_label,points_cost,estado,created_at,delivered_at&telefono=eq.${encodedPhone}&order=created_at.desc&limit=8`).catch(() => [])
    ]);

    return buildProfile({
        phone: normalizedPhone,
        customer: customerRows?.[0] || null,
        pointsRow: pointsRows?.[0] || null,
        spins: spinRows || [],
        pendingSpins: pendingRows || [],
        purchases: purchaseRows || [],
        levelHistory: levelHistoryRows || [],
        campaignHistory: campaignHistoryRows || [],
        redemptions: redemptionRows || []
    });
}

module.exports = {
    CLUB_ENV_ERROR,
    CAMPAIGN_TITLES,
    calculateLevel,
    createPinHash,
    createSessionToken,
    fetchClubProfile,
    fetchCustomerByPhone,
    getCampaignCatalog,
    getCampaignsForLevel,
    getRewardCatalog,
    getBearerToken,
    getClubEnv,
    json,
    normalizePhone,
    savePointsLedger,
    supabaseRequest,
    verifyPin,
    verifySessionToken
};
