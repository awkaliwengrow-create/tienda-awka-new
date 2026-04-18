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

create index if not exists idx_clientes_telefono on public.clientes (telefono);
create index if not exists idx_puntos_telefono on public.puntos (telefono);
create index if not exists idx_giros_telefono_estado on public.giros_habilitados (telefono, estado);
create index if not exists idx_ruleta_telefono_created on public.ruleta_registros (telefono, created_at desc);
create index if not exists idx_movimientos_telefono_created on public.club_puntos_movimientos (telefono, created_at desc);
create index if not exists idx_club_compras_telefono_created on public.club_compras (telefono, created_at desc);

comment on table public.clientes is 'Base de identidad liviana para Club Awka.';
comment on table public.puntos is 'Saldo de puntos acumulados y canjeados por cliente.';
comment on table public.giros_habilitados is 'Control de acceso a la ruleta y beneficios desbloqueados.';
comment on table public.ruleta_registros is 'Historial auditable de resultados de ruleta.';
comment on table public.club_puntos_movimientos is 'Auditoria e idempotencia de puntos acreditados por compras.';
comment on table public.club_compras is 'Compras aprobadas que permiten calcular nivel y progreso del club.';
