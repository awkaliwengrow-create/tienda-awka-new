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
        const status = String(body.status || 'entregado').trim().toLowerCase();
        const note = String(body.note || '').trim();

        if (!['entregado', 'cancelado'].includes(status)) {
            json(res, 400, {
                error: 'Invalid status',
                message: 'El estado solicitado no es valido.'
            });
            return;
        }

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
                    estado: status,
                    delivery_note: note || null,
                    delivered_at: status === 'entregado' ? new Date().toISOString() : null
                })
            });

            json(res, 200, {
                ok: true,
                message: status === 'entregado'
                    ? 'Premio marcado como entregado.'
                    : 'Premio marcado como cancelado.'
            });
            return;
        }

        const redemptionRows = await supabaseRequest(
            `club_reward_redemptions?select=id,telefono,nombre,points_cost,estado&id=eq.${redemptionId}&limit=1`
        );
        const redemption = redemptionRows?.[0] || null;

        if (!redemption) {
            json(res, 404, {
                error: 'Redemption not found',
                message: 'No encontramos ese canje.'
            });
            return;
        }

        if (redemption.estado === 'cancelado' && status === 'entregado') {
            json(res, 400, {
                error: 'Invalid transition',
                message: 'Un canje cancelado no puede marcarse como entregado.'
            });
            return;
        }

        if (status === 'cancelado' && redemption.estado !== 'cancelado') {
            const phone = encodeURIComponent(String(redemption.telefono || ''));
            const pointRows = await supabaseRequest(
                `puntos?select=id,puntos,puntos_canjeados,telefono,nombre&telefono=eq.${phone}&limit=1`
            );
            const pointsRow = pointRows?.[0] || null;

            if (pointsRow) {
                const currentPoints = Number(pointsRow.puntos || 0);
                const redeemedPoints = Number(pointsRow.puntos_canjeados || 0);
                const pointsCost = Number(redemption.points_cost || 0);

                await supabaseRequest('puntos?on_conflict=telefono', {
                    method: 'POST',
                    body: JSON.stringify({
                        telefono: redemption.telefono,
                        nombre: pointsRow.nombre || redemption.nombre || 'Cliente Awka',
                        puntos: currentPoints + pointsCost,
                        puntos_canjeados: Math.max(0, redeemedPoints - pointsCost),
                        ultima_actividad: new Date().toISOString()
                    })
                });
            }
        }

        await supabaseRequest(`club_reward_redemptions?id=eq.${redemptionId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                estado: status,
                delivery_note: note || null,
                delivered_at: status === 'entregado' ? new Date().toISOString() : null
            })
        });

        json(res, 200, {
            ok: true,
            refunded: status === 'cancelado',
            message: status === 'entregado'
                ? 'Canje marcado como entregado.'
                : 'Canje cancelado y puntos devueltos.'
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'ADMIN_REWARD_DELIVER_ERROR',
            message: 'No pudimos actualizar el premio o canje.',
            detail: error.detail || null
        });
    }
};
