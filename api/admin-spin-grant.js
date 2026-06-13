const { json, normalizePhone, supabaseRequest } = require('./_lib/club');
const { requireAdmin } = require('./_lib/admin');

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

    if (!requireAdmin(req, res)) {
        return;
    }

    try {
        const body = await readJsonBody(req);
        const phone = normalizePhone(body.phone || '');
        const name = String(body.name || '').trim();
        const count = Math.max(1, Math.min(10, Number(body.count) || 1));

        if (!phone || phone.length < 8 || !name) {
            json(res, 400, {
                error: 'Invalid payload',
                message: 'Ingresa nombre y WhatsApp validos.'
            });
            return;
        }

        await supabaseRequest('clientes?on_conflict=telefono', {
            method: 'POST',
            headers: {
                Prefer: 'return=representation,resolution=merge-duplicates'
            },
            body: JSON.stringify({
                nombre: name,
                telefono: phone
            })
        }).catch(() => null);

        for (let index = 0; index < count; index += 1) {
            await supabaseRequest('giros_habilitados', {
                method: 'POST',
                headers: {
                    Prefer: 'return=representation'
                },
                body: JSON.stringify({
                    nombre: name,
                    telefono: phone,
                    estado: 'pendiente',
                    created_at: new Date().toISOString()
                })
            });
        }

        json(res, 200, {
            ok: true,
            message: `Se habilitaron ${count} giro${count === 1 ? '' : 's'} para ${name}.`
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'ADMIN_SPIN_GRANT_ERROR',
            message: 'No pudimos habilitar el giro.',
            detail: error.detail || null
        });
    }
};
