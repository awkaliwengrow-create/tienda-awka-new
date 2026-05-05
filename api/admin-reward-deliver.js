const { json, supabaseRequest } = require('./_lib/club');
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
        const rewardId = Number(body.rewardId) || 0;
        const redemptionId = Number(body.redemptionId) || 0;
        const note = String(body.note || '').trim();

        if (!rewardId && !redemptionId) {
            json(res, 400, {
                error: 'Invalid payload',
                message: 'Falta el premio o canje a actualizar.'
            });
            return;
        }

        if (rewardId) {
            await supabaseRequest(`club_premios_estado?id=eq.${rewardId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    estado: 'entregado',
                    delivery_note: note || null,
                    delivered_at: new Date().toISOString()
                })
            });

            json(res, 200, {
                ok: true,
                message: 'Premio marcado como entregado.'
            });
            return;
        }

        await supabaseRequest(`club_reward_redemptions?id=eq.${redemptionId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                estado: 'entregado',
                delivery_note: note || null,
                delivered_at: new Date().toISOString()
            })
        });

        json(res, 200, {
            ok: true,
            message: 'Canje marcado como entregado.'
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'ADMIN_REWARD_DELIVER_ERROR',
            message: 'No pudimos actualizar el premio o canje.',
            detail: error.detail || null
        });
    }
};
