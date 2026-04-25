const {
    CLUB_ENV_ERROR,
    fetchCustomerByPhone,
    getBearerToken,
    getClubEnv,
    json,
    supabaseRequest,
    verifySessionToken
} = require('./_lib/club');

const PRIZES = [
    { label: 'Segui participando', winner: false, weight: 34 },
    { label: 'Sticker Gratis', winner: true, weight: 22 },
    { label: '5% OFF', winner: true, weight: 18 },
    { label: 'Semilla Gratis', winner: true, weight: 10 },
    { label: '10% OFF', winner: true, weight: 8 },
    { label: 'Humus Gratis', winner: true, weight: 5 },
    { label: '20% OFF', winner: true, weight: 3 }
];

function pickPrize() {
    const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
    let cursor = Math.random() * totalWeight;

    for (const prize of PRIZES) {
        cursor -= prize.weight;
        if (cursor <= 0) {
            return prize;
        }
    }

    return PRIZES[0];
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    if (!getClubEnv()) {
        json(res, 503, {
            error: CLUB_ENV_ERROR,
            message: 'Configura las variables del club para activar la ruleta.'
        });
        return;
    }

    try {
        const session = verifySessionToken(getBearerToken(req));
        if (!session?.phone) {
            json(res, 401, {
                error: 'Unauthorized',
                message: 'Necesitas iniciar sesion para girar la ruleta.'
            });
            return;
        }

        const customer = await fetchCustomerByPhone(session.phone);
        if (!customer) {
            json(res, 404, {
                error: 'CLUB_CUSTOMER_NOT_FOUND',
                message: 'No encontramos la cuenta del club para este acceso.'
            });
            return;
        }

        const pendingRows = await supabaseRequest(
            `giros_habilitados?select=id,estado&telefono=eq.${encodeURIComponent(session.phone)}&estado=eq.pendiente&order=created_at.asc&limit=1`
        );

        const pendingSpin = pendingRows?.[0];
        if (!pendingSpin) {
            json(res, 409, {
                error: 'NO_PENDING_SPINS',
                message: 'No tienes giros pendientes en este momento.'
            });
            return;
        }

        const now = new Date().toISOString();
        const prize = pickPrize();

        await supabaseRequest(
            `giros_habilitados?id=eq.${pendingSpin.id}&estado=eq.pendiente`,
            {
                method: 'PATCH',
                headers: {
                    Prefer: 'return=representation'
                },
                body: JSON.stringify({
                    estado: 'usado',
                    used_at: now
                })
            }
        );

        await supabaseRequest('ruleta_registros', {
            method: 'POST',
            body: JSON.stringify({
                nombre: customer.nombre,
                telefono: session.phone,
                premio: prize.label,
                ganador: prize.winner,
                fecha: now,
                created_at: now
            })
        });

        const remainingRows = await supabaseRequest(
            `giros_habilitados?select=id&telefono=eq.${encodeURIComponent(session.phone)}&estado=eq.pendiente`
        );

        json(res, 200, {
            ok: true,
            prize: prize.label,
            winner: prize.winner,
            usedSpinId: pendingSpin.id,
            remainingSpins: remainingRows?.length || 0,
            playedAt: now
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'CLUB_SPIN_ERROR',
            message: 'No pudimos completar el giro.',
            detail: error.detail || null
        });
    }
};
