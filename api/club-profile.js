const {
    CLUB_ENV_ERROR,
    fetchClubProfile,
    getBearerToken,
    getClubEnv,
    json,
    verifySessionToken
} = require('./_lib/club');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        json(res, 405, { error: 'Method not allowed' });
        return;
    }

    if (!getClubEnv()) {
        json(res, 503, {
            error: CLUB_ENV_ERROR,
            message: 'Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para activar Club Awka.'
        });
        return;
    }

    try {
        const session = verifySessionToken(getBearerToken(req));
        if (!session?.phone) {
            json(res, 401, {
                error: 'Unauthorized',
                message: 'Necesitas iniciar sesion para ver tu perfil.'
            });
            return;
        }

        const profile = await fetchClubProfile(session.phone);
        json(res, 200, profile);
    } catch (error) {
        json(res, 500, {
            error: error.code || 'CLUB_PROFILE_ERROR',
            message: 'No pudimos cargar el perfil del club.',
            detail: error.detail || null
        });
    }
};
