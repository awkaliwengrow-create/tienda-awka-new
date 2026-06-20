create table if not exists public.clientes (
    id bigserial primary key,
    nombre text not null,
    telefono text not null unique,
    pin text,
    created_at timestamptz not null default now()
);

create table if not exists public.puntos (
    id bigserial primary key,
    telefono text not null unique,
    nombre text not null,
    puntos integer not null default 0,
    puntos_canjeados integer not null default 0,
    ultima_actividad timestamptz not null default now()
);

create table if not exists public.giros_habilitados (
    id bigserial primary key,
    nombre text not null,
    telefono text not null,
    estado text not null default 'pendiente' check (estado in ('pendiente', 'usado')),
    created_at timestamptz not null default now(),
    used_at timestamptz
);

create table if not exists public.ruleta_registros (
    id bigserial primary key,
    nombre text not null,
    telefono text not null,
    premio text,
    ganador boolean,
    fecha timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.club_puntos_movimientos (
    id bigserial primary key,
    referencia text not null unique,
    telefono text not null,
    nombre text not null,
    monto_total numeric(12,2) not null default 0,
    puntos integer not null default 0,
    origen text not null default 'mercado_pago',
    created_at timestamptz not null default now()
);

create table if not exists public.club_compras (
    id bigserial primary key,
    referencia text not null unique,
    telefono text not null,
    nombre text not null,
    monto_total numeric(12,2) not null default 0,
    canal text not null default 'mercado_pago',
    estado text not null default 'aprobada' check (estado in ('aprobada', 'pendiente', 'cancelada')),
    created_at timestamptz not null default now()
);

create table if not exists public.club_premios_estado (
    id bigserial primary key,
    ruleta_registro_id bigint not null unique references public.ruleta_registros(id) on delete cascade,
    telefono text not null,
    nombre text not null,
    premio text not null,
    premio_codigo text,
    premio_tipo text not null default 'product',
    product_id bigint,
    discount_percent integer,
    estado text not null default 'pendiente' check (estado in ('pendiente', 'entregado', 'cancelado')),
    delivery_note text,
    delivered_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.club_niveles_historial (
    id bigserial primary key,
    telefono text not null,
    nivel_anterior text not null,
    nivel_nuevo text not null,
    motivo text,
    created_at timestamptz not null default now(),
    unique (telefono, nivel_nuevo)
);

create table if not exists public.club_campaign_activations (
    id bigserial primary key,
    activation_key text not null unique,
    telefono text not null,
    nombre text not null,
    campaign_id text not null,
    trigger_type text not null,
    reference text,
    note text,
    created_at timestamptz not null default now()
);

create table if not exists public.club_reward_redemptions (
    id bigserial primary key,
    referencia text not null unique,
    telefono text not null,
    nombre text not null,
    product_id bigint not null,
    reward_key text not null,
    product_name text not null,
    size_label text,
    points_cost integer not null,
    estado text not null default 'pendiente' check (estado in ('pendiente', 'entregado', 'cancelado')),
    request_note text,
    delivery_note text,
    delivered_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.club_whatsapp_notifications (
    id bigserial primary key,
    telefono text not null,
    tipo text not null,
    mensaje text not null,
    estado text not null default 'pending' check (estado in ('pending', 'sent', 'failed', 'skipped')),
    provider text,
    provider_message_id text,
    provider_response jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_clientes_telefono on public.clientes (telefono);
create index if not exists idx_puntos_telefono on public.puntos (telefono);
create index if not exists idx_giros_telefono_estado on public.giros_habilitados (telefono, estado);
create index if not exists idx_ruleta_telefono_created on public.ruleta_registros (telefono, created_at desc);
create index if not exists idx_movimientos_telefono_created on public.club_puntos_movimientos (telefono, created_at desc);
create index if not exists idx_club_compras_telefono_created on public.club_compras (telefono, created_at desc);
create index if not exists idx_club_premios_estado_status_created on public.club_premios_estado (estado, created_at desc);
create index if not exists idx_club_premios_estado_telefono on public.club_premios_estado (telefono);
create index if not exists idx_club_niveles_historial_telefono_created on public.club_niveles_historial (telefono, created_at desc);
create index if not exists idx_club_campaign_activations_telefono_created on public.club_campaign_activations (telefono, created_at desc);
create index if not exists idx_club_campaign_activations_campaign_created on public.club_campaign_activations (campaign_id, created_at desc);
create index if not exists idx_club_reward_redemptions_telefono_created on public.club_reward_redemptions (telefono, created_at desc);
create index if not exists idx_club_reward_redemptions_status_created on public.club_reward_redemptions (estado, created_at desc);
create index if not exists idx_club_whatsapp_notifications_telefono_created on public.club_whatsapp_notifications (telefono, created_at desc);

comment on table public.clientes is 'Base de identidad liviana para Club Awka.';
comment on table public.puntos is 'Saldo de puntos acumulados y canjeados por cliente.';
comment on table public.giros_habilitados is 'Control de acceso a la ruleta y beneficios desbloqueados.';
comment on table public.ruleta_registros is 'Historial auditable de resultados de ruleta.';
comment on table public.club_puntos_movimientos is 'Auditoria e idempotencia de puntos acreditados por compras.';
comment on table public.club_compras is 'Compras aprobadas que permiten calcular nivel y progreso del club.';
comment on table public.club_premios_estado is 'Trazabilidad operativa de premios ganados y entregados.';
comment on table public.club_niveles_historial is 'Auditoria de subidas de nivel y desbloqueos del sistema de fidelizacion.';
comment on table public.club_campaign_activations is 'Registro de campanas y automatizaciones disparadas sobre perfiles del club.';
comment on table public.club_reward_redemptions is 'Canjes de puntos solicitados desde Club Awka y gestionados desde admin.';
comment on table public.club_whatsapp_notifications is 'Auditoria opcional de mensajes de WhatsApp enviados por el ecosistema del club.';
