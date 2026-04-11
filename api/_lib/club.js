const CLUB_ENV_ERROR = 'AWKA_CLUB_NOT_CONFIGURED';

function normalizePhone(phone = '') {
    return String(phone).replace(/\D/g, '').slice(-10);
}

function json(res, statusCode, payload) {
    res.status(statusCode).setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
}

function getClubEnv() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        return null;
    }

    return {
        url: url.replace(/\/$/, ''),
        serviceRoleKey
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

function buildProfile({ phone, customer, pointsRow, spins, pendingSpins }) {
    const history = (spins || []).slice(0, 5).map((spin) => ({
        prize: spin.premio || 'Sin resultado',
        winner: Boolean(spin.ganador),
        createdAt: spin.created_at || spin.fecha || null
    }));

    return {
        exists: Boolean(customer),
        phone,
        name: customer?.nombre || 'Invitado Awka',
        points: {
            current: pointsRow?.puntos || 0,
            redeemed: pointsRow?.puntos_canjeados || 0,
            lastActivity: pointsRow?.ultima_actividad || null
        },
        spins: {
            pending: pendingSpins?.length || 0,
            total: spins?.length || 0,
            wins: (spins || []).filter((spin) => spin.ganador).length
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
    const [customerRows, pointsRows, spinRows, pendingRows] = await Promise.all([
        supabaseRequest(`clientes?select=nombre,telefono&telefono=eq.${encodedPhone}&limit=1`),
        supabaseRequest(`puntos?select=puntos,puntos_canjeados,ultima_actividad&telefono=eq.${encodedPhone}&limit=1`),
        supabaseRequest(`ruleta_registros?select=premio,ganador,created_at,fecha&telefono=eq.${encodedPhone}&order=created_at.desc.nullslast,fecha.desc.nullslast`),
        supabaseRequest(`giros_habilitados?select=id,estado&telefono=eq.${encodedPhone}&estado=eq.pendiente`)
    ]);

    return buildProfile({
        phone: normalizedPhone,
        customer: customerRows?.[0] || null,
        pointsRow: pointsRows?.[0] || null,
        spins: spinRows || [],
        pendingSpins: pendingRows || []
    });
}

module.exports = {
    CLUB_ENV_ERROR,
    fetchClubProfile,
    getClubEnv,
    json,
    normalizePhone
};
