const {
    CLUB_ENV_ERROR,
    createPinHash,
    createSessionToken,
    fetchCustomerByPhone,
    getClubEnv,
    json,
    normalizePhone,
    supabaseRequest,
    verifyPin
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
            error: CLUB_ENV_ERROR,
            message: 'Configura las variables del club para activar el acceso.'
        });
        return;
    }

    try {
        const body = await readJsonBody(req);
        const phone = normalizePhone(body.phone || '');
        const pin = String(body.pin || '').trim();
        const name = String(body.name || '').trim();

        if (!phone || phone.length < 8) {
            json(res, 400, { error: 'Invalid phone', message: 'Ingresa un WhatsApp valido.' });
            return;
        }

        if (!/^\d{4}$/.test(pin)) {
            json(res, 400, { error: 'Invalid pin', message: 'El PIN debe tener 4 digitos.' });
            return;
        }

        const customer = await fetchCustomerByPhone(phone);

        if (!customer) {
            if (!name) {
                json(res, 400, { error: 'Missing name', message: 'Ingresa tu nombre para crear tu acceso.' });
                return;
            }

            await supabaseRequest('clientes', {
                method: 'POST',
                body: JSON.stringify({
                    nombre: name,
                    telefono: phone,
                    pin: createPinHash(pin)
                })
            });

            json(res, 200, {
                ok: true,
                created: true,
                name,
                phone,
                token: createSessionToken(phone)
            });
            return;
        }

        if (!customer.pin) {
            await supabaseRequest(`clientes?telefono=eq.${encodeURIComponent(phone)}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    pin: createPinHash(pin),
                    nombre: name || customer.nombre
                })
            });

            json(res, 200, {
                ok: true,
                created: false,
                activated: true,
                name: name || customer.nombre,
                phone,
                token: createSessionToken(phone)
            });
            return;
        }

        if (!verifyPin(pin, customer.pin)) {
            json(res, 401, { error: 'Invalid credentials', message: 'PIN incorrecto.' });
            return;
        }

        json(res, 200, {
            ok: true,
            created: false,
            activated: false,
            name: customer.nombre,
            phone,
            token: createSessionToken(phone)
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'CLUB_AUTH_ERROR',
            message: 'No pudimos iniciar tu sesion.',
            detail: error.detail || null
        });
    }
};
