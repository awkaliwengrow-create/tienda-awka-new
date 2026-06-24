const { sendClubWhatsAppNotification } = require('../api/_lib/whatsapp');

function readArg(flag) {
    const index = process.argv.indexOf(flag);
    if (index === -1) return '';
    return String(process.argv[index + 1] || '').trim();
}

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

async function main() {
    const phone = readArg('--phone');
    const name = readArg('--name') || 'Cliente Awka';
    const type = readArg('--type') || 'manual_points_credit';
    const points = toNumber(readArg('--points'));
    const spins = toNumber(readArg('--spins'));

    if (!phone) {
        throw new Error('Falta --phone. Ejemplo: node scripts/test-whatsapp-notification.js --phone 2494009164 --name Joaquin --type manual_points_credit --points 3');
    }

    const supportedTypes = new Set([
        'purchase_progress',
        'manual_spin_grant',
        'manual_points_credit'
    ]);

    if (!supportedTypes.has(type)) {
        throw new Error(`Tipo no soportado: ${type}`);
    }

    const result = await sendClubWhatsAppNotification({
        phone,
        name,
        type,
        payload: {
            points,
            spins
        }
    });

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
});
