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
    {
        code: 'miss',
        label: 'Segui participando',
        type: 'miss',
        winner: false,
        weight: 34,
        description: 'La proxima puede ser tuya. Vuelve con tu siguiente compra.'
    },
    {
        code: 'discount-5',
        label: '5% OFF',
        type: 'discount',
        winner: true,
        weight: 18,
        description: 'Descuento para tu proxima compra segun condiciones del local.',
        discountPercent: 5
    },
    {
        code: 'discount-10',
        label: '10% OFF',
        type: 'discount',
        winner: true,
        weight: 8,
        description: 'Un descuento mas fuerte para premiar tu avance.',
        discountPercent: 10
    },
    {
        code: 'product-raw-classic',
        label: 'Raw Classic',
        type: 'product',
        winner: true,
        weight: 14,
        description: 'Un papel real del catalogo para retirar o coordinar con el equipo.',
        productId: 2124,
        productCategory: 'papeles'
    },
    {
        code: 'product-tips-silver',
        label: 'Tips Silver',
        type: 'product',
        winner: true,
        weight: 10,
        description: 'Un premio real del catalogo para sumar al ecosistema Awka.',
        productId: 4156,
        productCategory: 'filtros'
    },
    {
        code: 'product-fumanchu',
        label: 'Fumanchu Blanco',
        type: 'product',
        winner: true,
        weight: 9,
        description: 'Premio real del catalogo listo para canjear.',
        productId: 3151,
        productCategory: 'papeles'
    },
    {
        code: 'product-zeus-pink',
        label: 'Zeus Pink',
        type: 'product',
        winner: true,
        weight: 4,
        description: 'Premio real del catalogo para clientes del club.',
        productId: 143,
        productCategory: 'papeles'
    },
    {
        code: 'discount-20',
        label: '20% OFF',
        type: 'discount',
        winner: true,
        weight: 3,
        description: 'Premio mayor de esta primera version de la ruleta.',
        discountPercent: 20
    }
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

    let committedResult = null;

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

        committedResult = {
            ok: true,
            prize: prize.label,
            prizeMeta: {
                code: prize.code,
                type: prize.type,
                label: prize.label,
                description: prize.description,
                discountPercent: prize.discountPercent || null,
                productId: prize.productId || null,
                productCategory: prize.productCategory || null
            },
            winner: prize.winner,
            usedSpinId: pendingSpin.id,
            remainingSpins: 0,
            playedAt: now
        };

        try {
            const remainingRows = await supabaseRequest(
                `giros_habilitados?select=id&telefono=eq.${encodeURIComponent(session.phone)}&estado=eq.pendiente`
            );
            committedResult.remainingSpins = remainingRows?.length || 0;
        } catch (remainingError) {
            committedResult.warning = 'REMAINING_SPINS_REFRESH_FAILED';
        }

        json(res, 200, committedResult);
    } catch (error) {
        if (committedResult) {
            json(res, 200, {
                ...committedResult,
                warning: error.code || 'CLUB_SPIN_PARTIAL_SUCCESS'
            });
            return;
        }

        json(res, 500, {
            error: error.code || 'CLUB_SPIN_ERROR',
            message: 'No pudimos completar el giro.',
            detail: error.detail || null
        });
    }
};
