const { getClubEnv, json, normalizePhone } = require('./_lib/club');

const POINTS_PER_AMOUNT = Number(process.env.AWKA_POINTS_PER_AMOUNT) || 5000;

async function readJsonBody(req) {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    if (typeof req.body === 'string' && req.body.trim()) {
        return JSON.parse(req.body);
    }

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
}

async function supabaseRequest(path, options = {}) {
    const env = getClubEnv();
    if (!env) {
        throw new Error('AWKA_CLUB_NOT_CONFIGURED');
    }

    const response = await fetch(`${env.url}/rest/v1/${path}`, {
        ...options,
        headers: {
            apikey: env.serviceRoleKey,
            Authorization: `Bearer ${env.serviceRoleKey}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Prefer: 'return=representation,resolution=merge-duplicates',
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

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    try {
        const body = await readJsonBody(req);
        const phone = normalizePhone(body.phone || '');
        const name = String(body.name || 'Cliente Awka').trim() || 'Cliente Awka';
        const reference = String(body.reference || '').trim();
        const totalAmount = Number(body.totalAmount) || 0;

        if (!phone || phone.length < 8 || !reference || totalAmount <= 0) {
            json(res, 400, { error: 'Invalid payload', message: 'Faltan datos para acreditar puntos.' });
            return;
        }

        const existingMovement = await supabaseRequest(
            `club_puntos_movimientos?select=id,puntos,monto_total,referencia&referencia=eq.${encodeURIComponent(reference)}&limit=1`
        );

        if (existingMovement?.length) {
            json(res, 200, {
                awarded: false,
                duplicate: true,
                points: existingMovement[0].puntos || 0,
                amount: existingMovement[0].monto_total || totalAmount,
                message: 'La compra ya había sido procesada.'
            });
            return;
        }

        const pointsToAward = Math.max(0, Math.floor(totalAmount / POINTS_PER_AMOUNT));

        await supabaseRequest('clientes?on_conflict=telefono', {
            method: 'POST',
            body: JSON.stringify({
                nombre: name,
                telefono: phone
            })
        }).catch(() => null);

        const currentPointsRows = await supabaseRequest(
            `puntos?select=id,puntos,puntos_canjeados&telefono=eq.${encodeURIComponent(phone)}&limit=1`
        );

        const currentPoints = currentPointsRows?.[0]?.puntos || 0;
        const redeemedPoints = currentPointsRows?.[0]?.puntos_canjeados || 0;

        await supabaseRequest('puntos?on_conflict=telefono', {
            method: 'POST',
            body: JSON.stringify({
                telefono: phone,
                nombre: name,
                puntos: currentPoints + pointsToAward,
                puntos_canjeados: redeemedPoints,
                ultima_actividad: new Date().toISOString()
            })
        });

        await supabaseRequest('club_puntos_movimientos', {
            method: 'POST',
            body: JSON.stringify({
                referencia: reference,
                telefono: phone,
                nombre: name,
                monto_total: totalAmount,
                puntos: pointsToAward,
                origen: 'mercado_pago',
                created_at: new Date().toISOString()
            })
        });

        await supabaseRequest('club_compras?on_conflict=referencia', {
            method: 'POST',
            body: JSON.stringify({
                referencia: reference,
                telefono: phone,
                nombre: name,
                monto_total: totalAmount,
                canal: 'mercado_pago',
                estado: 'aprobada',
                created_at: new Date().toISOString()
            })
        });

        json(res, 200, {
            awarded: true,
            duplicate: false,
            points: pointsToAward,
            amount: totalAmount,
            message: pointsToAward > 0
                ? `Se acreditaron ${pointsToAward} punto${pointsToAward === 1 ? '' : 's'}.`
                : 'Compra registrada sin puntos por monto mínimo.'
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'POINTS_AWARD_ERROR',
            message: 'No pudimos acreditar los puntos de esta compra.',
            detail: error.detail || null
        });
    }
};
