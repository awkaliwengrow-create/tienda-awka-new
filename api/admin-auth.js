const { json } = require('./_lib/club');
const { ADMIN_ENV_ERROR, createAdminToken, getAdminEnv } = require('./_lib/admin');

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

    const env = getAdminEnv();
    if (!env) {
        json(res, 503, {
            error: ADMIN_ENV_ERROR,
            message: 'Configura AWKA_ADMIN_PASSWORD para activar el panel admin.'
        });
        return;
    }

    try {
        const body = await readJsonBody(req);
        const password = String(body.password || '').trim();

        if (!password || password !== env.password) {
            json(res, 401, {
                error: 'Invalid credentials',
                message: 'Contrasena incorrecta.'
            });
            return;
        }

        json(res, 200, {
            ok: true,
            token: createAdminToken()
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'ADMIN_AUTH_ERROR',
            message: 'No pudimos iniciar sesion en el admin.'
        });
    }
};
