const {
    CLUB_ENV_ERROR,
    fetchClubProfile,
    getClubEnv,
    json,
    normalizePhone
} = require('./_lib/club');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    const phone = normalizePhone(req.query?.phone || '');

    if (!phone || phone.length < 8) {
        json(res, 400, {
            error: 'Invalid phone',
            message: 'Ingresá un WhatsApp válido para consultar el perfil.'
        });
        return;
    }

    if (!getClubEnv()) {
        json(res, 503, {
            error: CLUB_ENV_ERROR,
            message: 'Configurá SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para activar Club Awka.'
        });
        return;
    }

    try {
        const profile = await fetchClubProfile(phone);
        json(res, 200, profile);
    } catch (error) {
        if (error.code === 'INVALID_PHONE') {
            json(res, 400, {
                error: 'Invalid phone',
                message: 'Ingresá un WhatsApp válido para consultar el perfil.'
            });
            return;
        }

        json(res, 500, {
            error: error.code || 'CLUB_PROFILE_ERROR',
            message: 'No pudimos cargar el perfil del club.',
            detail: error.detail || null
        });
    }
};
