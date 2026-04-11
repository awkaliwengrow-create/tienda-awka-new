const clubForm = document.getElementById('clubProfileForm');
const clubPhoneInput = document.getElementById('clubPhone');
const clubFeedback = document.getElementById('clubFeedback');
const clubResult = document.getElementById('clubProfileResult');

function formatPhone(phone = '') {
    return String(phone).replace(/\D/g, '').slice(-10);
}

function formatDate(value) {
    if (!value) return 'Sin actividad aún';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Sin actividad aún';

    return parsed.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderHistory(items = []) {
    if (!items.length) {
        return '<div class="club-profile-empty">Todavía no hay historial de giros cargado para este perfil.</div>';
    }

    return items.map((item) => `
        <article class="club-history-item">
            <div>
                <strong>${item.prize}</strong>
                <span>${formatDate(item.createdAt)}</span>
            </div>
            <span class="club-history-badge${item.winner ? ' is-win' : ''}">${item.winner ? 'Premio' : 'Intento'}</span>
        </article>
    `).join('');
}

function renderProfile(profile) {
    const stateLabel = profile.exists ? 'Perfil encontrado' : 'Perfil listo para activarse';
    const stateCopy = profile.exists
        ? 'Este cliente ya tiene trazabilidad dentro del club y puede crecer sobre puntos, beneficios y giros.'
        : 'El número todavía no tiene cuenta registrada, pero la base ya está lista para conectarlo al sistema.';

    clubResult.innerHTML = `
        <div class="club-profile-card">
            <div class="club-profile-header">
                <div>
                    <div class="club-member-eyebrow">${stateLabel}</div>
                    <h3>${profile.name}</h3>
                    <p>${stateCopy}</p>
                </div>
                <div class="club-profile-phone">${profile.phone}</div>
            </div>
            <div class="club-profile-stats">
                <div class="club-profile-stat">
                    <strong>${profile.points.current}</strong>
                    <span>Puntos activos</span>
                </div>
                <div class="club-profile-stat">
                    <strong>${profile.points.redeemed}</strong>
                    <span>Canjeados</span>
                </div>
                <div class="club-profile-stat">
                    <strong>${profile.spins.pending}</strong>
                    <span>Giros pendientes</span>
                </div>
                <div class="club-profile-stat">
                    <strong>${profile.spins.wins}/${profile.spins.total}</strong>
                    <span>Premios / giros</span>
                </div>
            </div>
            <div class="club-profile-meta">
                <span>Última actividad: ${formatDate(profile.points.lastActivity)}</span>
            </div>
            <div class="club-profile-history">
                <div class="club-profile-history-title">Historial reciente</div>
                ${renderHistory(profile.history)}
            </div>
        </div>
    `;
};

async function handleClubProfileSubmit(event) {
    event.preventDefault();

    const phone = formatPhone(clubPhoneInput.value);

    if (phone.length < 8) {
        clubFeedback.textContent = 'Ingresá un WhatsApp válido para consultar el perfil.';
        clubFeedback.className = 'club-profile-feedback is-error';
        return;
    }

    clubFeedback.textContent = 'Consultando perfil...';
    clubFeedback.className = 'club-profile-feedback';
    clubResult.innerHTML = '';

    try {
        const response = await fetch(`/api/club-profile?phone=${encodeURIComponent(phone)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'No pudimos cargar el perfil.');
        }

        clubFeedback.textContent = 'Perfil cargado correctamente.';
        clubFeedback.className = 'club-profile-feedback is-success';
        renderProfile(data);
    } catch (error) {
        clubFeedback.textContent = error.message || 'No pudimos cargar el perfil.';
        clubFeedback.className = 'club-profile-feedback is-error';
        clubResult.innerHTML = `
            <div class="club-profile-empty">
                Cuando conectemos las credenciales server-side de Supabase, esta consulta va a traer puntos, giros e historial real del cliente.
            </div>
        `;
    }
}

if (clubForm) {
    clubForm.addEventListener('submit', handleClubProfileSubmit);
}
