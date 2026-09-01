# Pacote de Favicon — VNEXUS TEC

## O que tem aqui

- `favicon.ico` — ícone multi-tamanho (16/32/48px) para navegadores antigos
- `favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png` — ícones para abas modernas
- `apple-touch-icon.png` (180x180) — ícone ao salvar em tela de iOS
- `android-chrome-192x192.png`, `android-chrome-512x512.png` — ícones Android/PWA
- `site.webmanifest` — manifesto para PWA/Android

## Passo 1 — Copiar os arquivos

Copie TODOS os arquivos deste pacote (exceto este INSTRUCOES.md) para a pasta `public/` do projeto (raiz do projeto TanStack Start), assim:

```
public/favicon.ico
public/favicon-16x16.png
public/favicon-32x32.png
public/favicon-96x96.png
public/apple-touch-icon.png
public/android-chrome-192x192.png
public/android-chrome-512x512.png
public/site.webmanifest
```

## Passo 2 — Referenciar no root da aplicação

No arquivo de rota raiz (`__root.tsx` ou `root.tsx`, onde fica `createRootRoute`), adicione estes links dentro da propriedade `head`:

```tsx
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Briefing de Landing Page · VNEXUS TEC" },
      { name: "theme-color", content: "#0A1F44" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  component: RootComponent,
});
```

## Passo 3 — Testar

1. Rodar o projeto localmente (`npm run dev` ou equivalente).
2. Abrir a aba do navegador e verificar se o ícone aparece.
3. Se não atualizar: hard refresh (Ctrl+Shift+R) — o navegador cacheia favicon de forma agressiva.
4. Testar em produção depois do deploy, pois alguns hosts também cacheiam o `favicon.ico` na CDN.
