const { calculateLevel, getCampaignCatalog, json, normalizePhone, supabaseRequest } = require('./_lib/club');
const { requireAdmin } = require('./_lib/admin');

function diffDaysFromNow(value) {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return Math.max(0, Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)));
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    if (!requireAdmin(req, res)) {
        return;
    }

    try {
        const [pendingSpins, usedSpins, pointsRows, levelHistoryRows, purchaseRows, customerRows, campaignActivationRows, rewardRedemptionRows] = await Promise.all([
            supabaseRequest('giros_habilitados?select=id,nombre,telefono,created_at&estado=eq.pendiente&order=created_at.desc&limit=40'),
            supabaseRequest('giros_habilitados?select=id,nombre,telefono,used_at,created_at&estado=eq.usado&order=used_at.desc.nullslast,created_at.desc&limit=20'),
            supabaseRequest('puntos?select=id,nombre,telefono,puntos,puntos_canjeados,ultima_actividad&order=puntos.desc&limit=30'),
            supabaseRequest('club_niveles_historial?select=id,telefono,nivel_anterior,nivel_nuevo,motivo,created_at&order=created_at.desc&limit=20').catch(() => []),
            supabaseRequest('club_compras?select=telefono,estado,monto_total,created_at&estado=eq.aprobada').catch(() => []),
            supabaseRequest('clientes?select=nombre,telefono').catch(() => []),
            supabaseRequest('club_campaign_activations?select=id,telefono,nombre,campaign_id,trigger_type,reference,note,created_at&order=created_at.desc&limit=20').catch(() => []),
            supabaseRequest('club_reward_redemptions?select=id,telefono,nombre,product_name,size_label,points_cost,estado,request_note,delivery_note,created_at,delivered_at&order=created_at.desc&limit=40').catch(() => [])
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
        const redemptions = (rewardRedemptionRows || []).map((item) => ({
            id: item.id,
            name: item.nombre,
            phone: item.telefono,
            productName: item.product_name,
            sizeLabel: item.size_label,
            pointsCost: item.points_cost,
            status: item.estado,
            requestNote: item.request_note || '',
            deliveryNote: item.delivery_note || '',
            createdAt: item.created_at || null,
            deliveredAt: item.delivered_at || null
        }));

        const purchaseCountByPhone = new Map();
        (purchaseRows || []).forEach((row) => {
            const phone = normalizePhone(row.telefono);
            if (!phone) return;
            purchaseCountByPhone.set(phone, (purchaseCountByPhone.get(phone) || 0) + 1);
        });

        const knownPhones = new Set([
            ...(customerRows || []).map((row) => normalizePhone(row.telefono)),
            ...purchaseCountByPhone.keys()
        ]);

        const segments = {
            nuevo: 0,
            recurrente: 0,
            fiel: 0
        };
        const campaignEligibleCounts = {
            'nuevo-bienvenida-play': 0,
            'nuevo-segunda-compra': 0,
            'nuevo-cierre-recurrente': 0,
            'nuevo-reactivacion-suave': 0,
            'recurrente-ventana-play': 0,
            'recurrente-impulso-fiel': 0,
            'recurrente-cierre-fiel': 0,
            'recurrente-reactivacion-suave': 0,
            'fiel-mesa-exclusiva': 0,
            'fiel-spin-cadencia': 0,
            'fiel-prioridad-premium': 0,
            'fiel-compra-premium': 0,
            'fiel-mantenimiento-premium': 0,
            'fiel-reactivacion-suave': 0
        };
        const lastPurchaseByPhone = new Map();

        (purchaseRows || []).forEach((row) => {
            const phone = normalizePhone(row.telefono);
            if (!phone) return;
            const createdAt = row.created_at || null;
            const existing = lastPurchaseByPhone.get(phone);
            if (!existing || new Date(createdAt) > new Date(existing)) {
                lastPurchaseByPhone.set(phone, createdAt);
            }
        });

        knownPhones.forEach((phone) => {
            const purchaseCount = purchaseCountByPhone.get(phone) || 0;
            const level = calculateLevel(purchaseCount);
            const lastPurchaseAt = lastPurchaseByPhone.get(phone) || null;
            const daysSincePurchase = diffDaysFromNow(lastPurchaseAt);
            segments[level.key] += 1;

            if (level.key === 'nuevo') {
                campaignEligibleCounts['nuevo-bienvenida-play'] += 1;
                if (purchaseCount === 1) {
                    campaignEligibleCounts['nuevo-segunda-compra'] += 1;
                    campaignEligibleCounts['nuevo-cierre-recurrente'] += 1;
                }
                if (daysSincePurchase !== null && daysSincePurchase >= 30) {
                    campaignEligibleCounts['nuevo-reactivacion-suave'] += 1;
                }
            }

            if (level.key === 'recurrente') {
                campaignEligibleCounts['recurrente-ventana-play'] += 1;
                if (purchaseCount === 3) {
                    campaignEligibleCounts['recurrente-impulso-fiel'] += 1;
                }
                if (purchaseCount === 4) {
                    campaignEligibleCounts['recurrente-cierre-fiel'] += 1;
                }
                if (daysSincePurchase !== null && daysSincePurchase >= 30) {
                    campaignEligibleCounts['recurrente-reactivacion-suave'] += 1;
                }
            }

            if (level.key === 'fiel') {
                campaignEligibleCounts['fiel-mesa-exclusiva'] += 1;
                campaignEligibleCounts['fiel-spin-cadencia'] += 1;
                if (purchaseCount === 5) {
                    campaignEligibleCounts['fiel-prioridad-premium'] += 1;
                }
                campaignEligibleCounts['fiel-compra-premium'] += 1;
                if (purchaseCount >= 6) {
                    campaignEligibleCounts['fiel-mantenimiento-premium'] += 1;
                }
                if (daysSincePurchase !== null && daysSincePurchase >= 30) {
                    campaignEligibleCounts['fiel-reactivacion-suave'] += 1;
                }
            }
        });

        const campaigns = getCampaignCatalog().map((campaign) => ({
            id: campaign.id,
            title: campaign.title,
            audience: campaign.audience,
            benefit: campaign.benefit,
            description: campaign.description,
            cta: campaign.cta,
            automation: campaign.automation,
            eligibilityCount: campaignEligibleCounts[campaign.id] || 0,
            priority: campaign.id.includes('reactivacion')
                ? 'reactivacion'
                : campaign.id.includes('fiel')
                    ? 'alto_valor'
                    : 'conversion',
            targetCount: campaign.audience === 'Nuevo'
                ? segments.nuevo
                : campaign.audience === 'Recurrente'
                    ? segments.recurrente
                    : segments.fiel
        }));

        const totalCustomers = knownPhones.size;
        const purchasingCustomers = [...purchaseCountByPhone.keys()].length;
        const totalRevenue = (purchaseRows || []).reduce((sum, row) => sum + (Number(row.monto_total) || 0), 0);
        const averageTicket = purchaseRows?.length ? totalRevenue / purchaseRows.length : 0;
        const repeatCustomers = [...purchaseCountByPhone.values()].filter((count) => count >= 2).length;
        const spinUsageRate = (pendingSpins?.length || 0) + (usedSpins?.length || 0) > 0
            ? ((usedSpins?.length || 0) / ((pendingSpins?.length || 0) + (usedSpins?.length || 0))) * 100
            : 0;
        const rewardDeliveryRate = rewards.length
            ? (rewards.filter((reward) => reward.status === 'entregado').length / rewards.length) * 100
            : 0;

        const topCampaignEntry = Object.entries(
            (campaignActivationRows || []).reduce((acc, row) => {
                acc[row.campaign_id] = (acc[row.campaign_id] || 0) + 1;
                return acc;
            }, {})
        ).sort((a, b) => b[1] - a[1])[0];

        const topPrizeEntry = Object.entries(
            rewards.reduce((acc, reward) => {
                acc[reward.prize] = (acc[reward.prize] || 0) + 1;
                return acc;
            }, {})
        ).sort((a, b) => b[1] - a[1])[0];

        json(res, 200, {
            stats: {
                pendingSpins: pendingSpins?.length || 0,
                usedSpins: usedSpins?.length || 0,
                activePoints: (pointsRows || []).reduce((sum, row) => sum + (row.puntos || 0), 0),
                pendingRewards: rewards.filter((reward) => reward.status === 'pendiente').length
            },
            metrics: {
                totalCustomers,
                purchasingCustomers,
                repeatCustomers,
                totalPurchases: purchaseRows?.length || 0,
                totalRevenue,
                averageTicket,
                spinUsageRate,
                rewardDeliveryRate,
                topCampaign: topCampaignEntry
                    ? {
                        id: topCampaignEntry[0],
                        activations: topCampaignEntry[1]
                    }
                    : null,
                topPrize: topPrizeEntry
                    ? {
                        prize: topPrizeEntry[0],
                        count: topPrizeEntry[1]
                    }
                    : null
            },
            segments,
            campaigns,
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
            campaignActivations: (campaignActivationRows || []).map((row) => ({
                id: row.id,
                phone: row.telefono,
                name: row.nombre,
                campaignId: row.campaign_id,
                triggerType: row.trigger_type,
                reference: row.reference || '',
                note: row.note || '',
                createdAt: row.created_at || null
            })),
            rewards,
            rewardRedemptions: redemptions
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'ADMIN_DASHBOARD_ERROR',
            message: 'No pudimos cargar el panel admin.',
            detail: error.detail || null
        });
    }
};
