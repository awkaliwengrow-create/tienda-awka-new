const crypto = require('crypto');
const {
    fetchCustomerByPhone,
    getBearerToken,
    getRewardCatalog,
    getClubEnv,
    json,
    normalizePhone,
    savePointsLedger,
    supabaseRequest,
    verifySessionToken
} = require('./_lib/club');

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

    if (!getClubEnv()) {
        json(res, 503, {
            error: 'AWKA_CLUB_NOT_CONFIGURED',
            message: 'Club Awka no esta configurado.'
        });
        return;
    }

    try {
        const session = verifySessionToken(getBearerToken(req));
        if (!session?.phone) {
            json(res, 401, {
                error: 'Unauthorized',
                message: 'Necesitas iniciar sesion para canjear puntos.'
            });
            return;
        }

        const body = await readJsonBody(req);
        const rewardKey = String(body.rewardKey || '').trim();
        const reward = getRewardCatalog().find((item) => item.key === rewardKey);

        if (!reward) {
            json(res, 400, {
                error: 'INVALID_REWARD',
                message: 'Ese premio no esta disponible para canje.'
            });
            return;
        }

        const phone = normalizePhone(session.phone);
        const customer = await fetchCustomerByPhone(phone);
        const pointsRows = await supabaseRequest(
            `puntos?select=id,puntos,puntos_canjeados,ultima_actividad,nombre&telefono=eq.${encodeURIComponent(phone)}&limit=1`
        );
        const pointsRow = pointsRows?.[0] || null;
        const currentPoints = Number(pointsRow?.puntos || 0);
        const redeemedPoints = Number(pointsRow?.puntos_canjeados || 0);
        const name = customer?.nombre || pointsRow?.nombre || 'Cliente Awka';

        if (currentPoints < reward.pointsCost) {
            json(res, 400, {
                error: 'INSUFFICIENT_POINTS',
                message: `Te faltan ${reward.pointsCost - currentPoints} punto${reward.pointsCost - currentPoints === 1 ? '' : 's'} para este canje.`
            });
            return;
        }

        const redemptionReference = `reward:${phone}:${reward.key}:${crypto.randomUUID()}`;

        await savePointsLedger({
            phone,
            name,
            points: currentPoints - reward.pointsCost,
            redeemedPoints: redeemedPoints + reward.pointsCost,
            lastActivity: new Date().toISOString()
        });

        const rows = await supabaseRequest('club_reward_redemptions', {
            method: 'POST',
            headers: {
                Prefer: 'return=representation'
            },
            body: JSON.stringify({
                referencia: redemptionReference,
                telefono: phone,
                nombre: name,
                product_id: reward.productId,
                reward_key: reward.key,
                product_name: reward.productName,
                size_label: reward.sizeLabel,
                points_cost: reward.pointsCost,
                estado: 'pendiente',
                request_note: body.note ? String(body.note).trim() : null,
                delivery_note: null,
                created_at: new Date().toISOString()
            })
        });

        json(res, 200, {
            ok: true,
            redemptionId: rows?.[0]?.id || null,
            remainingPoints: currentPoints - reward.pointsCost,
            message: `Canje solicitado por ${reward.productName}.`
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'CLUB_REWARD_REDEEM_ERROR',
            message: 'No pudimos registrar el canje en este momento.',
            detail: error.detail || null
        });
    }
};
