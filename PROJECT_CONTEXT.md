# Contexto do projeto — Form Cliente VN Tec

⚠️ REGRA DO PROJETO: este arquivo é parte da documentação viva do código. Sempre que qualquer alteração relevante for feita no produto (nova etapa, novo campo, mudança de lógica de diagnóstico, ajuste de UI, mudança de banco, nova regra de negócios, mudança de API ou dado de integração), este documento deve ser atualizado na mesma alteração. Não é opcional, não é tarefa separada e não pode ficar desatualizado.

## 1. Visão geral

O Form Cliente VN Tec é uma aplicação web para captar, diagnosticar e qualificar oportunidades de projeto para os serviços de VNEXUS TEC. A principal mudança estratégica do produto atual é a abordagem conversacional e orientada a decisão: em vez de perguntar “qual serviço você quer?”, o cliente responde a um diagnóstico curto e o sistema identifica o tipo de solução mais adequado.

A interface foi pensada para mobile-first, conversão e redução de fricção: uma pergunta por tela, respostas em cards clicáveis, progresso visual constante, e submissão de contato apenas no final do processo.

## 2. Stack e arquitetura

### Stack principal

- React 19
- TypeScript 5+
- Vite
- TanStack Start / Router
- Supabase para persistência
- Tailwind + design system customizado

### Estrutura funcional

- `src/routes/`: rotas do app
- `src/lib/`: lógica de negócio, helpers, integração com banco e schema
- `src/components/ui/`: componentes reutilizáveis do design system
- `src/styles.css`: tokens, Gradientes, variáveis CSS do tema

### Fluxo principal

- `/` → identificação do cliente
- `/briefing` → diagnóstico e coleta do projeto
- `/admin` → visão operacional / gestão das respostas

## 3. Regras de negócio centrais

### 3.1 Diagnóstico guiado

O processo deve começar com perguntas de diagnóstico e qualificação, sem pedir ao cliente que escolha manualmente o tipo de serviço antes de responder qualquer coisa.

### 3.2 Fluxo conversacional

- Uma pergunta por tela
- Opções em cards clicáveis
- Progresso sempre visível
- Total de etapas estável durante a jornada
- Nenhuma etapa condicional que mude “no meio” da rotina do cliente

### 3.3 Ordem de preenchimento

1. Diagnóstico principal
2. Resultado revelado da melhor solução
3. Perguntas específicas do serviço identificado
4. Dados de contato do cliente

### 3.4 Regras de contato

- Nome, e-mail e WhatsApp entram no fim
- Isso reduz fricção e faz com que a pessoa já tenha investido esforço no projeto antes de fornecer dados de contato

## 4. Lógica de diagnóstico

A lógica de diagnóstico foi reescrita para um modelo mais simples, estável e aligned to conversion best practices. O mecanismo busca priorizar clareza em vez de excesso de campos.

### Perguntas de diagnóstico

O diagnóstico usa 3 perguntas curtas e objetivas:

1. `diagnostico_objetivo`
   - Vender mais rápido
   - Gerar mais contatos e leads
   - Fortalecer a marca e a presença
   - Automatizar processos internos

2. `diagnostico_cenario`
   - Ainda não tenho nada estruturado
   - Tenho algo básico, mas pouco funcional
   - Já funciona, mas não converte bem
   - Preciso organizar e automatizar processos

3. `diagnostico_prioridade`
   - Conversão e vendas
   - Credibilidade e presença digital
   - Centralizar contatos e acessos
   - Automação e organização interna

### Inferência de solução

A inferência acontece por pontuação simples com base nas respostas do diagnóstico:

- Landing Page ganha força quando a prioridade é conversão, vendas ou leads
- Central de Links ganha força quando a prioridade é centralizar contatos e acessos
- Site institucional ganha força quando a prioridade é presença e credibilidade
- Sistema ganha força quando a prioridade é automação e organização interna

### Regra importante

A etapa de “resultado revelado” só aparece depois que o diagnóstico principal já foi respondido. O número total de etapas deve ser fixo para evitar que o cliente perceba mudança de progresso no meio da jornada.

## 5. Arquivos principais

### `src/lib/briefing-schema.ts`

Arquivo central da lógica do formulário. Ele define:

- serviços suportados
- opções de diagnóstico
- inferência de solução
- fluxo do formulário (steps)
- schema de campos e labels

### `src/routes/briefing.tsx`

Componente principal do fluxo do atendimento. Ele é responsável por:

- carregar o briefing salvo
- tratar recuperação de sessão e compatibilidade com versões antigas
- renderizar uma pergunta por tela
- salvar automaticamente em Supabase
- controlar o progresso e o submit final

### `src/routes/admin.tsx`

Painel operacional para visualizar e gerenciar briefings.

### `src/lib/briefing-summary.tsx`

Gerador de resumo em Markdown usado para IA/admin.

### `src/lib/supabase.ts`

Cliente principal do Supabase.

### `src/lib/identification.tsx`

Fluxo de identificação do cliente.

## 6. Persistência e banco

### Tabela `profiles`

- `id`
- `full_name`
- `phone_last4`
- `created_at`
- `updated_at`

### Tabela `briefings`

- `id`
- `profile_id`
- `current_step`
- `data`
- `other`
- `completed`
- `status`
- `created_at`
- `updated_at`

### Regra de compatibilidade

Se um cliente começa em um fluxo antigo (`form_version` diferente de `v2`), a aplicação reinicia o briefing em `current_step = 0` e salva a nova estrutura. Isso evita quebrar jornada iniciada em versões anteriores sem exigir que o usuário siga o fluxo antigo.

## 7. Convenções de design e UX

- Mobile-first
- Botões de toque grandes
- Sem scroll horizontal
- Teclado correto por tipo de input
- Card selection para múltipla escolha
- Progresso visual e estável
- Copy clara, direta e sem promessas exageradas

## 8. Convenções de código

- TypeScript estrito
- Componentes funcionais com hooks
- sem código morto
- sem imports não utilizados
- sem regras de UI antigas que reforcem exclusividade de um único serviço
- nomes de variáveis e campos em inglês quando forem lógicos internos; labels podem permanecer em português para UX

## 9. Como manter este arquivo atualizado

Toda modificação relevante no sistema deve incluir a revisão desta documentação no mesmo commit/alteração. Isso inclui:

- nova etapa no formulário
- mudança de ordem de etapas
- nova pergunta ou mudança de qualquer label
- mudança na lógica de inferência de serviço
- novo campo em `data`
- alteração de persistência no Supabase
- mudança de business rule e UX

Se a mudança não for refletida aqui, a documentação está incompleta e a IA futura não terá contexto suficiente para operar corretamente.

## 10. Decisões importantes do produto

- O cliente não escolhe manualmente o serviço antes do diagnóstico
- O serviço é inferido do conjunto de respostas
- O formulário prioriza progressão emocional e clareza sobre quantidade de campos
- O fluxo foi refeito para reduzir confusão, abandono e sensação de “formulário genérico”

## 11. Checklist antes de fechar qualquer alteração

Antes de concluir qualquer ajuste do projeto, revisar:

- [ ] a lógica do formulário continua estável
- [ ] o progresso não muda no meio do preenchimento
- [ ] a documentação do projeto foi atualizada
- [ ] código morto foi removido
- [ ] sem imports sem uso
- [ ] compatibilidade com clientes antigos foi tratada

## 12. Observações finais

Este projeto deve continuar evoluindo com foco em clareza, conversão e velocidade. O atributo mais importante não é “quantidade de perguntas”, e sim “qualidade da decisão que cada pergunta gera no cliente”.
