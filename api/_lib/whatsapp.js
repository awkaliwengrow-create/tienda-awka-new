const { normalizePhone, supabaseRequest } = require('./club');

function getWhatsAppEnv() {
    const enabledRaw = String(process.env.AWKA_WHATSAPP_NOTIFICATIONS_ENABLED || '').trim().toLowerCase();
    const provider = String(process.env.AWKA_WHATSAPP_PROVIDER || 'meta_cloud').trim().toLowerCase();
    const accessToken = String(process.env.AWKA_WHATSAPP_ACCESS_TOKEN || '').trim();
    const phoneNumberId = String(process.env.AWKA_WHATSAPP_PHONE_NUMBER_ID || '').trim();
    const graphVersion = String(process.env.AWKA_WHATSAPP_GRAPH_VERSION || 'v25.0').trim();
    const defaultCountryCode = String(process.env.AWKA_WHATSAPP_DEFAULT_COUNTRY_CODE || '549').replace(/\D/g, '');
    const siteUrl = String(process.env.SITE_URL || '').trim().replace(/\/$/, '');
    const templateLanguage = String(process.env.AWKA_WHATSAPP_TEMPLATE_LANGUAGE || 'es_AR').trim();
    const enabled = ['1', 'true', 'yes', 'si'].includes(enabledRaw);
    const defaultTemplates = {
        points: 'awka_club_puntos',
        pointsAndSpins: 'awka_club_puntos_giros',
        spins: 'awka_club_giros'
    };

    return {
        enabled,
        provider,
        accessToken,
        phoneNumberId,
        graphVersion,
        defaultCountryCode,
        siteUrl,
        templateLanguage,
        templates: {
            points: String(process.env.AWKA_WHATSAPP_TEMPLATE_POINTS || defaultTemplates.points).trim(),
            pointsAndSpins: String(process.env.AWKA_WHATSAPP_TEMPLATE_POINTS_AND_SPINS || defaultTemplates.pointsAndSpins).trim(),
            spins: String(process.env.AWKA_WHATSAPP_TEMPLATE_SPINS || defaultTemplates.spins).trim()
        },
        configured: enabled && provider === 'meta_cloud' && !!accessToken && !!phoneNumberId
    };
}

function buildArgentinaPhoneCandidates(normalizedPhone) {
    if (!/^\d{10}$/.test(normalizedPhone)) {
        return [];
    }

    const candidates = [`54${normalizedPhone}`];

    // Meta sometimes registers Argentina test recipients as 54 + area code + 15 + local number.
    [2, 3, 4].forEach((areaCodeLength) => {
        const localNumberLength = normalizedPhone.length - areaCodeLength;
        if (localNumberLength < 6 || localNumberLength > 8) {
            return;
        }

        const areaCode = normalizedPhone.slice(0, areaCodeLength);
        const localNumber = normalizedPhone.slice(areaCodeLength);
        if (!localNumber || localNumber.startsWith('0')) {
            return;
        }

        candidates.push(`54${areaCode}15${localNumber}`);
    });

    return candidates;
}

function buildWhatsAppPhoneCandidates(phone, defaultCountryCode) {
    const rawDigits = String(phone || '').replace(/\D/g, '');
    const normalized = normalizePhone(rawDigits);

    if (!normalized) return [];

    const candidates = [];

    if (rawDigits.length > normalized.length) {
        candidates.push(rawDigits);
    }

    candidates.push(`${defaultCountryCode}${normalized}`);

    if (defaultCountryCode === '54' || defaultCountryCode === '549') {
        candidates.push(...buildArgentinaPhoneCandidates(normalized));
    }

    return [...new Set(candidates.filter(Boolean))];
}

function toWhatsAppPhone(phone, defaultCountryCode) {
    return buildWhatsAppPhoneCandidates(phone, defaultCountryCode)[0] || '';
}

function isRetryableRecipientError(error) {
    const code = String(error?.code || '').trim();
    const message = String(error?.detail?.error?.message || error?.message || '').trim().toLowerCase();

    return (
        code === '133010'
        || code === '131030'
        || message.includes('account not registered')
        || message.includes('not in allowed list')
    );
}

function formatNumber(value, singular, plural = `${singular}s`) {
    const amount = Number(value || 0);
    return `${amount} ${amount === 1 ? singular : plural}`;
}

function buildClubUrl(siteUrl) {
    return siteUrl ? `${siteUrl}/club.html` : '';
}

function buildNotificationMessage(type, payload, env) {
    const name = String(payload.name || 'Awka').trim();
    const clubUrl = buildClubUrl(env.siteUrl);
    const clubSuffix = clubUrl ? ` Revisa tu panel: ${clubUrl}` : '';

    switch (type) {
    case 'purchase_progress': {
        const points = Number(payload.points || 0);
        const spins = Number(payload.spins || 0);

        if (points > 0 && spins > 0) {
            return `Hola ${name}, tu compra en Awka ya sumo ${formatNumber(points, 'punto')} y activo ${formatNumber(spins, 'giro')} en Awka Play.${clubSuffix}`;
        }

        if (points > 0) {
            return `Hola ${name}, tu compra en Awka ya sumo ${formatNumber(points, 'punto')} en Club Awka.${clubSuffix}`;
        }

        if (spins > 0) {
            return `Hola ${name}, tu compra en Awka activo ${formatNumber(spins, 'giro')} para Awka Play.${clubSuffix}`;
        }

        return '';
    }

    case 'manual_spin_grant': {
        const spins = Number(payload.spins || 0);
        return `Hola ${name}, te habilitamos ${formatNumber(spins, 'giro')} en Awka Play.${clubSuffix}`;
    }

    case 'manual_points_credit': {
        const points = Number(payload.points || 0);
        return `Hola ${name}, te acreditamos ${formatNumber(points, 'punto')} en Club Awka.${clubSuffix}`;
    }

    default:
        return '';
    }
}

function buildTemplateConfig(type, payload, env) {
    const name = String(payload.name || 'Awka').trim();
    const clubUrl = buildClubUrl(env.siteUrl) || 'Club Awka';

    switch (type) {
    case 'purchase_progress': {
        const points = Number(payload.points || 0);
        const spins = Number(payload.spins || 0);

        if (points > 0 && spins > 0 && env.templates.pointsAndSpins) {
            return {
                name: env.templates.pointsAndSpins,
                parameters: [name, String(points), String(spins), clubUrl]
            };
        }

        if (points > 0 && env.templates.points) {
            return {
                name: env.templates.points,
                parameters: [name, String(points), clubUrl]
            };
        }

        if (spins > 0 && env.templates.spins) {
            return {
                name: env.templates.spins,
                parameters: [name, String(spins), clubUrl]
            };
        }

        return null;
    }

    case 'manual_spin_grant':
        return env.templates.spins
            ? {
                name: env.templates.spins,
                parameters: [name, String(Number(payload.spins || 0)), clubUrl]
            }
            : null;

    case 'manual_points_credit':
        return env.templates.points
            ? {
                name: env.templates.points,
                parameters: [name, String(Number(payload.points || 0)), clubUrl]
            }
            : null;

    default:
        return null;
    }
}

async function recordNotificationLog(entry) {
    try {
        await supabaseRequest('club_whatsapp_notifications', {
            method: 'POST',
            body: JSON.stringify({
                telefono: entry.phone,
                tipo: entry.type,
                mensaje: entry.message,
                estado: entry.status,
                provider: entry.provider || 'meta_cloud',
                provider_message_id: entry.providerMessageId || null,
                provider_response: entry.providerResponse || null,
                created_at: new Date().toISOString()
            })
        });
    } catch (error) {
        // No interrumpir el flujo principal si la tabla aun no existe o falla el log.
    }
}

function buildTemplatePayload(template, env) {
    return {
        messaging_product: 'whatsapp',
        type: 'template',
        template: {
            name: template.name,
            language: {
                code: env.templateLanguage
            },
            components: template.parameters?.length
                ? [
                    {
                        type: 'body',
                        parameters: template.parameters.map((value) => ({
                            type: 'text',
                            text: String(value)
                        }))
                    }
                ]
                : []
        }
    };
}

async function sendMetaCloudMessage({ to, body, template, env }) {
    const payload = template
        ? buildTemplatePayload(template, env)
        : {
            messaging_product: 'whatsapp',
            type: 'text',
            text: {
                preview_url: false,
                body
            }
        };

    const response = await fetch(`https://graph.facebook.com/${env.graphVersion}/${env.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to,
            ...payload
        })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data?.error?.message || `WHATSAPP_${response.status}`);
        error.code = data?.error?.code || `WHATSAPP_${response.status}`;
        error.detail = data;
        throw error;
    }

    return data;
}

async function sendMetaCloudMessageWithFallback({ recipients, body, template, env }) {
    let lastError = null;

    for (let index = 0; index < recipients.length; index += 1) {
        const to = recipients[index];

        try {
            const data = await sendMetaCloudMessage({ to, body, template, env });
            return { data, to };
        } catch (error) {
            error.attemptedTo = to;
            lastError = error;

            if (!isRetryableRecipientError(error) || index === recipients.length - 1) {
                throw error;
            }
        }
    }

    throw lastError || new Error('WHATSAPP_SEND_FAILED');
}

async function sendClubWhatsAppNotification({ phone, name, type, payload = {} }) {
    const env = getWhatsAppEnv();
    const recipients = buildWhatsAppPhoneCandidates(phone, env.defaultCountryCode);
    const primaryRecipient = recipients[0] || '';
    const message = buildNotificationMessage(type, { ...payload, name }, env);
    const template = buildTemplateConfig(type, { ...payload, name }, env);

    if (!message && !template) {
        return { ok: false, skipped: true, reason: 'EMPTY_MESSAGE' };
    }

    if (!env.configured) {
        await recordNotificationLog({
            phone: primaryRecipient || phone,
            type,
            message: template ? `template:${template.name}` : message,
            status: 'skipped',
            provider: env.provider,
            providerResponse: {
                reason: env.enabled ? 'WHATSAPP_NOT_CONFIGURED' : 'WHATSAPP_DISABLED'
            }
        });

        return {
            ok: false,
            skipped: true,
            reason: env.enabled ? 'WHATSAPP_NOT_CONFIGURED' : 'WHATSAPP_DISABLED'
        };
    }

    if (!primaryRecipient) {
        await recordNotificationLog({
            phone: phone || '',
            type,
            message: template ? `template:${template.name}` : message,
            status: 'failed',
            provider: env.provider,
            providerResponse: {
                reason: 'INVALID_PHONE'
            }
        });

        return { ok: false, skipped: false, reason: 'INVALID_PHONE' };
    }

    try {
        const { data, to } = await sendMetaCloudMessageWithFallback({
            recipients,
            body: message,
            template,
            env
        });
        const providerMessageId = data?.messages?.[0]?.id || null;

        await recordNotificationLog({
            phone: to,
            type,
            message: template ? `template:${template.name}` : message,
            status: 'sent',
            provider: env.provider,
            providerMessageId,
            providerResponse: data
        });

        return {
            ok: true,
            skipped: false,
            provider: env.provider,
            messageId: providerMessageId,
            to
        };
    } catch (error) {
        await recordNotificationLog({
            phone: error.attemptedTo || primaryRecipient,
            type,
            message: template ? `template:${template.name}` : message,
            status: 'failed',
            provider: env.provider,
            providerResponse: error.detail || { code: error.code || 'WHATSAPP_SEND_FAILED' }
        });

        return {
            ok: false,
            skipped: false,
            reason: error.code || 'WHATSAPP_SEND_FAILED',
            detailMessage: error.detail?.error?.message || error.message || ''
        };
    }
}

module.exports = {
    buildWhatsAppPhoneCandidates,
    buildNotificationMessage,
    getWhatsAppEnv,
    sendClubWhatsAppNotification,
    toWhatsAppPhone
};
