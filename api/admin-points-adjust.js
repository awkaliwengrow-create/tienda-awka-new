const { json, normalizePhone, supabaseRequest } = require('./_lib/club');
const { requireAdmin } = require('./_lib/admin');

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

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    if (!requireAdmin(req, res)) {
        return;
    }

    try {
        const body = await readJsonBody(req);
        const phone = normalizePhone(body.phone || '');
        const amount = Number(body.amount) || 0;
        const points = Number(body.points) || Math.floor(amount / 5000);
        const name = String(body.name || '').trim() || 'Cliente Awka';

        if (!phone || phone.length < 8 || !amount || points <= 0) {
            json(res, 400, {
                error: 'Invalid payload',
                message: 'Ingresa un WhatsApp valido y un monto que sume al menos 1 punto.'
            });
            return;
        }

        const existingRows = await supabaseRequest(
            `puntos?select=id,puntos,puntos_canjeados,nombre&telefono=eq.${encodeURIComponent(phone)}&limit=1`
        );

        const current = existingRows?.[0] || null;
        const nextPoints = Math.max(0, (current?.puntos || 0) + points);

        await supabaseRequest('puntos?on_conflict=telefono', {
            method: 'POST',
            headers: {
                Prefer: 'return=representation,resolution=merge-duplicates'
            },
            body: JSON.stringify({
                telefono: phone,
                nombre: current?.nombre || name,
                puntos: nextPoints,
                puntos_canjeados: current?.puntos_canjeados || 0,
                ultima_actividad: new Date().toISOString()
            })
        });

        json(res, 200, {
            ok: true,
            message: `Compra acreditada: ${points} punto${points === 1 ? '' : 's'} por ${Number(amount).toLocaleString('es-AR')} pesos. Nuevo saldo: ${nextPoints}.`,
            points: nextPoints
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'ADMIN_POINTS_ADJUST_ERROR',
            message: 'No pudimos ajustar los puntos.',
            detail: error.detail || null
        });
    }
};
