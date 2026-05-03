const { json, normalizePhone, supabaseRequest } = require('./_lib/club');
const { requireAdmin } = require('./_lib/admin');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    if (!requireAdmin(req, res)) {
        return;
    }

    try {
        const [pendingSpins, usedSpins, pointsRows, levelHistoryRows] = await Promise.all([
            supabaseRequest('giros_habilitados?select=id,nombre,telefono,created_at&estado=eq.pendiente&order=created_at.desc&limit=40'),
            supabaseRequest('giros_habilitados?select=id,nombre,telefono,used_at,created_at&estado=eq.usado&order=used_at.desc.nullslast,created_at.desc&limit=20'),
            supabaseRequest('puntos?select=id,nombre,telefono,puntos,puntos_canjeados,ultima_actividad&order=puntos.desc&limit=30'),
            supabaseRequest('club_niveles_historial?select=id,telefono,nivel_anterior,nivel_nuevo,motivo,created_at&order=created_at.desc&limit=20').catch(() => [])
        ]);

        let rewardRows = [];
        try {
            rewardRows = await supabaseRequest('club_premios_estado?select=id,ruleta_registro_id,nombre,telefono,premio,premio_codigo,premio_tipo,product_id,discount_percent,estado,delivery_note,delivered_at,created_at&order=created_at.desc&limit=40');
        } catch (rewardError) {
            rewardRows = [];
        }

        const rewardPhones = [...new Set((rewardRows || []).map((row) => normalizePhone(row.telefono)).filter(Boolean))];
        const phoneFilter = rewardPhones.length
            ? rewardPhones.map((phone) => `telefono.eq.${encodeURIComponent(phone)}`).join(',')
            : '';
        const spinHistory = phoneFilter
            ? await supabaseRequest(`ruleta_registros?select=id,telefono,premio,ganador,created_at&or=(${phoneFilter})&order=created_at.desc&limit=100`)
            : [];

        const rewards = (rewardRows || []).map((reward) => {
            const relatedSpin = (spinHistory || []).find((spin) => spin.id === reward.ruleta_registro_id)
                || (spinHistory || []).find((spin) => normalizePhone(spin.telefono) === normalizePhone(reward.telefono) && spin.premio === reward.premio);

            return {
                id: reward.id,
                spinRecordId: reward.ruleta_registro_id,
                name: reward.nombre,
                phone: reward.telefono,
                prize: reward.premio,
                prizeCode: reward.premio_codigo,
                prizeType: reward.premio_tipo,
                productId: reward.product_id,
                discountPercent: reward.discount_percent,
                status: reward.estado,
                deliveryNote: reward.delivery_note || '',
                deliveredAt: reward.delivered_at || null,
                createdAt: reward.created_at || relatedSpin?.created_at || null
            };
        });

        json(res, 200, {
            stats: {
                pendingSpins: pendingSpins?.length || 0,
                usedSpins: usedSpins?.length || 0,
                activePoints: (pointsRows || []).reduce((sum, row) => sum + (row.puntos || 0), 0),
                pendingRewards: rewards.filter((reward) => reward.status === 'pendiente').length
            },
            pendingSpins: pendingSpins || [],
            usedSpins: usedSpins || [],
            topPoints: (pointsRows || []).map((row) => ({
                id: row.id,
                name: row.nombre,
                phone: row.telefono,
                points: row.puntos || 0,
                redeemed: row.puntos_canjeados || 0,
                lastActivity: row.ultima_actividad || null
            })),
            levelHistory: (levelHistoryRows || []).map((row) => ({
                id: row.id,
                phone: row.telefono,
                from: row.nivel_anterior,
                to: row.nivel_nuevo,
                reason: row.motivo || '',
                createdAt: row.created_at || null
            })),
            rewards
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'ADMIN_DASHBOARD_ERROR',
            message: 'No pudimos cargar el panel admin.',
            detail: error.detail || null
        });
    }
};
