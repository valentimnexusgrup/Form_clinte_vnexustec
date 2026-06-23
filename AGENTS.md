# AGENTS.md

## Convenções do Projeto

- Utilize TypeScript estrito para todo código novo.
- Siga o padrão de componentes funcionais com hooks.
- Utilize as variáveis CSS customizadas do tema (`--nexus`, `--quantum`, `--prestige`, `--graphite`, `--tech`).
- Prefira as classes utilitárias do design system: `bg-gradient-brand`, `text-gradient-gold`, `shadow-glow`, `shadow-gold`.
- Mantenha os componentes de UI em `src/components/ui/` (shadcn/ui).
- Mantenha a lógica de negócio em `src/lib/`.
- Para chaves de `localStorage`, use o formato `vnexus.<contexto>.v<versão>`.
- Todo acesso a `window`, `localStorage` ou `sessionStorage` deve ter guarda `typeof window === "undefined"`.
- Commit messages devem ser descritivas em português.
