export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "url"
  | "radio"
  | "checkbox"
  | "file";

export type ServiceType =
  | "central-de-links"
  | "landing-page"
  | "site-institucional"
  | "sistema";

export interface Field {
  id: string;
  label: string;
  hint?: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  allowOther?: boolean;
}

export interface Step {
  id: string;
  title: string;
  subtitle: string;
  fields: Field[];
}

export interface ServiceOption {
  id: ServiceType;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}

export const DEFAULT_SERVICE_TYPE: ServiceType = "landing-page";

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "central-de-links",
    label: "Central de Links",
    shortLabel: "Links",
    description: "Presença digital com foco em conversão e encontros diretos.",
    icon: "🔗",
  },
  {
    id: "landing-page",
    label: "Landing Page",
    shortLabel: "Landing",
    description: "Página de alta conversão para captar leads e vender uma oferta.",
    icon: "🎯",
  },
  {
    id: "site-institucional",
    label: "Site institucional",
    shortLabel: "Institucional",
    description: "Marca com presença, credibilidade e páginas estratégicas.",
    icon: "🏢",
  },
  {
    id: "sistema",
    label: "Sistema/software",
    shortLabel: "Sistema",
    description: "Automação, gestão e ferramentas para otimizar processos.",
    icon: "⚙️",
  },
];

export const commonSteps: Step[] = [
  {
    id: "sobre-voce",
    title: "Sobre você",
    subtitle: "Vamos começar com o básico. Como podemos te chamar?",
    fields: [
      {
        id: "nome",
        label: "Seu nome completo",
        type: "text",
        placeholder: "Ex.: Ana Souza",
        required: true,
      },
      {
        id: "email",
        label: "E-mail principal",
        type: "email",
        placeholder: "voce@email.com",
        required: true,
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        type: "tel",
        placeholder: "(00) 00000-0000",
        required: true,
      },
      {
        id: "cargo",
        label: "Sua função no negócio",
        type: "text",
        placeholder: "Ex.: Fundadora, Sócia, Diretora de Marketing",
      },
      {
        id: "como_conheceu",
        label: "Como conheceu a VNEXUS TEC?",
        type: "radio",
        options: ["Indicação", "Instagram", "Google", "LinkedIn", "Outro"],
        allowOther: true,
      },
    ],
  },
  {
    id: "sobre-negocio",
    title: "Sobre o negócio",
    subtitle: "Conte um pouco sobre a empresa ou marca pessoal.",
    fields: [
      { id: "empresa", label: "Nome da empresa ou marca", type: "text", required: true },
      {
        id: "site_atual",
        label: "Site atual (se houver)",
        type: "url",
        placeholder: "https://...",
      },
      {
        id: "nicho",
        label: "Qual o seu nicho de atuação?",
        type: "text",
        placeholder: "Ex.: fotografia, advocacia, arquitetura",
        required: true,
      },
      {
        id: "tempo_mercado",
        label: "Há quanto tempo atua nesse mercado?",
        type: "radio",
        options: ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"],
      },
      {
        id: "descricao",
        label: "Descreva seu negócio em poucas linhas",
        hint: "Pense como explicaria para alguém que nunca te conheceu.",
        type: "textarea",
        required: true,
      },
    ],
  },
];

export const serviceSteps: Record<ServiceType, Step[]> = {
  "central-de-links": [
    {
      id: "perfil-link",
      title: "Perfil e posicionamento",
      subtitle: "Como você quer ser reconhecido e encontrado.",
      fields: [
        {
          id: "nome_exibicao",
          label: "Nome ou apelido de exibição",
          type: "text",
          placeholder: "Ex.: @ana.mendes / Ana Mendes",
          required: true,
        },
        {
          id: "bio_curta",
          label: "Bio curta",
          hint: "Uma linha que descreve sua especialidade e valor.",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "links-incluir",
      title: "Links e conteúdo",
      subtitle: "Quais ligações fazem sentido para seu público.",
      fields: [
        {
          id: "links_incluir",
          label: "Quais links você quer incluir?",
          type: "checkbox",
          options: [
            "WhatsApp",
            "Instagram",
            "Site",
            "Catálogo / E-commerce",
            "Portfolio",
            "YouTube",
            "TikTok",
            "LinkedIn",
            "Agenda",
            "Contato por e-mail",
          ],
          required: true,
        },
        {
          id: "ordem_links",
          label: "Qual a ordem de prioridade dos links?",
          hint: "Descreva a sequência ideal para o público.",
          type: "textarea",
          required: true,
        },
        {
          id: "estilo_visual_links",
          label: "Preferência de estilo visual",
          type: "radio",
          options: [
            "Minimalista",
            "Moderno e tecnológico",
            "Premium e elegante",
            "Colorido e vibrante",
            "Clássico e sóbrio",
          ],
          allowOther: true,
        },
      ],
    },
  ],
  "landing-page": [
    {
      id: "clientes",
      title: "Seus clientes",
      subtitle: "Quem é a pessoa que você quer atrair?",
      fields: [
        {
          id: "publico",
          label: "Quem é o seu cliente ideal?",
          hint: "Idade, profissão, estilo de vida...",
          type: "textarea",
          required: true,
        },
        {
          id: "dores",
          label: "Quais são as principais dores ou desafios desse cliente?",
          type: "textarea",
          required: true,
        },
        { id: "desejos", label: "O que ele realmente deseja conquistar?", type: "textarea" },
        {
          id: "objeções",
          label: "Quais dúvidas ou objeções costumam aparecer antes de fechar?",
          type: "textarea",
        },
      ],
    },
    {
      id: "diferenciais",
      title: "Diferenciais",
      subtitle: "O que torna seu trabalho único.",
      fields: [
        {
          id: "diferenciais",
          label: "Quais são seus 3 principais diferenciais?",
          type: "textarea",
          required: true,
        },
        {
          id: "concorrentes",
          label: "Quem são seus concorrentes diretos? (sites ou nomes)",
          type: "textarea",
        },
        {
          id: "prova_social",
          label: "Possui depoimentos, cases, números ou prêmios?",
          type: "checkbox",
          options: [
            "Depoimentos",
            "Cases de sucesso",
            "Números/estatísticas",
            "Prêmios",
            "Certificações",
            "Mídia/imprensa",
          ],
        },
        { id: "garantias", label: "Oferece alguma garantia ou bônus?", type: "text" },
      ],
    },
    {
      id: "objetivos",
      title: "Objetivos da Landing Page",
      subtitle: "Para que essa página vai trabalhar.",
      fields: [
        {
          id: "objetivo_principal",
          label: "Qual o objetivo principal da Landing Page?",
          type: "radio",
          options: [
            "Gerar leads/contatos",
            "Vender um produto/serviço",
            "Agendar consultas/reuniões",
            "Captar inscrições para evento",
            "Apresentar a marca",
          ],
          required: true,
          allowOther: true,
        },
        {
          id: "cta",
          label: "Qual a ação ideal que o visitante deve realizar?",
          type: "text",
          placeholder: 'Ex.: Clicar em "Falar no WhatsApp"',
          required: true,
        },
        {
          id: "oferta",
          label: "Existe alguma oferta, promoção ou condição especial?",
          type: "textarea",
        },
        {
          id: "secoes",
          label: "Seções que gostaria de ter na página",
          type: "checkbox",
          options: [
            "Hero com chamada principal",
            "Sobre",
            "Serviços/Produtos",
            "Diferenciais",
            "Depoimentos",
            "Portfólio/Galeria",
            "Perguntas frequentes",
            "Formulário de contato",
            "Mapa/Localização",
            "Blog/Conteúdo",
          ],
        },
        {
          id: "integracoes",
          label: "Integrações necessárias",
          type: "checkbox",
          options: [
            "WhatsApp",
            "Instagram",
            "Google Analytics",
            "Pixel do Meta",
            "E-mail marketing",
            "Agenda online",
            "Pagamento online",
          ],
        },
      ],
    },
  ],
  "site-institucional": [
    {
      id: "paginas-desejadas",
      title: "Estrutura do site",
      subtitle: "Como você imagina a arquitetura do seu site institucional.",
      fields: [
        {
          id: "quantidade_paginas",
          label: "Quantas páginas você deseja ter no site?",
          type: "radio",
          options: ["Até 5 páginas", "Entre 5 e 10 páginas", "Mais de 10 páginas", "Ainda não sei"],
        },
        {
          id: "paginas_desejadas",
          label: "Quais páginas você considera essenciais?",
          type: "checkbox",
          options: [
            "Início",
            "Serviços",
            "Sobre",
            "Contato",
            "Cases/Projetos",
            "FAQ",
            "Blog",
            "Depoimentos",
            "Portfolio",
            "Página de localização",
          ],
          required: true,
        },
        {
          id: "blog_site",
          label: "Você precisa de blog ou área de conteúdo?",
          type: "radio",
          options: ["Sim", "Não", "Talvez"],
        },
        {
          id: "multilingue_site",
          label: "O site precisa ser multilíngue?",
          type: "radio",
          options: ["Sim", "Não", "Ainda estou avaliando"],
        },
        {
          id: "area_restrita_site",
          label: "Existe necessidade de área de login/restrita?",
          type: "radio",
          options: ["Sim", "Não", "Talvez"],
        },
      ],
    },
  ],
  sistema: [
    {
      id: "usuarios-sistema",
      title: "Usuários e permissões",
      subtitle: "Quem vai usar o sistema e como ele deve funcionar.",
      fields: [
        {
          id: "tipos_usuarios",
          label: "Quais tipos de usuários acessarão o sistema?",
          type: "checkbox",
          options: [
            "Administrador",
            "Operador",
            "Cliente",
            "Vendedor",
            "Financeiro",
            "Suporte",
            "Parceiro",
          ],
          required: true,
        },
        {
          id: "permissoes",
          label: "Quais permissões e regras importantes devem existir?",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "processos-sistema",
      title: "Processos e automações",
      subtitle: "O que precisa ser automatizado e melhorado.",
      fields: [
        {
          id: "processos_automatizar",
          label: "Quais processos o sistema deve automatizar?",
          type: "textarea",
          required: true,
        },
        {
          id: "integracoes_sistema",
          label: "Quais integrações com sistemas existentes já existem?",
          type: "textarea",
          required: true,
        },
        {
          id: "dashboards_sistema",
          label: "Você precisa de dashboards, KPIs, alertas ou relatórios?",
          type: "checkbox",
          options: ["Dashboard executivo", "KPIs", "Alertas", "Relatórios", "Exportação de dados"],
        },
      ],
    },
  ],
};

export const closingSteps: Step[] = [
  {
    id: "referencias",
    title: "Referências e materiais",
    subtitle: "Inspirações e arquivos que você já tem.",
    fields: [
      {
        id: "referencias_sites",
        label: "Sites de referência que você admira",
        hint: "Cole 1 ou mais links e explique o que gosta neles.",
        type: "textarea",
      },
      {
        id: "estilo",
        label: "Estilo visual desejado",
        type: "radio",
        options: [
          "Minimalista",
          "Moderno e tecnológico",
          "Elegante e premium",
          "Colorido e vibrante",
          "Clássico e sóbrio",
        ],
        allowOther: true,
      },
      {
        id: "cores",
        label: "Possui paleta de cores definida?",
        type: "text",
        placeholder: "Cole códigos hex ou descreva",
      },
      { id: "logo", label: "Envie sua logo", hint: "PNG, SVG, JPG ou PDF.", type: "file" },
      { id: "materiais", label: "Outros materiais (fotos, vídeos, textos)", type: "file" },
    ],
  },
  {
    id: "prazo-investimento",
    title: "Prazo e investimento",
    subtitle: "Finalize o escopo com objetivos de entrega e orçamento.",
    fields: [
      {
        id: "prazo",
        label: "Qual prazo ideal para entrega?",
        type: "text",
        placeholder: "Ex.: 3 semanas, 2 meses, etc.",
      },
      {
        id: "investimento",
        label: "Qual é o seu orçamento ou faixa de investimento?",
        type: "text",
        placeholder: "Ex.: até R$ 3.000, entre R$ 5.000 e R$ 8.000",
      },
    ],
  },
];

export function getServiceFlow(serviceType: ServiceType = DEFAULT_SERVICE_TYPE): Step[] {
  return [...commonSteps, ...serviceSteps[serviceType], ...closingSteps];
}

export function getServiceTypeFromData(data?: Record<string, unknown>): ServiceType {
  const value = data?.service_type;
  if (value === "central-de-links" || value === "landing-page" || value === "site-institucional" || value === "sistema") {
    return value;
  }
  return DEFAULT_SERVICE_TYPE;
}

export const steps: Step[] = getServiceFlow(DEFAULT_SERVICE_TYPE);
