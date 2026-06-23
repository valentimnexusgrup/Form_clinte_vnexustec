# PROJECT MASTER CONTEXT — Form Cliente VN Tec

> Documento oficial único do projeto. Qualquer desenvolvedor ou IA deve começar por aqui.
>
> Nenhum outro arquivo de auditoria ou contexto é necessário para compreender o sistema.
>
> ⚠️ Toda alteração futura deve atualizar **exclusivamente** este arquivo.

---

## 1. VISÃO GERAL DO PROJETO

| Campo | Valor |
|---|---|
| **Nome** | Form Cliente VN Tec (Briefing de Landing Page) |
| **Objetivo** | Coletar briefing estruturado de clientes para criação de Landing Pages de alta conversão |
| **Status atual** | MVP em produção — backend Supabase (Postgres + Storage), identificação simplificada por Nome + WhatsApp |
| **Escopo** | Formulário digital guiado de 7 etapas com salvamento automático, exportação para IA e painel de gestão |
| **Público-alvo** | Clientes/contratantes da VNEXUS TEC |
| **Problema resolvido** | Substitui coleta manual de briefing por formulário digital guiado com salvamento automático, exportação para IA e painel de gestão |

---

## 2. ARQUITETURA

### 2.1 Frontend

| Categoria | Tecnologia |
|---|---|
| **Framework principal** | TanStack Start (React 19, TanStack Router, TanStack Query) |
| **Linguagem** | TypeScript 5.8 (strict mode) |
| **Build** | Vite 8 + Rolldown |
| **CSS** | Tailwind CSS 4 + tw-animate-css |
| **Componentes** | Radix UI + shadcn/ui (New York style) |
| **Ícones** | Lucide React |
| **Runtime** | Node.js (npm) |
| **SSR** | TanStack Start com renderização server-side |
| **Roteamento** | File-based com TanStack Router |

### 2.2 Backend

| Categoria | Tecnologia |
|---|---|
| **Backend** | Supabase (Postgres + Storage) |
| **Identificação** | Nome Completo + últimos 4 dígitos do WhatsApp |
| **Autenticação** | Nenhuma — sistema simplificado sem OAuth, senha, JWT ou MFA |

### 2.3 Banco

| Categoria | Tecnologia |
|---|---|
| **Banco** | PostgreSQL via Supabase |
| **Tabelas** | `profiles`, `briefings` |
| **Formato dados** | JSONB para flexibilidade de schema |

### 2.4 Storage

| Categoria | Tecnologia |
|---|---|
| **Storage** | Supabase Storage |
| **Bucket** | `briefing_files` |
| **Políticas** | Públicas (leitura, inserção, atualização, exclusão) |

### 2.5 Bibliotecas principais

| Biblioteca | Finalidade |
|---|---|
| `@tanstack/react-router` | Roteamento file-based com tipos |
| `@tanstack/react-query` | Gerenciamento de estado server-side |
| `@tanstack/react-start` | Meta-framework SSR |
| `@radix-ui/*` | Componentes acessíveis headless |
| `class-variance-authority` + `tailwind-merge` + `clsx` | Utilitários de classe CSS |
| `@supabase/supabase-js` | Cliente Supabase (banco + storage) |
| `lucide-react` | Ícones |
| `tailwindcss` + `tw-animate-css` | Estilização utilitária |

### 2.6 Estrutura técnica

- SSR com fallback de erro amigável (`src/lib/error-page.ts`)
- Página 404 customizada (`__root.tsx` — `NotFoundComponent`)
- Error boundary no root (`__root.tsx` — `ErrorComponent`)
- Meta tags SEO (Open Graph, Twitter Card)
- Captura global de erros não tratados (`src/lib/error-capture.ts`)
- File-based routing com `routeTree.gen.ts` auto-gerado

---

## 3. ESTRUTURA DE PASTAS

```
Form Cliente VN Tec/
├── src/
│   ├── assets/
│   │   └── vnexus-logo.svg          # Logotipo oficial em SVG (substituiu asset Lovable CDN)
│   │
│   ├── components/
│   │   └── ui/                       # Componentes shadcn/ui (52 componentes)
│   │       ├── accordion.tsx         # Radix Accordion
│   │       ├── alert-dialog.tsx      # Radix AlertDialog
│   │       ├── avatar.tsx            # Radix Avatar
│   │       ├── badge.tsx             # Badge de status
│   │       ├── button.tsx            # Botão com variantes
│   │       ├── card.tsx              # Card container
│   │       ├── checkbox.tsx          # Radix Checkbox
│   │       ├── dialog.tsx            # Radix Dialog
│   │       ├── input.tsx             # Input base
│   │       ├── label.tsx             # Label base
│   │       ├── progress.tsx          # Barra de progresso
│   │       ├── radio-group.tsx       # Radix RadioGroup
│   │       ├── select.tsx            # Radix Select
│   │       ├── separator.tsx         # Separador visual
│   │       ├── skeleton.tsx          # Skeleton loading
│   │       ├── table.tsx             # Tabela
│   │       ├── tabs.tsx              # Radix Tabs
│   │       ├── textarea.tsx          # Textarea base
│   │       └── ...                   # Demais componentes shadcn
│   │
│   ├── hooks/
│   │   └── use-mobile.tsx            # Hook de detecção mobile (shadcn sidebar)
│   │
│   ├── lib/                          # Lógica de negócio (toda aqui)
│   │   ├── identification.tsx        # IdentificationProvider + useIdentification + identify()
│   │   ├── briefing-schema.ts        # Schema do formulário (7 etapas, ~30 campos)
│   │   ├── briefing-summary.tsx      # Componente Summary + funções legado localStorage
│   │   ├── error-capture.ts          # Captura global de erros SSR (globalThis.addEventListener)
│   │   ├── error-page.ts             # Página HTML de erro SSR (fallback sem React)
│   │   ├── supabase.ts               # Cliente Supabase singleton
│   │   └── utils.ts                  # Função cn() (clsx + tailwind-merge)
│   │
│   ├── routes/                       # Rotas file-based do TanStack Router
│   │   ├── __root.tsx                # Layout raiz (shell HTML, providers, SEO, IdentificationProvider)
│   │   ├── index.tsx                 # Landing page com formulário de identificação (/)
│   │   ├── briefing.tsx              # Formulário multi-etapas com autosave Supabase (/briefing)
│   │   ├── admin.tsx                 # Painel administrativo com ADMIN_USERS (/admin)
│   │   └── README.md                 # Documentação de convenções de roteamento
│   │
│   ├── routeTree.gen.ts              # Árvore de rotas gerada automaticamente (NÃO editar manualmente)
│   ├── router.tsx                    # Configuração do roteador TanStack + error/not-found default
│   ├── server.ts                     # Entry point SSR com fallback de erro (h3)
│   ├── start.ts                      # Configuração do TanStack Start (createStart)
│   └── styles.css                    # Estilos globais + theme tokens + classes utilitárias
│
├── AGENTS.md                         # Convenções do projeto para IAs (mantido como referência)
├── PROJECT_MASTER_CONTEXT.md         # Este arquivo — única fonte de verdade
├── bunfig.toml                       # Configuração Bun (opcional/manutenção)
├── components.json                   # Configuração do shadcn/ui
├── eslint.config.js                  # ESLint flat config
├── package.json                      # Dependências e scripts
├── tsconfig.json                     # TypeScript strict config
└── vite.config.ts                    # Vite config com plugins manuais
```

### Finalidade dos diretórios

| Diretório | Finalidade |
|---|---|
| `src/assets/` | Assets estáticos compilados pelo Vite (logo em WebP + SVG legado) |
| `src/components/ui/` | Componentes de UI reutilizáveis (shadcn/ui) — headless, acessíveis, estilizados com Tailwind |
| `src/hooks/` | Custom hooks compartilhados |
| `src/lib/` | Lógica de negócio pura — sem JSX, sem efeitos colaterais de UI |
| `src/routes/` | Páginas e layouts — file-based routing do TanStack Router |

### Finalidade dos arquivos importantes

| Arquivo | Finalidade |
|---|---|
| `lib/identification.tsx` | Provider de identificação — busca/cria perfil por Nome + WhatsApp |
| `lib/briefing-schema.ts` | Schema do formulário — 7 etapas, tipos de campo, validação |
| `lib/briefing-summary.tsx` | Componente de resumo + buildBriefing() para exportação Markdown |
| `lib/supabase.ts` | Singleton do cliente Supabase com validação de env vars |
| `lib/utils.ts` | Função `cn()` para merging de classes Tailwind |
| `lib/error-capture.ts` | Captura global de erros SSR para diagnóstico |
| `lib/error-page.ts` | Página HTML estática para erros SSR fatais |
| `routes/__root.tsx` | Shell da aplicação — HTML, providers, SEO, error/not-found |
| `routes/index.tsx` | Landing page com formulário de identificação |
| `routes/briefing.tsx` | Formulário de 7 etapas com autosave |
| `routes/admin.tsx` | Painel administrativo |
| `router.tsx` | Instância do roteador TanStack |
| `server.ts` | Servidor SSR com fallback de erro |
| `start.ts` | Configuração do TanStack Start |
| `styles.css` | Tema dark, variáveis CSS, classes utilitárias |

---

## 4. FUNCIONALIDADES

### 4.1 Landing Page (`/`)

**Objetivo**: Identificar o usuário e redirecionar para o briefing ou área administrativa.

**Fluxo**:
1. Usuário acessa `/` via link ou QR code
2. Visualiza logo, título "Vamos criar sua Landing Page" e formulário
3. Preenche Nome Completo + Últimos 4 dígitos do WhatsApp
4. Clica "Continuar"
5. Sistema busca perfil por `full_name` + `phone_last4` (índice único)
6. Se encontrado: recupera perfil existente
7. Se não encontrado: cria novo perfil automaticamente
8. Redireciona para `/briefing`
9. Footer com link discreto "Área Administrativa" → `/admin` (usa `<Link to="/admin">` do TanStack Router)

**Arquivos envolvidos**: `src/routes/index.tsx`, `src/lib/identification.tsx`

### 4.2 Formulário de Briefing (`/briefing`)

**Objetivo**: Coletar briefing estruturado em 7 etapas com salvamento automático.

**Fluxo**:
1. Verifica se usuário está identificado (se não, redireciona para `/`)
2. Carrega briefing incompleto existente (se houver) — restaura dados, etapa e progresso
3. Usuário navega entre 7 etapas com validação de campos obrigatórios
4. A cada alteração, autosave com debounce de 1.5s para Supabase
5. Ao completar todas as etapas, clica "Enviar briefing"
6. Briefing marcado como `completed: true` + `status: "Novo"`
7. Tela de agradecimento com CTA para novo briefing

**Etapas do formulário**:
1. Sobre você (nome, email, WhatsApp, cargo, como conheceu)
2. Sobre seu negócio (empresa, site, nicho, tempo de mercado, descrição)
3. Seus clientes (público ideal, dores, desejos, objeções)
4. Diferenciais (3 diferenciais, concorrentes, prova social, garantias)
5. Objetivos da Landing Page (objetivo principal, CTA, oferta, seções, integrações)
6. Referências e materiais (sites de referência, estilo visual, cores, upload logo, upload materiais)
7. Informações finais (prazo, investimento, domínio, observações)

**Tipos de campo**: text, email, tel, url, textarea, radio, checkbox, file

**Arquivos envolvidos**: `src/routes/briefing.tsx`, `src/lib/briefing-schema.ts`, `src/lib/identification.tsx`, `src/lib/supabase.ts`

### 4.3 Painel Administrativo (`/admin`)

**Objetivo**: Gerenciar briefings recebidos — visualizar, filtrar, alterar status, excluir.

**Fluxo**:
1. Usuário acessa `/admin`
2. Se não identificado: exibe formulário de login administrativo
3. Preenche Nome + Identificador; validação é feita direto contra `ADMIN_USERS` **sem consultar Supabase**
4. Se autorizado: cria profile manual via `setProfile()` e exibe dashboard
5. Filtros: busca textual por nome do cliente (via `profiles.full_name` com join Supabase), filtro por status
6. Ao clicar em um briefing: exibe detalhes completos (todas as etapas)
7. Ações: alterar status inline via select, excluir briefing com confirmação

**Status disponíveis**: Novo, Em análise, Em produção, Aguardando aprovação, Aprovado, Arquivado

**Arquivos envolvidos**: `src/routes/admin.tsx`, `src/lib/identification.tsx`, `src/lib/supabase.ts`, `src/lib/briefing-schema.ts`

> Nota: A busca por perfil foi alterada de `profile_id` para `profiles.full_name`. A consulta Supabase agora inclui `select("*, profiles(full_name)")` e a tipagem `BriefingRow` possui o campo opcional `profiles?: { full_name: string }`.

### 4.4 Autosave

**Objetivo**: Salvar progresso automaticamente sem intervenção do usuário.

**Fluxo**:
1. A cada alteração no formulário, aguarda 1.5s sem novas alterações (debounce)
2. Após debounce, envia UPSERT para tabela `briefings` no Supabase
3. Se não existe briefing incompleto: cria novo registro
4. Se existe: atualiza `current_step`, `data`, `other`, `updated_at`
5. Indicador visual de salvamento (pulso verde no canto superior direito da barra de progresso)
6. Texto "Salvando..." / "Progresso salvo automaticamente" no rodapé do formulário

**Arquivos envolvidos**: `src/routes/briefing.tsx` (linhas ~74-107)

### 4.5 Recuperação de Progresso

**Objetivo**: Restaurar briefing exatamente de onde o usuário parou.

**Fluxo**:
1. Ao acessar `/briefing`, busca briefing com `completed: false` para o `profile_id`
2. Se encontrado: restaura `stepIndex`, `data` (JSONB), `other` (JSONB) silenciosamente
3. Se não encontrado: inicia briefing vazio
4. Tudo acontece automaticamente — sem perguntas ou mensagens de recuperação

**Arquivos envolvidos**: `src/routes/briefing.tsx` (linhas ~46-72)

### 4.6 Upload de Arquivos

**Objetivo**: Simular upload de logo e materiais para o briefing.

**Estado**: Implementação simulada (apenas metadados nome/tamanho). Integração real com Supabase Storage é pendente.

**Bucket**: `briefing_files` — configurado com políticas públicas.

**Arquivos envolvidos**: `src/routes/briefing.tsx` (componente `FieldInput` tipo `file`)

### 4.7 Exportação para IA

**Objetivo**: Formatar briefing como Markdown para consumo direto por LLMs.

**Componente**: `Summary` em `src/lib/briefing-summary.tsx`
- Botão "Copiar briefing" (navigator.clipboard)
- Botão "Baixar .md" (Blob + download)
- Visualização do Markdown em tela
- Inclui instruções para IA no final do documento

---

## 5. FLUXOS DE NEGÓCIO

### 5.1 Fluxo do Cliente

```
1. Acessa / via link ou QR code
2. Preenche Nome Completo + Últimos 4 dígitos do WhatsApp
3. Clica "Continuar"
4. Perfil é buscado ou criado automaticamente no Supabase
5. Se já tinha briefing incompleto, é restaurado automaticamente (stepIndex, data, other)
6. Preenche etapa 1 (Sobre você)
7. Avança para etapa 2 (Sobre o negócio)
8. ... (autosave com debounce de 1.5s para Supabase a cada alteração)
9. Completa etapa 7 (Informações finais)
10. Clica "Enviar briefing"
11. Briefing marcado como completed = true + status = "Novo"
12. Vê tela de agradecimento com opção de enviar novo briefing
```

### 5.2 Fluxo do Administrador

```
1. Acessa /admin
2. Se não identificado: preenche Nome + Identificador
3. Validação direta contra ADMIN_USERS (sem Supabase)
4. Se autorizado: setProfile() manual + redireciona para dashboard
5. Se não autorizado: mensagem de acesso negado
6. Filtra briefings por status ou busca por nome do cliente
7. Clica em briefing para ver detalhes completos
8. Altera status inline via select (atualiza Supabase)
9. Exclui briefing se necessário (com confirmação)
10. Encaminha briefing para IA (cópia do Markdown)
```

### 5.3 Fluxo de Identificação

```
1. Usuário informa Nome Completo + Últimos 4 dígitos do WhatsApp
2. Sistema busca perfil por full_name + phone_last4 (índice único)
3. Se encontrado: recupera perfil existente
4. Se não encontrado: cria novo perfil (UUID auto-gerado)
5. Profile é armazenado em:
   a. IdentificationProvider (estado React)
   b. localStorage (cache temporário, chave: vnexus.profile.v1)
6. Ao refresh: IdentificationProvider restaura perfil do localStorage
7. Ao acessar /briefing: briefing é carregado por profile_id
```

### 5.4 Fluxo de Autosave

```
1. Usuário altera qualquer campo do formulário
2. Timer de 1.5s é iniciado (debounce)
3. Se nova alteração acontece dentro de 1.5s, timer é reiniciado
4. Após 1.5s sem alterações:
   a. Se briefingId existe: UPDATE na tabela briefings
   b. Se briefingId não existe: INSERT e armazena o novo ID
5. Indicador "Salvando..." é exibido durante a operação
6. Em caso de erro: log no console, sem interrupção para o usuário
```

### 5.5 Fluxo de Recuperação

```
1. Usuário identificado acessa /briefing
2. Sistema busca: SELECT * FROM briefings WHERE profile_id = ? AND completed = false
3. Se encontrado: restaura stepIndex, data, other silenciosamente
4. Se não encontrado: inicia briefing vazio (stepIndex = 0, data = {}, other = {})
5. Usuário continua exatamente de onde parou, sem perceber a recuperação
```

### 5.6 Fluxo de Submissão

```
1. Usuário na última etapa clica "Enviar briefing"
2. Sistema salva dados finais no Supabase com completed = true, status = "Novo"
3. Tela de agradecimento é exibida
4. Usuário pode clicar "Enviar outro briefing" para reiniciar
5. Botão "Voltar ao início" redireciona para /
```

---

## 6. BANCO DE DADOS

### 6.1 Tabela `profiles`

| Coluna | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | NOT NULL |
| `full_name` | TEXT | Nome completo do usuário | NOT NULL |
| `phone_last4` | TEXT | Últimos 4 dígitos do WhatsApp | NOT NULL |
| `created_at` | TIMESTAMPTZ | Auto | NOT NULL, default `now()` |
| `updated_at` | TIMESTAMPTZ | Auto | NOT NULL, default `now()` |

**Índices**:
- `idx_profiles_full_name_phone_last4`: UNIQUE INDEX on `(full_name, phone_last4)`

### 6.2 Tabela `briefings`

| Coluna | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | NOT NULL |
| `profile_id` | UUID | FK → profiles(id) | NULLABLE |
| `created_at` | TIMESTAMPTZ | Auto | NOT NULL, default `now()` |
| `updated_at` | TIMESTAMPTZ | Auto | NOT NULL, default `now()` |
| `current_step` | INTEGER | Etapa atual do formulário (0-6) | — |
| `completed` | BOOLEAN | Se foi finalizado | default `false` |
| `status` | TEXT | Status administrativo | default `'Novo'` |
| `data` | JSONB | Respostas do formulário | — |
| `other` | JSONB | Valores "Outro" dos campos radio | — |

**Relacionamentos**:
- `briefings.profile_id` → `profiles.id` (FK simples, sem CASCADE definido)

### 6.3 Bucket `briefing_files`

| Configuração | Valor |
|---|---|
| **Nome** | `briefing_files` |
| **Público** | `true` |
| **Política SELECT** | Pública |
| **Política INSERT** | Pública |
| **Política UPDATE** | Pública |
| **Política DELETE** | Pública |

### 6.4 Segurança

- RLS (Row Level Security): **desabilitado** em ambas as tabelas (fix aplicado via migration `disable_rls_profiles` em 23/06/2026)
- Função `is_admin()`: **removida**
- Trigger `on_auth_user_created`: **removido**
- Storage: políticas públicas para operações CRUD

> Justificativa: O sistema utiliza identificação simplificada (Nome + WhatsApp), não autenticação forte. RLS e triggers do Supabase Auth foram removidos junto com OAuth.
>
> ⚠️ Nota: RLS estava ativado na tabela `profiles` sem NENHUMA policy definida, o que bloqueava INSERTs do role `anon` mesmo com `GRANT ALL`. A migration `disable_rls_profiles` desabilitou RLS na tabela, resolvendo o erro "new row violates row-level security policy".

---

## 7. CONFIGURAÇÕES

### 7.1 Variáveis de Ambiente

| Variável | Obrigatória | Finalidade |
|---|---|---|
| `VITE_SUPABASE_URL` | Sim | URL do projeto Supabase (`https://fwaiaxfbyuvjqelvuivz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave anônima do Supabase |

Carregadas do arquivo `.env` (gitignorado). Expostas via prefixo `VITE_` no Vite.

### 7.2 Configurações do Supabase (Dashboard)

Nenhuma configuração especial necessária no dashboard — OAuth foi removido. Apenas o projeto Postgres + Storage são utilizados.

### 7.3 Configurações do Vite

| Opção | Valor |
|---|---|
| `envPrefix` | `"VITE_"` |
| Plugins | `@tanstack/react-start`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths` |
| Type | Rolldown (Vite 8) |

### 7.4 Configurações do TanStack

| Configuração | Local | Valor |
|---|---|---|
| `strict` | `tsconfig.json` | `true` |
| Router context | `src/router.tsx` | `{ queryClient }` |
| Scroll restoration | `src/router.tsx` | `true` |
| Default preload stale time | `src/router.tsx` | `0` |

### 7.5 Administradores

Configurados em `src/routes/admin.tsx`:

```typescript
const ADMIN_USERS = [
  { full_name: "Admin VNEXUS", phone_last4: "{0203}" },
];
```

Para adicionar: editar a constante e rebuildar.

### 7.6 Cache localStorage

| Chave | Finalidade |
|---|---|
| `vnexus.profile.v1` | Cache temporário do profile ID (evita re-identificação a cada refresh) |

> O localStorage é **cache temporário** apenas. A fonte da verdade é o Supabase.

---

## 8. IDENTIDADE VISUAL

### 8.1 Paleta de Cores

| Variável | Nome | Valor | Uso |
|---|---|---|---|
| `--nexus` | Azul Nexus | `oklch(0.255 0.085 264)` | #0A1F44 — Secundário |
| `--quantum` | Azul Quântico | `oklch(0.55 0.245 264)` | #0F4CFF — Primário |
| `--prestige` | Dourado Prestige | `oklch(0.755 0.13 86)` | #D4AF37 — Accent/destaque |
| `--graphite` | Grafite Deep | `oklch(0.205 0.025 264)` | #121826 — Background |
| `--tech` | Branco Tech | `oklch(0.985 0.005 240)` | #F8FAFC — Foreground/texto |

### 8.2 Tema

- **Modo escuro exclusivo** — sem suporte a light mode
- Background: gradiente radial com azul quântico e dourado sutis

### 8.3 Tipografia

| Propriedade | Valor |
|---|---|
| **Fonte principal** | Montserrat (Google Fonts) |
| **Fallback** | `ui-sans-serif, system-ui, sans-serif` |
| **Pesos** | 300, 400, 500, 600, 700, 800, 900 |
| **Variável CSS** | `--font-sans` |

### 8.4 Gradientes

| Classe | Definição |
|---|---|
| `bg-gradient-brand` | `linear-gradient(135deg, --nexus, --quantum)` |
| `bg-gradient-gold` | `linear-gradient(135deg, --prestige, oklch(0.85 0.15 86))` |
| `bg-gradient-surface` | `linear-gradient(160deg, --graphite, oklch(0.255 0.04 264))` |
| `text-gradient-gold` | `bg-gradient-gold` com `background-clip: text` |

### 8.5 Sombras

| Classe | Definição |
|---|---|
| `shadow-glow` | `0 20px 60px -20px oklch(0.55 0.245 264 / 0.45)` |
| `shadow-gold` | `0 10px 40px -10px oklch(0.755 0.13 86 / 0.4)` |

### 8.6 Bordas arredondadas

| Variável | Valor |
|---|---|
| `--radius` | `0.875rem` (padrão) |
| Aplicado via classes `rounded-*` do Tailwind |

### 8.7 Padrões de componentes

- **Inputs**: border sutil, bg semi-transparente, foco com ring primary
- **Botões**: gradient-brand (primário), gradient-gold (destaque), outline (secundário)
- **Cards**: gradient-surface com shadow-glow e border semi-transparente
- **Badges de status**: cores específicas por estado (azul, amarelo, roxo, laranja, verde, cinza)

---

## 9. DECISÕES ARQUITETURAIS

### 9.1 TanStack Start (SSR)

| Campo | Detalhe |
|---|---|
| **Decisão** | Adotar TanStack Start como meta-framework React |
| **Motivo** | SSR nativo, file-based routing com tipos fortes, integração com TanStack Query |
| **Impacto** | SEO melhorado, carregamento inicial mais rápido, tipagem de rotas |
| **Alternativa** | Next.js, Remix |

### 9.2 Supabase como Backend

| Campo | Detalhe |
|---|---|
| **Decisão** | Utilizar Supabase (Postgres + Storage) |
| **Motivo** | Backend completo sem gerenciar servidor; escalabilidade zero-config |
| **Impacto** | Sem custo de infraestrutura; dependência de terceiros |
| **Alternativa** | Firebase, backend próprio (Node.js) |

### 9.3 Postgres com JSONB para Briefings

| Campo | Detalhe |
|---|---|
| **Decisão** | Armazenar respostas do formulário como JSONB |
| **Motivo** | Flexibilidade para schema que evolui rápido sem migrations |
| **Impacto** | Consultas complexas limitadas; simplicidade de manutenção |
| **Alternativa** | Tabela normalizada (field → value) |

### 9.4 Identificação Simplificada (Nome + WhatsApp)

| Campo | Detalhe |
|---|---|
| **Decisão** | Substituir Google OAuth + Supabase Auth por Nome Completo + últimos 4 dígitos do WhatsApp |
| **Motivo** | Reduzir atrito de entrada; briefing não requer autenticação forte |
| **Impacto** | Menor segurança; maior conversão; simplicidade total |
| **Benefícios** | Sem redirect OAuth, sem gerenciamento de sessão, sem callback, sem refresh token |
| **Alternativa anterior** | Google OAuth via Supabase Auth (removido em 23/06/2026) |

### 9.5 Autosave com Debounce (1.5s)

| Campo | Detalhe |
|---|---|
| **Decisão** | Salvar automaticamente após 1.5s sem alterações |
| **Motivo** | Balance entre responsividade e número de requisições |
| **Impacto** | Perda máxima de 1.5s de trabalho em caso de falha |
| **Alternativa** | Salvamento a cada campo (muitas req), salvamento manual (risco de perda) |

### 9.6 Estado Manual (useState)

| Campo | Detalhe |
|---|---|
| **Decisão** | Gerenciar estado do formulário com useState |
| **Motivo** | Simplicidade; React Hook Form + Zod estão instalados mas não utilizados |
| **Impacto** | Sem validação avançada; sem tipagem de formulário |
| **Alternativa** | React Hook Form + Zod (instalado, pendente de migração) |

### 9.7 Tema Dark Exclusivo

| Campo | Detalhe |
|---|---|
| **Decisão** | Apenas modo escuro |
| **Motivo** | Identidade visual da VNEXUS TEC |
| **Impacto** | Exclui usuários que preferem light mode |
| **Alternativa** | Modo claro + escuro via `@custom-variant dark` (já configurável) |

### 9.8 Saída Markdown para IA

| Campo | Detalhe |
|---|---|
| **Decisão** | Formatar briefing como Markdown para consumo direto por LLMs |
| **Motivo** | Facilitar uso do briefing por IAs (GPT, Claude) para criar Landing Pages |
| **Impacto** | Formato universal, legível e processável |

### 9.9 Logo SVG Local

| Campo | Detalhe |
|---|---|
| **Decisão** | Substituir asset do Lovable CDN por SVG local |
| **Motivo** | Independência de CDN de terceiros |
| **Impacto** | Build sem requisição externa |

### 9.10 Admin via Constante no Código

| Campo | Detalhe |
|---|---|
| **Decisão** | Configurar administradores via constante `ADMIN_USERS` em `src/routes/admin.tsx` |
| **Motivo** | Simplicidade máxima; sem depender de Auth provider ou role no banco |
| **Impacto** | Requer rebuild para adicionar/remover admins |
| **Alternativa anterior** | Role no banco (`UPDATE profiles SET role='admin'`) |

### 9.11 Vite Config Manual

| Campo | Detalhe |
|---|---|
| **Decisão** | Substituir `@lovable.dev/vite-tanstack-config` por plugins padrão |
| **Motivo** | Independência de plugin proprietário; controle total da config |
| **Impacto** | Config explícita e compreensível |

---

## 10. HISTÓRICO COMPLETO DO PROJETO

### Timeline

| Data | Mudança | Motivo |
|---|---|---|
| ~17/06/2026 | Projeto gerado via Lovable.dev (template `tanstack_start_ts`) | Início do MVP |
| 22/06/2026 | Remoção da dependência Lovable | Independência de plataforma; `@lovable.dev/vite-tanstack-config` substituído por Vite manual |
| 22/06/2026 | Substituição do logo (PNG CDN → SVG local) | Independência de CDN |
| 22/06/2026 | Integração Supabase (Auth, Postgres, Storage) | Backend real substituindo localStorage |
| 22/06/2026 | Criação da rota `/briefing` com autosave | Formulário multi-etapas com persistência |
| 22/06/2026 | Correção do fluxo OAuth (projeto Supabase errado, callback ausente) | Login Google quebrado |
| 22/06/2026 | Criação do painel administrativo `/admin` | Gestão de briefings |
| 23/06/2026 | **Refatoração completa do sistema de acesso** | **Remoção do Google OAuth + Supabase Auth; substituição por identificação simplificada (Nome + WhatsApp)** |
| 23/06/2026 | Recriação da tabela `profiles` (independente de auth.users) | Nova arquitetura de identificação |
| 23/06/2026 | Remoção de RLS e triggers do Supabase Auth | Sistema não requer autenticação forte |
| 23/06/2026 | Migração de `user_id` para `profile_id` nas briefings | Alinhamento com nova tabela profiles |
| 23/06/2026 | Consolidação da documentação em `PROJECT_MASTER_CONTEXT.md` | Unificar fonte de verdade |
| 23/06/2026 | Correção de permissões: `GRANT ALL ON public.profiles TO anon` | CREATE TABLE perde grants da role anon; INSERT retornava 401 |
| 23/06/2026 | Alteração das credenciais admin para `{0203}` | Solicitação do usuário |
| 23/06/2026 | Remoção de `inputMode="numeric"` e validação de dígitos no campo identificador | Permitir caracteres especiais como `{` e `}` |
| 23/06/2026 | Adicionado "Limpar cache" e `clearIdentification()` no login admin | Stale profile no localStorage impedia login |
| 23/06/2026 | Melhoria no tratamento de erros do `identify()` | Adicionado `console.error` nos blocos catch |
| 23/06/2026 | Correção completa do fluxo de identificação e redirecionamento | Reset da sessão de correção |
| 23/06/2026 | Admin bypass do Supabase: validação direta em `ADMIN_USERS` sem `identify()` | Login admin falhava se INSERT no Supabase retornasse erro |
| 23/06/2026 | `index.tsx`: busca qualquer briefing (sem filtrar `completed`) antes de criar novo | Novo briefing era criado mesmo para usuário com briefing concluído |
| 23/06/2026 | `identification.tsx`: exposto `setProfile` no context | Admin precisava definir profile manualmente sem Supabase |
| 23/06/2026 | `supabase.ts`: `import createClient` movido para o topo | Import no final do arquivo podia causar erros em build |
| 23/06/2026 | RLS desabilitado na tabela `profiles` via migration `disable_rls_profiles` | RLS estava ativado sem policies — bloqueava INSERT do role `anon` mesmo com `GRANT ALL` |
| 23/06/2026 | Correção: erros de formatação prettier em `index.tsx` e `admin.tsx` | ESLint apontava 9 erros de formatação que foram corrigidos com `prettier --write` |
| 23/06/2026 | Regeneração forçada da route tree (`routeTree.gen.ts`) | Cache do Vite removido + arquivo deletado e regenerado pelo plugin do TanStack Router para garantir que a rota `/admin` fosse reconhecida |
| 23/06/2026 | Correção visual do campo de busca no painel admin | Fundo escuro semi-transparente (`bg-white/5`), texto branco, placeholder visível, foco com ring azul quântico |
| 23/06/2026 | Busca admin alterada de `profile_id` para `profiles.full_name` | Join Supabase `briefings -> profiles(full_name)`, tipagem atualizada, busca por nome do cliente |
| 23/06/2026 | Nome do cliente exibido como identificador principal na listagem | UUID movido para texto secundário abaixo do nome; avatar usa inicial do nome |
| 23/06/2026 | Correção de acessibilidade nos inputs de formulário (admin.tsx e index.tsx) | Chrome bloqueava acesso ao /admin devido a warnings "form field should have an id or name attribute" e "No label associated with a form field". Adicionados `id`, `name` e `htmlFor` nos 4 inputs de login admin e landing page. |
| 23/06/2026 | Substituição da logo SVG por WebP | Todos os imports de `vnexus-logo.svg` trocados para `vnexus-logo.webp` em 4 arquivos. O SVG permanece em disco mas não é mais importado. |
| 23/06/2026 | Correção de segurança: placeholders do login admin não expõem mais credenciais | `placeholder="Admin VNEXUS"` → `"Digite seu nome"` e `placeholder="{0203}"` → `"Digite seu identificador"` em `admin.tsx`. Credenciais reais não são mais visíveis na interface. |
| 23/06/2026 | Redimensionamento da logo em todas as páginas | Logo aumentada de tamanhos variados (`h-10`, `h-16`, `h-20`, `h-24`) para largura padronizada `w-44` (~176px) com `h-auto object-contain` e `draggable={false}` em todas as 7 ocorrências nos 4 arquivos. |

---

## 11. PENDÊNCIAS

### 11.1 Alta Prioridade

- [ ] Upload real de arquivos para Supabase Storage (logo + materiais)
- [ ] Adicionar sanitização de saída contra XSS
- [ ] Criar testes automatizados (Vitest + Playwright)
- [ ] Proteger rota /admin com middleware server-side

### 11.2 Média Prioridade

- [ ] Notificar admin sobre novos briefings (e-mail/WhatsApp)
- [ ] Confirmar recebimento ao cliente (e-mail automático)
- [ ] Remover dependências não utilizadas: Recharts, Carousel, Vaul, Sonner, react-day-picker, react-hook-form, zod
- [ ] Migrar formulário para React Hook Form + Zod
- [ ] Adicionar loading skeleton no /briefing e /admin

### 11.3 Baixa Prioridade

- [ ] Página institucional da VNEXUS TEC
- [ ] Política de privacidade e termos de uso
- [ ] Modo claro (light mode)
- [ ] Internacionalização (i18n)
- [ ] CI/CD automatizado
- [ ] Página de perfil do usuário (/perfil)

---

## 12. PROBLEMAS CONHECIDOS

### 12.1 Bugs

- ~~Navegação para `/admin` não funcionava — link congelava sem resposta.~~ (Corrigido em 23/06/2026 — causa: cache desatualizado do Vite/router. Solução: limpeza de cache + regeneração da route tree.)
- ~~Campo de busca no admin com fundo branco e texto branco — conteúdo invisível.~~ (Corrigido em 23/06/2026 — aplicado estilo dark `bg-white/5 text-white placeholder:text-white/40`.)
- ~~Busca no admin baseada em `profile_id` (UUID) — inviável para uso administrativo.~~ (Corrigido em 23/06/2026 — substituído por busca em `profiles.full_name` com join Supabase.)
- ~~Chrome bloqueando acesso ao /admin devido a warnings de acessibilidade (inputs sem `id`/`name`/`htmlFor`).~~ (Corrigido em 23/06/2026 — adicionados `id`, `name` e `htmlFor` nos 4 inputs de formulário em admin.tsx e index.tsx.)

### 12.2 Limitações

- **Sem autenticação forte**: Qualquer pessoa que saiba Nome + WhatsApp de outro usuário pode acessar o briefing dele. Isto é uma escolha deliberada de design (simplicidade > segurança para este contexto).
- **Admin depende de rebuild**: A lista `ADMIN_USERS` é hardcoded — requer rebuild do projeto para adicionar/remover administradores.
- **Permissões de tabela**: Ao recriar tabelas via migration, as grants para a role `anon` podem ser perdidas — necessário reaplicar `GRANT ALL ON public.profiles TO anon`. (Atualmente OK — verificado em 23/06/2026.)
- **Busca no admin limitada**: A busca no painel administrativo busca por nome do cliente via `profiles.full_name` (não por telefone). UUID do perfil é exibido como texto secundário.
- **Storage público**: O bucket `briefing_files` tem políticas públicas — qualquer pessoa pode listar/excluir arquivos.

### 12.3 Riscos Técnicos

- **Dependência do Supabase**: Se o Supabase ficar indisponível, todo o sistema para.
- **Perda de dados localStorage**: Se o usuário limpar o cache do navegador, precisará se reidentificar.
- **UUID vs nome único**: O índice único em `(full_name, phone_last4)` pode gerar conflito se dois usuários diferentes tiverem exatamente o mesmo nome e os mesmos 4 dígitos.

### 12.4 Débitos Técnicos

- **Código não testado**: Não existem testes automatizados (0% de cobertura).
- **Dependências não utilizadas**: React Hook Form, Zod, Recharts, Carousel, Vaul, Sonner, react-day-picker — instalados mas não usados.
- **Estado manual**: O formulário usa `useState` em vez de React Hook Form + Zod (instalados mas não configurados).
- **Sem sanitização XSS**: Dados renderizados sem sanitização.
- **Código legado**: `briefing-summary.tsx` mantém funções legado de `localStorage` como fallback.

---

## 13. MEMÓRIA PERMANENTE DO PROJETO

> Esta seção deve ser atualizada a cada alteração futura. Reflete o estado atual do sistema e serve como contexto para futuras IAs.

### Estado Atual (23/06/2026)

- **Sistema de acesso**: Identificação por Nome Completo + últimos 4 dígitos do WhatsApp
- **Autenticação**: Nenhuma — OAuth removido
- **Backend**: Supabase Postgres + Storage
- **Tabelas**: `profiles` (nova estrutura independente) e `briefings`
- **Admin**: Configurado via constante `ADMIN_USERS` em `src/routes/admin.tsx` (`Admin VNEXUS` / `{0203}`)
- **Admin login**: Bypass total do Supabase — validação direta contra `ADMIN_USERS`, profile criado via `setProfile()` manual
- **Identificador admin**: Aceita qualquer caractere (incluindo `{` e `}`)
- **Client flow**: `index.tsx` busca ANY briefing (sem filtrar `completed`) antes de decidir criar novo
- **identification.tsx**: Expõe `setProfile()` para definição manual de profile (usado pelo admin)
- **supabase.ts**: `import createClient` movido para o topo do arquivo
- **Build**: ✅ TypeScript sem erros, ✅ Build completo, ✅ Sem referências OAuth
- **Documentação**: Consolidada em `PROJECT_MASTER_CONTEXT.md`
- **Busca admin**: Baseada em `profiles.full_name` via join Supabase `select("*, profiles(full_name)")` — UUID exibido como texto secundário
- **Campo de busca admin**: Estilo dark `bg-white/5 text-white placeholder:text-white/40` com `border-white/10`
- **Tipagem**: `BriefingRow.profiles?.full_name` disponível para acesso ao nome do cliente
- **Permissões Supabase**: Grants da role `anon` confirmadas OK para `profiles` e `briefings`; RLS desabilitado em ambas as tabelas (migration `disable_rls_profiles`)

### Últimas Mudanças (23/06/2026)

- Refatoração completa do sistema de acesso: Google OAuth → identificação simplificada
- Recriação da tabela `profiles`: agora independente, com `full_name` + `phone_last4`
- Migração de `user_id` para `profile_id` nas briefings
- Remoção de RLS, triggers, `is_admin()`, e todo código relacionado a auth
- Criação de `src/lib/identification.tsx`
- Remoção de `src/lib/auth.tsx` e `src/routes/auth.callback.tsx`
- Consolidação da documentação
- Correção de permissões: `GRANT ALL ON public.profiles TO anon` via migration
- Alteração das credenciais admin para `{0203}`
- Remoção de restrições de input no campo identificador (aceita `{` e `}`)
- Adicionado "Limpar cache" e `clearIdentification()` no login admin
- Melhoria no tratamento de erros do `identify()` com logs no console
- **Admin bypass**: login admin agora valida direto em `ADMIN_USERS` sem chamar `identify()` (Supabase)
- **`identification.tsx`**: exposto `setProfile()` para definição manual de profile
- **`index.tsx`**: busca qualquer briefing (sem filtrar `completed`) antes de criar novo — evita duplicidade para usuários com briefing concluído
- **`supabase.ts`**: `import createClient` movido para o topo do arquivo
- **RLS**: Desabilitado RLS na tabela `profiles` via migration `disable_rls_profiles` — RLS ativado sem policies bloqueava INSERTs do role `anon`
- **Correção navegação `/admin`**: Link "Área Administrativa" em `index.tsx` já usava `<Link to="/admin">` (correto). Erros de formatação prettier (9 erros) corrigidos em `index.tsx` e `admin.tsx`. Cache do Vite limpo e `routeTree.gen.ts` regenerado para garantir reconhecimento da rota.
- **Correção visual campo de busca admin**: Input de busca no painel alterado para `bg-white/5 text-white placeholder:text-white/40` com `border-white/10` e ring focus azul quântico — fundo branco invisível eliminado.
- **Busca admin por nome do cliente**: Consulta Supabase alterada de `select("*")` para `select("*, profiles(full_name)")`. Filtro agora usa `b.profiles?.full_name?.toLowerCase()`. Placeholder alterado para "Buscar por nome do cliente…".
- **Tipagem `BriefingRow` atualizada**: Adicionado campo opcional `profiles?: { full_name: string }` para refletir o join com a tabela `profiles`.
- **Nome do cliente como identificador principal**: Na listagem, avatar mostra inicial do nome, texto principal exibe `profiles.full_name`, e UUID `profile_id` é exibido como texto secundário menor.
- **Correção de acessibilidade nos inputs**: Adicionados atributos `id`, `name` e `htmlFor` nos 4 inputs de formulário (admin login: Nome + Identificador; landing page: Nome Completo + WhatsApp) para resolver warnings do Chrome que bloqueavam o acesso ao /admin.
- **Logo SVG → WebP**: Todos os 4 imports de `vnexus-logo.svg` substituídos por `vnexus-logo.webp` (`index.tsx`, `admin.tsx`, `briefing.tsx`, `briefing-summary.tsx`). O SVG permanece em disco. Nenhuma classe ou dimensão alterada.
- **Segurança: placeholders do login admin sanitizados**: `placeholder="Admin VNEXUS"` removido (substituído por `"Digite seu nome"`) e `placeholder="{0203}"` removido (substituído por `"Digite seu identificador"`) em `admin.tsx` — as credenciais reais não ficam mais expostas visualmente na interface de login.
- **Redimensionamento da logo**: Todas as 7 ocorrências da logo nos 4 arquivos (`index.tsx`, `admin.tsx`, `briefing.tsx`, `briefing-summary.tsx`) tiveram suas classes Tailwind alteradas de altura fixa (`h-10`, `h-16`, `h-20`, `h-24`) para largura padronizada `w-44 h-auto object-contain` com `draggable={false}`.

### Instruções para Próximas Intervenções

1. **Sempre ler este arquivo primeiro** — ele contém todo o contexto do projeto.
2. **Sempre atualizar este arquivo** após qualquer alteração — manter a seção 13 (Memória Permanente) e o histórico na seção 10.
3. **Não criar novos arquivos de documentação (.md)** — toda documentação deve ficar neste arquivo.
4. **Seguir as convenções** listadas na seção de identidade visual e na `AGENTS.md`.
5. **Admin login não usa Supabase**: a validação é feita direto em `ADMIN_USERS` no código. Se precisar alterar credenciais admin, edite a constante em `src/routes/admin.tsx`.
6. **`identification.tsx` expõe `setProfile()`**: pode ser usado para definir profile manualmente sem passar pelo Supabase (usado pelo admin).

---

## 14. AJUDA — GUIA DE USO DO SISTEMA

### 14.1 Acessar e Preencher um Briefing

1. Abra o link do sistema (ex: `https://form.vnexustec.com.br`)
2. Na landing page, preencha **Nome Completo** e **Últimos 4 dígitos do WhatsApp**
3. Clique em **"Continuar"**
4. O sistema identifica ou cadastra automaticamente o perfil
5. Você é redirecionado ao formulário de briefing (7 etapas)
6. Preencha cada etapa e clique **"Avançar"** para prosseguir
7. Na última etapa, clique **"Enviar briefing"** para finalizar
8. Pronto! Nossa equipe receberá suas respostas

> Se você parar no meio do formulário, pode fechar a página. Ao acessar novamente, o sistema restaura exatamente de onde parou.

### 14.2 Salvamento Automático

- As respostas são salvas automaticamente no banco de dados após 1,5s sem alterações
- Um indicador verde pulsante aparece no canto superior da barra de progresso durante o salvamento
- O rodapé exibe "Salvando..." ou "Progresso salvo automaticamente"
- Você pode fechar o navegador a qualquer momento que o progresso estará seguro

### 14.3 Acessar o Painel Administrativo

1. Na landing page, clique em **"Área Administrativa"** no rodapé (ou acesse `/admin` diretamente)
2. Preencha **Nome Completo** (`Admin VNEXUS`) e **Identificador** (`{0203}`)
3. Clique em **"Acessar painel"**
4. No painel você pode:
   - Ver todos os briefings recebidos (ordenados por data)
   - Filtrar briefings por status
   - Buscar por ID do perfil
   - Clicar em um briefing para ver todos os detalhes
   - Alterar status do briefing (ex: "Novo" → "Em análise")
   - Excluir briefings (com confirmação)
   - Encaminhar o briefing para IA (cópia em Markdown)

> Caso o login admin falhe, use o botão **"Limpar cache"** e tente novamente.

### 14.4 Briefing já Concluído

Se você já enviou um briefing e tenta acessar `/briefing` novamente:
- O sistema exibe a mensagem **"Você já concluiu este briefing"**
- Você pode clicar em **"Preencher novo briefing"** para reiniciar
- Ou clicar em **"Voltar ao início"**

### 14.5 Problemas Comuns

| Problema | Solução |
|---|---|
| Tela de erro ao identificar | Verifique se o Supabase está online. O erro é registrado no console (`[IDENTIFY]`). |
| "Credenciais administrativas inválidas" | Confira se digitou exatamente `Admin VNEXUS` e `{0203}` (com chaves). Use "Limpar cache" se necessário. |
| Briefing não carrega | Verifique se você passou pela identificação primeiro (acesse `/` e clique "Continuar"). |
| Autosave não funciona | Verifique sua conexão de internet. O sistema tenta salvar mesmo em caso de falha (sem interromper o usuário). |
| Perdeu o progresso | O briefing é recuperado automaticamente ao acessar `/briefing` novamente — desde que não tenha sido concluído. |

### 14.6 Limpar Cache Local

Se houver problemas com identificação (especialmente no admin):
1. Clique em **"Limpar cache"** no formulário de login admin
2. Ou limpe manualmente o `localStorage` do navegador para o site
3. A chave armazenada é `vnexus.profile.v1`

---

## 15. CHECKLIST DE SAÚDE DO PROJETO

### Build

| Item | Status |
|---|---|
| `npx tsc --noEmit` | ✅ Sem erros |
| `npm run build` | ✅ Completo |
| `npm run lint` | ✅ Sem erros |

### TypeScript

| Item | Status |
|---|---|
| Strict mode | ✅ `true` |
| Sem `any` | ✅ |
| Tipos de rota | ✅ Auto-gerados |

### Dependências

| Item | Status |
|---|---|
| `@supabase/supabase-js` | ✅ Instalado |
| `@tanstack/react-*` | ✅ Instalados |
| `@radix-ui/*` | ✅ Instalados |
| Dependências não utilizadas | ⚠️ Recharts, Carousel, Vaul, Sonner, react-day-picker, react-hook-form, zod |

### Banco

| Item | Status |
|---|---|
| Tabela `profiles` | ✅ Criada com nova estrutura |
| Tabela `briefings` | ✅ Atualizada com `profile_id` |
| Índice único `(full_name, phone_last4)` | ✅ Criado |
| RLS | ❌ Desabilitado (intencional) — migration `disable_rls_profiles` |
| Trigger auth | ❌ Removido |

### Storage

| Item | Status |
|---|---|
| Bucket `briefing_files` | ✅ Criado |
| Políticas públicas | ✅ Configuradas |
| Upload real | ❌ Pendente (apenas simulado) |

### Rotas

| Item | Status |
|---|---|
| `/` — Landing page | ✅ Formulário de identificação |
| `/briefing` — Formulário | ✅ Autosave + recuperação |
| `/admin` — Painel | ✅ ADMIN_USERS |
| Rota OAuth | ❌ Removida |

### Admin

| Item | Status |
|---|---|
| `ADMIN_USERS` configurado | ✅ (`Admin VNEXUS` / `{0203}`) |
| Login bypass do Supabase | ✅ Validação direta em ADMIN_USERS |
| Lista de briefings | ✅ Do Supabase com join `profiles(full_name)` |
| Busca por nome do cliente | ✅ `profiles.full_name` |
| Exibição do nome do cliente | ✅ Nome como principal, UUID como secundário |
| Filtro por status | ✅ |
| Mudança de status inline | ✅ |
| Exclusão | ✅ |
| Detalhes do briefing | ✅ |
| Campo de busca com tema dark | ✅ `bg-white/5 text-white placeholder:text-white/40` |

### Briefing

| Item | Status |
|---|---|
| 7 etapas | ✅ |
| Autosave debounce 1.5s | ✅ |
| Recuperação automática | ✅ |
| Validação campos obrigatórios | ✅ |
| Upload simulado | ✅ |
| Submissão | ✅ |
| Tela de agradecimento | ✅ |
| Briefing concluído detectado | ✅ Tela "Você já concluiu" + opção novo briefing |

### Documentação

| Item | Status |
|---|---|
| `PROJECT_MASTER_CONTEXT.md` | ✅ Única fonte de verdade |
| `AGENTS.md` | ✅ Mantido (convenções para IAs) |
| `src/routes/README.md` | ✅ Mantido (convenções de roteamento) |
| `AUDIT_INICIAL.md` | ❌ Removido (conteúdo consolidado aqui) |
| `PROJECT_CONTEXT.md` | ❌ Removido (conteúdo consolidado aqui) |
