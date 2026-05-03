const { calculateLevel, getClubEnv, json, normalizePhone } = require('./_lib/club');

const POINTS_PER_AMOUNT = Number(process.env.AWKA_POINTS_PER_AMOUNT) || 5000;
const REACTIVATION_SPIN_AFTER_DAYS = Number(process.env.AWKA_REACTIVATION_SPIN_AFTER_DAYS) || 45;
const FIEL_PREMIUM_PURCHASE_AMOUNT = Number(process.env.AWKA_FIEL_PREMIUM_PURCHASE_AMOUNT) || 20000;
const LEVEL_BONUS_SPINS = {
    recurrente: 1,
    fiel: 2
};
const FIEL_RECURRING_SPIN_EVERY = 3;
const CAMPAIGN_AUTOMATIONS = {
    nuevoWelcomeSpin: 'nuevo-bienvenida-play',
    nuevoFirstPurchase: 'nuevo-segunda-compra',
    recurrenteUnlock: 'recurrente-ventana-play',
    recurrenteBoost: 'recurrente-impulso-fiel',
    fielUnlock: 'fiel-mesa-exclusiva',
    fielRecurring: 'fiel-spin-cadencia',
    fielPriority: 'fiel-prioridad-premium',
    reactivationReturn: 'club-reactivacion-regreso',
    fielPremiumPurchase: 'fiel-compra-premium'
};

function diffDaysFromNow(value) {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return Math.max(0, Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)));
}

async function recordCampaignActivation({ phone, name, campaignId, triggerType, reference, note }) {
    try {
        await supabaseRequest('club_campaign_activations?on_conflict=activation_key', {
            method: 'POST',
            body: JSON.stringify({
                activation_key: `${phone}:${campaignId}:${reference}`,
                telefono: phone,
                nombre: name,
                campaign_id: campaignId,
                trigger_type: triggerType,
                reference,
                note,
                created_at: new Date().toISOString()
            })
        });
        return true;
    } catch (error) {
        return false;
    }
}

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
            `puntos?select=id,puntos,puntos_canjeados,ultima_actividad&telefono=eq.${encodeURIComponent(phone)}&limit=1`
        );

        const currentPoints = currentPointsRows?.[0]?.puntos || 0;
        const redeemedPoints = currentPointsRows?.[0]?.puntos_canjeados || 0;
        const previousActivityAt = currentPointsRows?.[0]?.ultima_actividad || null;

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

        const approvedPurchases = await supabaseRequest(
            `club_compras?select=id,created_at&telefono=eq.${encodeURIComponent(phone)}&estado=eq.aprobada&order=created_at.asc`
        );
        const totalPurchases = approvedPurchases?.length || 0;
        const level = calculateLevel(totalPurchases);
        const previousActivityDays = diffDaysFromNow(previousActivityAt);
        const unlockedLevelKey = totalPurchases === 2
            ? 'recurrente'
            : totalPurchases === 5
                ? 'fiel'
                : null;
        const welcomeSpinBonusSpins = totalPurchases === 1 ? 1 : 0;
        const levelUnlockBonusSpins = unlockedLevelKey ? (LEVEL_BONUS_SPINS[unlockedLevelKey] || 0) : 0;
        const recurrenteBoostBonusSpins = totalPurchases === 4 ? 1 : 0;
        const reactivationBonusSpins = totalPurchases > 1 && previousActivityDays !== null && previousActivityDays >= REACTIVATION_SPIN_AFTER_DAYS
            ? 1
            : 0;
        const fielPremiumPurchaseBonusSpins = level.key === 'fiel' && totalAmount >= FIEL_PREMIUM_PURCHASE_AMOUNT
            ? 1
            : 0;
        const fielRecurringBonusSpins = level.key === 'fiel' && totalPurchases > 5 && ((totalPurchases - 5) % FIEL_RECURRING_SPIN_EVERY === 0)
            ? 1
            : 0;
        const fielPriorityUnlocked = totalPurchases === 6;
        const bonusSpins = welcomeSpinBonusSpins
            + levelUnlockBonusSpins
            + recurrenteBoostBonusSpins
            + reactivationBonusSpins
            + fielPremiumPurchaseBonusSpins
            + fielRecurringBonusSpins;

        if (bonusSpins > 0) {
            const unlockTime = new Date().toISOString();

            if (levelUnlockBonusSpins > 0) {
                try {
                    await supabaseRequest('club_niveles_historial?on_conflict=telefono,nivel_nuevo', {
                        method: 'POST',
                        body: JSON.stringify({
                            telefono: phone,
                            nivel_anterior: calculateLevel(Math.max(0, totalPurchases - 1)).label,
                            nivel_nuevo: level.label,
                            motivo: `Desbloqueo automatico al registrar la compra ${reference}`,
                            created_at: unlockTime
                        })
                    });
                } catch (historyError) {
                    // The club can keep awarding the level bonus even if the audit table is not available yet.
                }
            }

            for (let index = 0; index < bonusSpins; index += 1) {
                await supabaseRequest('giros_habilitados', {
                    method: 'POST',
                    body: JSON.stringify({
                        nombre: name,
                        telefono: phone,
                        estado: 'pendiente',
                        created_at: unlockTime
                    })
                });
            }
        }

        const campaignActivations = [];

        if (totalPurchases === 1) {
            campaignActivations.push({
                id: CAMPAIGN_AUTOMATIONS.nuevoWelcomeSpin,
                triggerType: 'bienvenida_nuevo',
                note: `Giro de bienvenida activado con la primera compra ${reference}.`
            });
            campaignActivations.push({
                id: CAMPAIGN_AUTOMATIONS.nuevoFirstPurchase,
                triggerType: 'primera_compra',
                note: `Primera compra aprobada registrada con referencia ${reference}.`
            });
        }

        if (levelUnlockBonusSpins > 0 && unlockedLevelKey === 'recurrente') {
            campaignActivations.push({
                id: CAMPAIGN_AUTOMATIONS.recurrenteUnlock,
                triggerType: 'subida_nivel',
                note: `Subida automatica a Recurrente con la compra ${reference}.`
            });
        }

        if (recurrenteBoostBonusSpins > 0) {
            campaignActivations.push({
                id: CAMPAIGN_AUTOMATIONS.recurrenteBoost,
                triggerType: 'impulso_recurrente',
                note: `Impulso Recurrente activado en la compra ${totalPurchases} con referencia ${reference}.`
            });
        }

        if (levelUnlockBonusSpins > 0 && unlockedLevelKey === 'fiel') {
            campaignActivations.push({
                id: CAMPAIGN_AUTOMATIONS.fielUnlock,
                triggerType: 'subida_nivel',
                note: `Subida automatica a Fiel con la compra ${reference}.`
            });
        }

        if (fielPriorityUnlocked) {
            campaignActivations.push({
                id: CAMPAIGN_AUTOMATIONS.fielPriority,
                triggerType: 'prioridad_fiel',
                note: `Prioridad premium Fiel consolidada en la compra ${totalPurchases} con referencia ${reference}.`
            });
        }

        if (reactivationBonusSpins > 0) {
            campaignActivations.push({
                id: CAMPAIGN_AUTOMATIONS.reactivationReturn,
                triggerType: 'reactivacion_regreso',
                note: `Regreso con reactivacion automatica despues de ${previousActivityDays} dias sin actividad.`
            });
        }

        if (fielPremiumPurchaseBonusSpins > 0) {
            campaignActivations.push({
                id: CAMPAIGN_AUTOMATIONS.fielPremiumPurchase,
                triggerType: 'compra_premium_fiel',
                note: `Compra premium Fiel activada con ${reference} por $${Number(totalAmount).toLocaleString('es-AR')}.`
            });
        }

        if (fielRecurringBonusSpins > 0) {
            campaignActivations.push({
                id: CAMPAIGN_AUTOMATIONS.fielRecurring,
                triggerType: 'cadencia_fiel',
                note: `Cadencia Fiel activada en la compra ${totalPurchases} con referencia ${reference}.`
            });
        }

        const recordedCampaigns = [];
        for (const activation of campaignActivations) {
            const stored = await recordCampaignActivation({
                phone,
                name,
                campaignId: activation.id,
                triggerType: activation.triggerType,
                reference,
                note: activation.note
            });

            if (stored) {
                recordedCampaigns.push(activation.id);
            }
        }

        json(res, 200, {
            awarded: true,
            duplicate: false,
            points: pointsToAward,
            amount: totalAmount,
            level: level.label,
            totalPurchases,
            bonusSpinsAwarded: bonusSpins,
            bonusBreakdown: {
                welcome: welcomeSpinBonusSpins,
                levelUnlock: levelUnlockBonusSpins,
                recurrenteBoost: recurrenteBoostBonusSpins,
                reactivation: reactivationBonusSpins,
                fielPremiumPurchase: fielPremiumPurchaseBonusSpins,
                fielRecurring: fielRecurringBonusSpins
            },
            levelUnlocked: levelUnlockBonusSpins > 0 ? level.label : null,
            recurringFielBonusTriggered: fielRecurringBonusSpins > 0,
            fielPriorityUnlocked,
            campaignActivations: recordedCampaigns,
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
