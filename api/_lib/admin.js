const crypto = require('crypto');
const { CLUB_ENV_ERROR, getClubEnv, getBearerToken, json } = require('./club');

const ADMIN_ENV_ERROR = 'AWKA_ADMIN_NOT_CONFIGURED';
const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

function getAdminEnv() {
    const clubEnv = getClubEnv();
    const password = process.env.AWKA_ADMIN_PASSWORD;
    const secret = process.env.AWKA_ADMIN_SESSION_SECRET;

    if (!clubEnv || !password || !secret) {
        return null;
    }

    return {
        password,
        secret
    };
}

function createAdminToken() {
    const env = getAdminEnv();
    if (!env) {
        const error = new Error(ADMIN_ENV_ERROR);
        error.code = ADMIN_ENV_ERROR;
        throw error;
    }

    const payload = {
        role: 'admin',
        exp: Date.now() + ADMIN_SESSION_DURATION_MS
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', env.secret)
        .update(encodedPayload)
        .digest('base64url');

    return `${encodedPayload}.${signature}`;
}

function verifyAdminToken(token = '') {
    const env = getAdminEnv();
    if (!env || !token || !token.includes('.')) {
        return null;
    }

    const [encodedPayload, signature] = token.split('.');
    const expected = crypto
        .createHmac('sha256', env.secret)
        .update(encodedPayload)
        .digest('base64url');

    if (signature !== expected) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
        if (payload.role !== 'admin' || !payload.exp || payload.exp < Date.now()) {
            return null;
        }

        return payload;
    } catch (error) {
        return null;
    }
}

function requireAdmin(req, res) {
    if (!getClubEnv()) {
        json(res, 503, {
            error: CLUB_ENV_ERROR,
            message: 'Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para activar el admin.'
        });
        return null;
    }

    if (!getAdminEnv()) {
        json(res, 503, {
            error: ADMIN_ENV_ERROR,
            message: 'Configura AWKA_ADMIN_PASSWORD para activar el panel admin.'
        });
        return null;
    }

    const session = verifyAdminToken(getBearerToken(req));
    if (!session) {
        json(res, 401, {
            error: 'Unauthorized',
            message: 'Necesitas iniciar sesion como admin.'
        });
        return null;
    }

    return session;
}

module.exports = {
    ADMIN_ENV_ERROR,
    createAdminToken,
    getAdminEnv,
    requireAdmin,
    verifyAdminToken
};
