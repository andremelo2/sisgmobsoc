-- ============================================================
--  SisMob — Schema Supabase
--  Sistema de Mobilização de Saúde | Sumbe, Cuanza Sul
--  Gerado automaticamente a partir do index.html
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSÕES
-- ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ────────────────────────────────────────────────────────────
-- 1. TABELA: coordenacoes
--    Representa cada coordenação de mobilização (Norte, Sul…)
-- ────────────────────────────────────────────────────────────
create table if not exists public.coordenacoes (
  id          bigint        generated always as identity primary key,
  nome        text          not null unique,
  created_at  timestamptz   not null default now()
);

comment on table  public.coordenacoes          is 'Coordenações de mobilização de saúde';
comment on column public.coordenacoes.nome     is 'Nome da coordenação (ex: Coordenação Norte)';


-- ────────────────────────────────────────────────────────────
-- 2. TABELA: utilizadores
--    Admins e supervisores do sistema.
--    A senha é armazenada em texto simples tal como o sistema
--    original — migrar para hash bcrypt quando possível.
-- ────────────────────────────────────────────────────────────
create table if not exists public.utilizadores (
  id          bigint        generated always as identity primary key,
  nome        text          not null,
  email       text          not null unique,
  senha       text          not null,
  tipo        text          not null default 'supervisor'
                            check (tipo in ('admin', 'supervisor')),
  coord_id    bigint        references public.coordenacoes(id)
                            on delete set null,
  created_at  timestamptz   not null default now()
);

comment on table  public.utilizadores           is 'Utilizadores do SisMob (admins e supervisores)';
comment on column public.utilizadores.tipo      is 'admin = acesso global | supervisor = acesso à coordenação';
comment on column public.utilizadores.coord_id  is 'NULL para admins; obrigatório para supervisores';
comment on column public.utilizadores.senha     is 'Senha em texto simples (legacy) — migrar para hash';


-- ────────────────────────────────────────────────────────────
-- 3. TABELA: fichas_mobilizacao
--    Cada ficha registada por um mobilizador no terreno.
--    table_data é JSONB com a estrutura:
--      { "casa": [locais, pessoas], "igreja": [locais, pessoas], … }
--    para os 8 locais definidos em LOCAIS[].
-- ────────────────────────────────────────────────────────────
create table if not exists public.fichas_mobilizacao (
  id            bigint        generated always as identity primary key,

  -- Localização geográfica
  provincia     text          not null default 'CUANZA-SUL',
  municipio     text          not null default 'SUMBE',
  comuna        text          not null default 'SEDE',
  bairro        text          not null,

  -- Mobilização
  data          date          not null,
  mobilizador   text          not null,
  telefone      text,

  -- Coordenação (desnormalizado para relatórios rápidos)
  coord_id      bigint        references public.coordenacoes(id)
                              on delete set null,
  coord_nome    text,

  -- Utilizador que registou
  user_id       bigint        references public.utilizadores(id)
                              on delete set null,

  -- Dados da tabela de mobilização (JSONB)
  -- Estrutura: { "casa": [nr_locais, nr_pessoas], "igreja": [...], ... }
  -- Locais: casa | igreja | pracas | paragem | creche | escola | agua | outros
  table_data    jsonb         not null default '{}',

  -- Totais calculados (redundância para performance)
  total_locais  integer       not null default 0,
  total_pessoas integer       not null default 0,

  -- Pergunta final: "Queres que venham vacinar à tua casa?"
  sim           integer       not null default 0,
  nao           integer       not null default 0,
  motivo        text,         -- motivo quando nao > 0

  created_at    timestamptz   not null default now()
);

comment on table  public.fichas_mobilizacao              is 'Fichas de mobilização registadas no terreno';
comment on column public.fichas_mobilizacao.table_data   is 'JSONB: {"casa":[locais,pessoas],"igreja":[locais,pessoas],…}';
comment on column public.fichas_mobilizacao.total_locais is 'Soma de todos os locais visitados (calculado no frontend)';
comment on column public.fichas_mobilizacao.sim          is 'Pessoas que aceitaram a vacinação domiciliar';
comment on column public.fichas_mobilizacao.nao          is 'Pessoas que recusaram a vacinação domiciliar';


-- ────────────────────────────────────────────────────────────
-- 4. ÍNDICES
-- ────────────────────────────────────────────────────────────
create index if not exists idx_fichas_data
  on public.fichas_mobilizacao(data desc);

create index if not exists idx_fichas_coord
  on public.fichas_mobilizacao(coord_id);

create index if not exists idx_fichas_user
  on public.fichas_mobilizacao(user_id);

create index if not exists idx_fichas_bairro
  on public.fichas_mobilizacao(bairro);

create index if not exists idx_utilizadores_coord
  on public.utilizadores(coord_id);


-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
--    O sistema usa a anon key directamente (sem Auth do Supabase),
--    por isso precisamos de políticas permissivas para a anon key.
--    ATENÇÃO: para produção, migrar para Supabase Auth.
-- ────────────────────────────────────────────────────────────
alter table public.coordenacoes       enable row level security;
alter table public.utilizadores       enable row level security;
alter table public.fichas_mobilizacao enable row level security;

-- Coordenações: leitura e escrita livres para anon (sistema gere auth própria)
create policy "anon_all_coordenacoes"
  on public.coordenacoes for all
  to anon
  using (true)
  with check (true);

-- Utilizadores: leitura e escrita livres para anon
create policy "anon_all_utilizadores"
  on public.utilizadores for all
  to anon
  using (true)
  with check (true);

-- Fichas: leitura e escrita livres para anon
create policy "anon_all_fichas"
  on public.fichas_mobilizacao for all
  to anon
  using (true)
  with check (true);


-- ────────────────────────────────────────────────────────────
-- 6. DADOS INICIAIS (SEED)
-- ────────────────────────────────────────────────────────────

-- Coordenações padrão
insert into public.coordenacoes (nome) values
  ('Coordenação Norte'),
  ('Coordenação Sul'),
  ('Coordenação Centro')
on conflict (nome) do nothing;

-- Utilizador administrador padrão
-- IMPORTANTE: alterar a senha após o primeiro login!
insert into public.utilizadores (nome, email, senha, tipo, coord_id) values
  ('Administrador', 'admin@sismob.ao', 'admin123', 'admin', null)
on conflict (email) do nothing;

-- Supervisores de exemplo (remover em produção ou alterar senhas)
insert into public.utilizadores (nome, email, senha, tipo, coord_id)
select 'João Supervisor', 'joao@sismob.ao', 'joao123', 'supervisor', id
from public.coordenacoes where nome = 'Coordenação Norte'
on conflict (email) do nothing;

insert into public.utilizadores (nome, email, senha, tipo, coord_id)
select 'Maria Silva', 'maria@sismob.ao', 'maria123', 'supervisor', id
from public.coordenacoes where nome = 'Coordenação Sul'
on conflict (email) do nothing;


-- ────────────────────────────────────────────────────────────
-- 7. VIEW AUXILIAR: resumo por coordenação
-- ────────────────────────────────────────────────────────────
create or replace view public.resumo_coordenacoes as
select
  c.id                           as coord_id,
  c.nome                         as coordenacao,
  count(f.id)                    as total_fichas,
  coalesce(sum(f.total_locais),  0) as total_locais,
  coalesce(sum(f.total_pessoas), 0) as total_pessoas,
  coalesce(sum(f.sim),           0) as total_sim,
  coalesce(sum(f.nao),           0) as total_nao,
  max(f.data)                    as ultima_ficha
from public.coordenacoes c
left join public.fichas_mobilizacao f on f.coord_id = c.id
group by c.id, c.nome
order by c.nome;

comment on view public.resumo_coordenacoes is 'Totais agregados de mobilização por coordenação';


-- ────────────────────────────────────────────────────────────
-- 8. VIEW AUXILIAR: resumo por bairro
-- ────────────────────────────────────────────────────────────
create or replace view public.resumo_bairros as
select
  bairro,
  coord_nome,
  count(id)                      as total_fichas,
  coalesce(sum(total_locais),  0) as total_locais,
  coalesce(sum(total_pessoas), 0) as total_pessoas,
  coalesce(sum(sim),           0) as total_sim,
  coalesce(sum(nao),           0) as total_nao
from public.fichas_mobilizacao
group by bairro, coord_nome
order by total_pessoas desc;

comment on view public.resumo_bairros is 'Totais de mobilização agrupados por bairro';


-- ────────────────────────────────────────────────────────────
-- FIM DO SCRIPT
-- Executar no SQL Editor do Supabase:
--   https://supabase.com/dashboard/project/<project-ref>/sql
-- ────────────────────────────────────────────────────────────
