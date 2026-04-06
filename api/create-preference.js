const MERCADO_PAGO_API = 'https://api.mercadopago.com/checkout/preferences';

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
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
        res.status(500).json({ error: 'Missing Mercado Pago access token' });
        return;
    }

    try {
        const body = await readJsonBody(req);
        const items = Array.isArray(body.items) ? body.items : [];

        if (items.length === 0) {
            res.status(400).json({ error: 'Cart is empty' });
            return;
        }

        const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;
        const preferencePayload = {
            items: items.map((item) => ({
                title: item.title,
                quantity: Number(item.quantity) || 1,
                unit_price: Number(item.unit_price) || 0,
                currency_id: 'ARS'
            })),
            back_urls: {
                success: `${siteUrl}/shop.html?payment=success`,
                pending: `${siteUrl}/shop.html?payment=pending`,
                failure: `${siteUrl}/shop.html?payment=failure`
            },
            auto_return: 'approved',
            statement_descriptor: 'AWKA LIWEN',
            external_reference: body.reference || `awka-${Date.now()}`
        };

        const mpResponse = await fetch(MERCADO_PAGO_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferencePayload)
        });

        const data = await mpResponse.json();

        if (!mpResponse.ok) {
            res.status(mpResponse.status).json({
                error: 'Mercado Pago preference error',
                details: data
            });
            return;
        }

        res.status(200).json({
            id: data.id,
            init_point: data.init_point,
            sandbox_init_point: data.sandbox_init_point
        });
    } catch (error) {
        res.status(500).json({
            error: 'Preference creation failed',
            message: error.message
        });
    }
};
