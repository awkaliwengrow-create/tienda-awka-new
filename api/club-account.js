const {
    CLUB_ENV_ERROR,
    fetchCustomerByPhone,
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
        json(res, 400, { error: 'Invalid phone', message: 'Ingresa un WhatsApp valido.' });
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
        const customer = await fetchCustomerByPhone(phone);
        json(res, 200, {
            exists: Boolean(customer),
            phone,
            name: customer?.nombre || '',
            hasPin: Boolean(customer?.pin)
        });
    } catch (error) {
        json(res, 500, {
            error: error.code || 'CLUB_ACCOUNT_ERROR',
            message: 'No pudimos revisar el estado de la cuenta.'
        });
    }
};
