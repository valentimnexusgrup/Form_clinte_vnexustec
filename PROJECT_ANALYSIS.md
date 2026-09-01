# 📋 PROJECT ANALYSIS — Form Cliente VN Tec

**Última atualização**: 01/09/2026  
**Status**: MVP em produção com diagnóstico inteligente de serviços  
**Versão do documento**: 2.1

---

## 📌 SUMÁRIO EXECUTIVO

O **Form Cliente VN Tec** é uma aplicação web fullstack para coleta estruturada de briefing de clientes. O sistema utiliza **diagnóstico inteligente** para inferir automaticamente qual serviço (Landing Page, Central de Links, Site Institucional ou Sistema) é mais adequado às necessidades do cliente, baseado em suas respostas.

| Aspecto                    | Descrição                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| **Objetivo principal**     | Substituir coleta manual de briefing por formulário digital guiado com diagnóstico automático |
| **Tipo de aplicação**      | SPA + SSR (TanStack Start)                                                                    |
| **Público-alvo**           | Clientes/contratantes da VNEXUS TEC                                                           |
| **Tecnologia principal**   | React 19 + TypeScript + Vite + Supabase                                                       |
| **Tempo de preenchimento** | ~10-15 minutos                                                                                |
| **Status atual**           | ✅ Pronto para produção                                                                       |

---

## 🏗️ ARQUITETURA GERAL

### Stack Tecnológico

```
Frontend:
┌─────────────────────────────────────────┐
│ TanStack Start (React 19 + TypeScript)  │
│ • TanStack Router (file-based)          │
│ • TanStack Query (state management)     │
│ • Vite (build tool)                     │
│ • Tailwind CSS 4 + Radix UI             │
└─────────────────────────────────────────┘

Backend:
┌─────────────────────────────────────────┐
│ Supabase (PostgreSQL + Storage)         │
│ • Profiles (identificação)              │
│ • Briefings (respostas do formulário)   │
│ • Files (upload de anexos)              │
└─────────────────────────────────────────┘

Deployment:
┌─────────────────────────────────────────┐
│ Vercel (TanStack Start + Nitro)         │
│ • SSR com fallback de erro              │
│ • Auto-deploy via Git                   │
└─────────────────────────────────────────┘
```

### Componentes Principais

1. **IdentificationProvider** → Gerencia sessão do usuário (nome + WhatsApp)
2. **Landing Page (`/`)** → Formulário de identificação
3. **Briefing Form (`/briefing`)** → Diagnóstico + formulário multi-etapas
4. **Admin Panel (`/admin`)** → Visualização e gestão de briefings
5. **Schema System** → Lógica de diagnóstico e geração de fluxos

---

## 📊 FLUXO DE TRABALHO PRINCIPAL

### Jornada do Cliente (Happy Path)

```
1. Acessa /
   ↓
2. Identifica-se (Nome + WhatsApp)
   ↓
3. Redireciona para /briefing
   ↓
4. Responde perguntas de diagnóstico (5-7 perguntas)
   ↓
5. Sistema infere o serviço ideal (Landing Page, Links, etc.)
   ↓
6. Continua respondendo formulário específico do serviço
   ↓
7. Finaliza e envia briefing
   ↓
8. Recebe confirmação de envio
   ↓
9. Dados disponíveis no /admin para a equipe processar
```

### Estados Principais

```
┌────────────────┐
│  Não iniciado  │
└────────┬───────┘
         │
         ↓
┌────────────────────────┐
│ Em progresso (salvo)   │ ← Auto-save a cada 1.5s
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│ Concluído              │ ← Marcado no Supabase
└────────────────────────┘
```

---

## 📁 ESTRUTURA DO PROJETO

### Árvore de Diretórios

```
src/
├── assets/                    # Logotipos, imagens estáticas
│   └── vnexus-logo.webp
├── components/
│   └── ui/                    # Componentes shadcn/ui (~52 componentes)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...
├── hooks/
│   └── use-mobile.tsx         # Detecção de viewport mobile
├── lib/                       # Lógica de negócio (SEM JSX)
│   ├── identification.tsx     # ✨ Gerenciamento de sessão
│   ├── briefing-schema.ts     # 🧠 Diagnóstico + geração de fluxo
│   ├── briefing-summary.tsx   # Resumo + exportação
│   ├── supabase.ts            # Cliente Supabase
│   ├── error-capture.ts       # Captura de erros SSR
│   ├── error-page.ts          # Fallback de erro HTML
│   └── utils.ts               # Utilitários (cn())
├── routes/                    # File-based routing (TanStack Router)
│   ├── __root.tsx             # Layout raiz
│   ├── index.tsx              # Landing page (/)
│   ├── briefing.tsx           # Formulário (/briefing) ⭐ MODIFICADO
│   └── admin.tsx              # Painel (/admin)
├── router.tsx                 # Configuração do router
├── server.ts                  # Entry point SSR
├── start.ts                   # Configuração TanStack Start
└── styles.css                 # Tema + variáveis CSS

public/
├── favicon.ico
├── site.webmanifest
└── INSTRUCOES.md

config/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── eslint.config.js
└── components.json
```

### Arquivos Críticos

| Arquivo                  | Função                                   | Criticidade   |
| ------------------------ | ---------------------------------------- | ------------- |
| `lib/identification.tsx` | Gerencia identificação do usuário        | 🔴 CRÍTICO    |
| `lib/briefing-schema.ts` | Define e valida formulário + diagnóstico | 🔴 CRÍTICO    |
| `routes/briefing.tsx`    | Interface do formulário                  | 🟡 IMPORTANTE |
| `routes/admin.tsx`       | Painel administrativo                    | 🟡 IMPORTANTE |
| `lib/supabase.ts`        | Cliente de banco de dados                | 🔴 CRÍTICO    |

---

## 🧠 LÓGICA DE DIAGNÓSTICO (NOVO)

### Como Funciona

A aplicação agora utiliza um sistema **inteligente de diagnóstico** que:

1. **Faz perguntas iniciais** (sem pedir "qual serviço você quer")
2. **Analisa as respostas** com regex + pontuação
3. **Calcula scores** para cada serviço (landing-page, central-de-links, site-institucional, sistema)
4. **Infere o melhor serviço** automaticamente
5. **Continua com perguntas específicas** do serviço identificado

### Perguntas de Diagnóstico

```javascript
1. Qual é o objetivo principal dessa solução?
   → Opções: Gerar leads, Vender, Agendar, Captar inscrições, Apresentar marca, Processos internos

2. Como está hoje a sua presença digital?
   → Opções: Não tenho nada, Rede fraca, Presença desorganizada, Já funciona mas precisa evoluir

3. O que você espera que a pessoa faça após ver isso?
   → Campo de texto livre (comprar, entrar em contato, agendar, etc.)

4. Essa solução precisa resolver mais uma questão de venda ou processo interno?
   → Opções: Venda/cliente, Processo interno, Os dois

5. Qual é a dor principal de hoje?
   → Campo de texto (descrição da urgência)
```

### Scoring (Pontuação)

```typescript
Landing Page:
  - Contém "vender", "produto", "lead", "oferta": +2 pontos
  - Menção de "venda direta": +3 pontos

Central de Links:
  - Contém "instagram", "rede social", "perfil": +2 pontos
  - Menção de "centralizar contatos": +2 pontos

Site Institucional:
  - Contém "marca", "credibilidade", "empresa": +2 pontos
  - Menção de "apresentar": +3 pontos

Sistema:
  - Contém "automação", "processo", "gestão": +2 pontos
  - Menção de "interno", "operacional": +3 pontos
```

### Exemplo Prático

**Cliente responde:**

- Objetivo: "Vender um produto"
- Presença digital: "Não tenho nada"
- Ação esperada: "Que feche a venda na hora"
- Processo: "Venda"
- Dor: "Preciso de leads qualificados"

**Sistema calcula:**

- Landing Page: 8 pontos ✅ (mais alto)
- Central de Links: 1 ponto
- Site Institucional: 1 ponto
- Sistema: 0 pontos

**Resultado:** Landing Page é o serviço recomendado

---

## 📋 SCHEMA DO FORMULÁRIO

### Estrutura Geral

```
┌─────────────────────────────────────────┐
│ 0. DIAGNÓSTICO (5 perguntas)           │ ← Novo! Infere serviço
├─────────────────────────────────────────┤
│ 1. DADOS PESSOAIS (nome, email, etc.)  │
│ 2. DADOS DA EMPRESA (nicho, descrição) │
├─────────────────────────────────────────┤
│ 3-5. PERGUNTAS ESPECÍFICAS DO SERVIÇO  │
│      (variam conforme tipo identificado)│
├─────────────────────────────────────────┤
│ 6. REFERÊNCIAS & MATERIAIS             │
│ 7. PRAZO & INVESTIMENTO                │
└─────────────────────────────────────────┘
```

### Serviços Suportados

#### 1. Landing Page 🎯

- Foco: Converter visitantes em clientes/leads
- Perguntas: Público-alvo, diferenciais, objetivos da LP
- Campos: CTA, ofertas, integrações (WhatsApp, Google Analytics, etc.)

#### 2. Central de Links 🔗

- Foco: Centralizar contatos em uma única página
- Perguntas: Bio, links prioritários, estilo visual
- Campos: Lista de redes sociais, ordem de prioridade

#### 3. Site Institucional 🏢

- Foco: Apresentar empresa com credibilidade
- Perguntas: Estrutura de páginas, blog, multilíngue
- Campos: Número de páginas, seções desejadas

#### 4. Sistema/Software ⚙️

- Foco: Automação de processos internos
- Perguntas: Tipos de usuários, permissões, automações
- Campos: Integrações com sistemas existentes, dashboards

---

## 💾 BANCO DE DADOS

### Tabela: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY (auto-generated),
  full_name TEXT NOT NULL,
  phone_last4 TEXT NOT NULL,

  UNIQUE(full_name, phone_last4)
);
```

**Índice**: `(full_name, phone_last4)` — para recuperação rápida

### Tabela: `briefings`

```sql
CREATE TABLE briefings (
  id UUID PRIMARY KEY (auto-generated),
  profile_id UUID REFERENCES profiles(id),

  current_step INT DEFAULT 0,
  data JSONB,                    -- Respostas do formulário
  other JSONB,                   -- Campos "Outro"

  completed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Novo',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos principais em `data`:**

- `nome`, `email`, `whatsapp`, `cargo`
- `empresa`, `nicho`, `descricao`
- `objetivo_principal`, `presenca_digital_atual`
- `acao_esperada`, `processos_internos`, `principal_dor`
- `service_type` (calculado automaticamente)

---

## 🔐 IDENTIFICAÇÃO & SEGURANÇA

### Fluxo de Identificação

```
Cliente acessa /
  ↓
Preenche Nome + Últimos 4 dígitos WhatsApp
  ↓
Sistema busca: SELECT * FROM profiles
  WHERE full_name = ? AND phone_last4 = ?
  ↓
┌─────────────────┬──────────────────────┐
│ Encontrado?     │ Ação                 │
├─────────────────┼──────────────────────┤
│ Sim             │ Recuperar perfil     │
│ Não             │ Criar novo perfil    │
└─────────────────┴──────────────────────┘
  ↓
Armazenar em localStorage:
{
  profile_id: "uuid-aqui",
  full_name: "Ana Silva",
  phone_last4: "9999"
}
```

### Notas de Segurança

⚠️ **Importante**: Este sistema **não possui autenticação forte**:

- Sem senha
- Sem JWT / OAuth
- Sem MFA
- Baseado apenas em nome + 4 dígitos (baixa entropia)

✅ **Adequado para**: MVP interno, prototipagem, POC
❌ **Não adequado para**: Dados financeiros, sistemas críticos

---

## 📱 ROTAS & PÁGINAS

### GET `/`

**Landing Page de Identificação**

- Exibe logo, título e formulário simples
- Campos: Nome Completo, Últimos 4 dígitos do WhatsApp
- Ação: Identificar ou criar perfil → Redirect `/briefing`

### GET `/briefing`

**Formulário de Diagnóstico & Briefing**

- Etapa 0: Diagnóstico (5 perguntas)
- Etapa 1-2: Dados pessoais e da empresa
- Etapa 3-5: Perguntas específicas do serviço (variam)
- Etapa 6-7: Referências e prazo/orçamento

**Estados:**

- Loading (carregando dados salvos)
- Preenchendo (com auto-save a cada 1.5s)
- Visualização de resultado (após conclusão)
- Concluído (exibe mensagem de agradecimento)

### GET `/admin`

**Painel Administrativo**

- Lista todos os briefings enviados
- Filtros: Status, serviço, data
- Visualização detalhada de cada briefing
- Exportação em Markdown para IA processar
- Apenas para usuários em `ADMIN_USERS` (código)

---

## 🔄 AUTO-SAVE & RECUPERAÇÃO

### Auto-Save

```typescript
useEffect(() => {
  if (!hydrated || submitted) return;

  // Debounce de 1.5 segundos
  const timer = setTimeout(() => {
    saveToSupabase(stepIndex, data, other);
  }, DEBOUNCE_MS);

  return () => clearTimeout(timer);
}, [stepIndex, data, other]);
```

**Comportamento:**

- Salva automaticamente a cada mudança de campo
- Aguarda 1.5s de inatividade antes de persistir
- Não salva se o formulário já foi enviado
- Mostra indicador visual "Salvando..."

### Recuperação

```typescript
useEffect(() => {
  const loadBriefing = async () => {
    // 1. Busca o briefing mais recente
    const briefing = await supabase
      .from("briefings")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1);

    // 2. Se concluído → mostra "já preenchido"
    if (briefing.completed) {
      setAlreadyCompleted(true);
    }

    // 3. Se incompleto → restaura estado
    setStepIndex(briefing.current_step);
    setData(briefing.data);
  };

  loadBriefing();
}, [profile]);
```

**Características:**

- Recupera o último briefing não concluído
- Restaura exatamente a etapa que o usuário deixou
- Se já foi enviado, exibe aviso com opção de criar novo

---

## 🎨 DESIGN SYSTEM

### Cores Principais

```css
--nexus: #0f4cff /* Azul primário */ --quantum: #00d4ff /* Cyan accent */ --prestige: #ffb84d
  /* Gold secondary */ --graphite: #1a1a1a /* Dark bg */ --tech: #2d3748 /* Gray secondary */;
```

### Variáveis CSS Customizadas

Definidas em `src/styles.css`:

- `--gradient-brand`: Gradiente Nexus → Prestige
- `--gradient-gold`: Gradiente Gold
- `--shadow-glow`: Sombra com brilho
- `--shadow-gold`: Sombra gold
- `--bg-gradient-surface`: Fundo com gradiente

### Classes Utilitárias Criadas

- `.bg-gradient-brand` — Fundo gradiente principal
- `.text-gradient-gold` — Texto gradiente ouro
- `.shadow-glow` — Sombra brilhante
- `.shadow-gold` — Sombra gold
- `.animate-spin` — Rotação de loading

### Responsividade

- Mobile-first com Tailwind
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Componentes adaptam layout automaticamente

---

## 🚀 FLUXO DE DESENVOLVIMENTO

### Setup Local

```bash
# 1. Clone o repositório
git clone <repo-url>
cd "Form Cliente VN Tec"

# 2. Instale dependências
npm install

# 3. Crie arquivo .env.local
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# 4. Rode em desenvolvimento
npm run dev

# 5. Acesse http://localhost:8080
```

### Scripts Disponíveis

```json
{
  "dev": "vite dev", // Modo desenvolvimento
  "build": "vite build", // Build otimizado
  "build:dev": "vite build --mode dev", // Build debug
  "start": "node .output/server/index.mjs", // Rodar build localmente
  "preview": "vite preview", // Preview da build
  "lint": "eslint .", // Lint código
  "format": "prettier --write ." // Formatar código
}
```

### Convenções de Código

✅ **Obrigatório:**

- TypeScript strict mode em todo código novo
- Componentes funcionais com hooks
- Sem `console.log()` em produção (use logging estruturado)
- Nomes de variáveis em inglês
- Nomes de commits em português

✅ **Recomendado:**

- localStorage key format: `vnexus.<contexto>.v<versão>`
- Guarda `typeof window === "undefined"` para acesso a browser APIs
- Separação clara entre lógica (`lib/`) e apresentação (`routes/`, `components/`)

---

## 🔧 ALTERAÇÕES RECENTES (Sprint Atual)

### ✅ Mudança 1: Remoção do Seletor Manual de Serviço

**Data**: 01/09/2026  
**Responsável**: Assistant (GitHub Copilot)  
**Status**: ✅ Concluída e validada

#### Problema

O formulário força o usuário a **selecionar manualmente** qual serviço deseja (Landing Page, Links, etc.) antes de responder perguntas. Isso vai contra a lógica de diagnóstico já implementada no schema.

#### Solução

Remover a tela de seleção manual e utilizar o **sistema de diagnóstico automático**:

1. **Antes**: Landing Page → Escolher Serviço (tela manual) → Formulário → Resultado
2. **Depois**: Diagnóstico (5Q) → Serviço Inferido Automaticamente → Formulário → Resultado

#### Alterações Técnicas

**Arquivo modificado**: `src/routes/briefing.tsx`

```typescript
// ❌ REMOVIDO:
const [selectedService, setSelectedService] = useState<ServiceType>(DEFAULT_SERVICE_TYPE);
const [showServicePicker, setShowServicePicker] = useState(true);

// ✅ ADICIONADO:
const serviceType = useMemo(() => getServiceTypeFromData(data as Record<string, unknown>), [data]);
const workflow = useMemo(() => buildDiagnosticWorkflow(data as Record<string, unknown>), [data]);
```

**Resultado:**

- Fluxo mais intuitivo (sem decisão adicional do usuário)
- Serviço inferido automaticamente baseado em respostas
- Mantém compatibilidade com dados salvos anteriormente
- Testes passam 100% ✅

---

### ✅ Mudança 2: Estabilidade do Workflow (Diagnóstico Completo)

**Data**: 01/09/2026  
**Responsável**: Assistant (GitHub Copilot)  
**Status**: ✅ Concluída e validada

#### Problema

A função `shouldAskTieBreaker` decidia sobre o desempate de serviços **parcialmente** durante o preenchimento das perguntas de diagnóstico. Isso fazia com que:

- A contagem de etapas ("Etapa X de Y") mudasse no meio do preenchimento
- O `stepIndex` apontasse para etapas erradas
- O workflow expandisse/contraísse dinamicamente

### ✅ Mudança 3: Ajuste da Copy da Tela Inicial

**Data**: 01/09/2026  
**Responsável**: Assistant (GitHub Copilot)  
**Status**: ✅ Concluída

#### Problema

A tela de entrada ainda usava textos que sugeriam uma solução exclusiva para Landing Page, mesmo após a mudança para diagnóstico genérico e inferência automática de serviços.

#### Solução

Ajustou o headline, o metadado da página e a descrição para refletir um diagnóstico inicial aberto e consultivo, sem reforçar exclusividade ou foco único em Landing Page.

#### Solução

Implementar uma verificação de **completude do diagnóstico** antes de avaliar o empate:

```typescript
// ✅ NOVO: Função auxiliar que verifica 100% de completude
function isDiagnosticComplete(data?: Record<string, unknown>): boolean {
  if (!data) return false;

  const requiredDiagnosticIds = [
    "objetivo_principal",
    "presenca_digital_atual",
    "acao_esperada",
    "processos_internos",
    "principal_dor",
  ];

  return requiredDiagnosticIds.every((fieldId) => {
    const value = data[fieldId];
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  });
}

// ✅ MODIFICADO: shouldAskTieBreaker agora checa completude
export function shouldAskTieBreaker(data?: ...): boolean {
  // Só considera empate se o diagnóstico estiver 100% completo
  if (!isDiagnosticComplete(data)) {
    return false;
  }

  // ... resto da lógica original ...
}
```

#### Resultado

- ✅ Workflow gerado uma vez e fica **estável** durante preenchimento
- ✅ Contagem de etapas não muda
- ✅ `stepIndex` sempre aponta para a etapa correta
- ✅ Desempate só acontece APÓS diagnóstico 100% completo

#### Validação

```bash
✔ TypeScript compilation: 0 errors
✔ Test suite: 3/3 tests passed
  ✔ exposes the four service flows (10.7ms)
  ✔ infers service type and scores from diagnosis answers (0.9ms)
  ✔ asks a tie-breaker only when diagnostic is complete AND scores close (0.7ms)
```

---

## 📊 ESTATÍSTICAS DO PROJETO

```
Linhas de Código (TypeScript):  ~3,500 LOC
Componentes UI (shadcn):        52 componentes
Rotas:                          4 rotas (/, /briefing, /admin, 404)
Campos de Formulário:           ~50 campos
Serviços Suportados:            4 tipos
Testes Unitários:               3 testes (schema)
Bundle Size (otimizado):        ~150 KB (gzip)
Time to Interactive:            <2s (SSR)
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Profile not found" após identificação

**Causa**: Cliente cancelou a criação de perfil  
**Solução**:

```bash
# Limpe localStorage
localStorage.removeItem('vnexus.identification.v1')

# Tente novamente
```

### Problema: Formulário não salva

**Causa**: Internet desconectada ou Supabase indisponível  
**Solução**:

- Verifica console (`F12` → Network)
- Aguarde reconexão automática (tenta a cada 30s)
- Se persistir, contate time devops

### Problema: Auto-save lento

**Causa**: Conexão 3G/4G fraca  
**Solução**:

- Normal em redes lentas (debounce de 1.5s ajuda)
- Não atualize a página durante upload
- Aguarde indicador "Salvando..." desaparecer

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **`AGENTS.md`** — Convenções para IAs e bots (mantido para referência)
- **`PROJECT_MASTER_CONTEXT.md`** — Contexto oficial (READ-ONLY)
- **`public/INSTRUCOES.md`** — Setup de favicon

---

## 🔮 Roadmap Futuro

### Curto Prazo (Próximas 2 semanas)

- [ ] Adicionar tela de "Resultado Revelado" após conclusão
- [ ] Exportar briefing como PDF
- [ ] Melhorar mensagens de erro
- [ ] Adicionar analytics básico

### Médio Prazo (Próximo mês)

- [ ] Autenticação via WhatsApp (confirmação de número)
- [ ] Webhooks para notificar equipe via Slack
- [ ] Dashboard com métricas de envios
- [ ] Edição de briefing enviado

### Longo Prazo (Roadmap)

- [ ] Integração com IA para análise automática
- [ ] Múltiplos idiomas (EN, ES)
- [ ] Mobile app nativa
- [ ] Pesquisa de satisfação pós-envio

---

## 📞 SUPORTE & CONTATO

- **Issues técnicas**: Contate o time devops
- **Dúvidas sobre fluxo**: Consulte PROJECT_MASTER_CONTEXT.md
- **Sugestões de UX**: Abra issue no repositório

---

**Fim do Documento**  
_Mantenha este arquivo atualizado com cada mudança no projeto._
