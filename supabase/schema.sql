-- Tabla para guardar los diseños de la calculadora.
-- Pégalo en Supabase: SQL Editor > New query > Run.

create table if not exists public.disenos (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  tipo        text        not null check (tipo in ('espiras', 'nucleo')),
  nombre      text        not null check (char_length(nombre) <= 120),
  datos       jsonb       not null,   -- datos ingresados en el formulario
  resultados  jsonb       not null    -- resultados del cálculo
);

-- Seguridad a nivel de fila (RLS): obligatoria, porque la clave anon queda visible en la página.
alter table public.disenos enable row level security;

-- La app (rol anon) solo puede INSERTAR. No puede leer, editar ni borrar registros.
grant insert on public.disenos to anon;

create policy "anon puede insertar disenos"
  on public.disenos
  for insert
  to anon
  with check (true);

-- Tú ves los registros desde el panel de Supabase (Table Editor), que no depende de estas políticas.
