export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "url"
  | "radio"
  | "checkbox"
  | "file";

export type ServiceType = "central-de-links" | "landing-page" | "site-institucional" | "sistema";

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

export const NEW_FORM_VERSION = "v2";
export const DEFAULT_SERVICE_TYPE: ServiceType = "landing-page";

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "central-de-links",
    label: "Central de Links",
    shortLabel: "Links",
    description: "Presença digital com foco em conversão e contatos diretos.",
    icon: "🔗",
  },
  {
    id: "landing-page",
    label: "Landing Page",
    shortLabel: "Landing",
    description: "Página de conversão com foco em gerar ação imediata.",
    icon: "🎯",
  },
  {
    id: "site-institucional",
    label: "Site institucional",
    shortLabel: "Institucional",
    description: "Presença de marca, credibilidade e narrativa empresarial.",
    icon: "🏢",
  },
  {
    id: "sistema",
    label: "Sistema/software",
    shortLabel: "Sistema",
    description: "Fluxos internos, automação e gestão operacional.",
    icon: "⚙️",
  },
];

const diagnosticStepA: Step = {
  id: "diagnostico-objetivo",
  title: "Qual é o principal objetivo do seu projeto?",
  subtitle: "Escolha a intenção que mais combina com sua necessidade hoje.",
  fields: [
    {
      id: "diagnostico_objetivo",
      label: "Principal objetivo",
      type: "radio",
      required: true,
      options: [
        "Vender mais rápido",
        "Gerar mais contatos e leads",
        "Fortalecer a marca e a presença",
        "Automatizar processos internos",
      ],
    },
  ],
};

const diagnosticStepB: Step = {
  id: "diagnostico-cenario",
  title: "Como está a sua presença hoje?",
  subtitle: "Essa escolha ajuda a definir o nível de estrutura e estratégia ideal.",
  fields: [
    {
      id: "diagnostico_cenario",
      label: "Situação atual",
      type: "radio",
      required: true,
      options: [
        "Ainda não tenho nada estruturado",
        "Tenho algo básico, mas pouco funcional",
        "Já funciona, mas não converte bem",
        "Preciso organizar e automatizar processos",
      ],
    },
  ],
};

const diagnosticStepC: Step = {
  id: "diagnostico-prioridade",
  title: "O que mais importa para esse projeto?",
  subtitle: "Choose the priority that should guide a melhor solução.",
  fields: [
    {
      id: "diagnostico_prioridade",
      label: "Prioridade principal",
      type: "radio",
      required: true,
      options: [
        "Conversão e vendas",
        "Credibilidade e presença digital",
        "Centralizar contatos e acessos",
        "Automação e organização interna",
      ],
    },
  ],
};

const revealStep = (serviceType: ServiceType): Step => ({
  id: "resultado-revelado",
  title: "Seu caminho ideal ficou mais claro",
  subtitle: "A análise indica que a melhor solução para o seu caso é a opção abaixo.",
  fields: [],
});

const serviceSteps: Record<ServiceType, Step[]> = {
  "landing-page": [
    {
      id: "landing-objetivo",
      title: "Qual ação você quer que o visitante faça?",
      subtitle: "Essa escolha orienta a estruturada da página.",
      fields: [
        {
          id: "landing_acao",
          label: "Ação principal",
          type: "radio",
          required: true,
          options: [
            "Solicitar contato",
            "Comprar ou contratar agora",
            "Agendar reunião",
            "Se cadastrar ou receber mais informações",
          ],
        },
      ],
    },
    {
      id: "landing-oferta",
      title: "Como a oferta será apresentada?",
      subtitle: "Isso ajuda a desenhar a proposta e a comunicação certa.",
      fields: [
        {
          id: "landing_oferta",
          label: "Tipo de oferta",
          type: "radio",
          required: true,
          options: [
            "Produto ou serviço único",
            "Oferta com benefício claro",
            "Diagnóstico ou consultoria",
            "Acesso a lista, material ou evento",
          ],
        },
      ],
    },
  ],
  "central-de-links": [
    {
      id: "links-organizacao",
      title: "Como você quer organizar os acessos?",
      subtitle: "A estrutura dos links precisa refletir a jornada do usuário.",
      fields: [
        {
          id: "links_organizacao",
          label: "Estrutura desejada",
          type: "radio",
          required: true,
          options: [
            "WhatsApp, Instagram e portfolio",
            "Serviços, contatos e agenda",
            "Vendas, propostas e materiais",
            "Mais de um perfil ou canal",
          ],
        },
      ],
    },
    {
      id: "links-estilo",
      title: "O que mais importa para esse canal?",
      subtitle: "Essa resposta orienta a experiência e a prioridade da navegação.",
      fields: [
        {
          id: "links_estilo",
          label: "Prioridade principal",
          type: "radio",
          required: true,
          options: [
            "Conversão e clique",
            "Credibilidade e imagem",
            "Velocidade de acesso",
            "Ações em sequência",
          ],
        },
      ],
    },
  ],
  "site-institucional": [
    {
      id: "institucional-paginas",
      title: "Quais páginas você considera essenciais?",
      subtitle: "A estrutura deve refletir a forma como a empresa quer ser percebida.",
      fields: [
        {
          id: "institucional_paginas",
          label: "Estrutura desejada",
          type: "radio",
          required: true,
          options: [
            "Home, sobre e serviços",
            "Home, serviços e contato",
            "Home, casos, depoimentos e contato",
            "Estrutura mais completa com diversas sessões",
          ],
        },
      ],
    },
    {
      id: "institucional-mensagem",
      title: "Qual mensagem precisa ficar mais forte?",
      subtitle: "Isso ajuda a posicionar a marca e o conteúdo da empresa.",
      fields: [
        {
          id: "institucional_mensagem",
          label: "Mensagem principal",
          type: "radio",
          required: true,
          options: [
            "Quem somos e por que existimos",
            "O que fazemos e para quem",
            "Nossos diferenciais e resultados",
            "Nossa autoridade e credibilidade",
          ],
        },
      ],
    },
  ],
  sistema: [
    {
      id: "sistema-usuarios",
      title: "Quem vai usar o sistema?",
      subtitle: "A experiência precisa refletir o perfil de quem vai operar e acompanhar a rotina.",
      fields: [
        {
          id: "sistema_usuarios",
          label: "Usuários principais",
          type: "radio",
          required: true,
          options: [
            "Equipe interna",
            "Clientes ou parceiros",
            "Operadores e gestores",
            "Todos os perfis acima",
          ],
        },
      ],
    },
    {
      id: "sistema-automacao",
      title: "O que precisa ser automatizado?",
      subtitle: "Isso define a lógica e o nível de complexidade da solução.",
      fields: [
        {
          id: "sistema_automacao",
          label: "Automação principal",
          type: "radio",
          required: true,
          options: [
            "Fluxos operacionais",
            "Cadastros e controle",
            "Relatórios e indicadores",
            "Integrações e processos internos",
          ],
        },
      ],
    },
  ],
};

export const contactStep: Step = {
  id: "contato-final",
  title: "Últimos dados para fechar o projeto",
  subtitle: "Essas informações vão facilitar o atendimento e a próxima etapa.",
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
      label: "E-mail de contato",
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
  ],
};

const serviceTypeSet = new Set<ServiceType>([
  "central-de-links",
  "landing-page",
  "site-institucional",
  "sistema",
]);

function normalizeServiceType(value: unknown): ServiceType | null {
  if (typeof value !== "string") return null;
  return serviceTypeSet.has(value as ServiceType) ? (value as ServiceType) : null;
}

export function buildServiceScoresFromData(
  data?: Record<string, unknown>,
): Record<ServiceType, number> {
  const scores: Record<ServiceType, number> = {
    "central-de-links": 0,
    "landing-page": 0,
    "site-institucional": 0,
    sistema: 0,
  };

  const read = (id: string) => String(data?.[id] ?? "").toLowerCase();

  const objetivo = read("diagnostico_objetivo");
  const cenario = read("diagnostico_cenario");
  const prioridade = read("diagnostico_prioridade");

  if (objetivo.includes("vender") || objetivo.includes("lead") || objetivo.includes("contato")) {
    scores["landing-page"] += 4;
  }
  if (objetivo.includes("marca") || objetivo.includes("presença")) {
    scores["site-institucional"] += 4;
  }
  if (objetivo.includes("autom") || objetivo.includes("processo")) {
    scores.sistema += 4;
  }

  if (prioridade.includes("conversão") || prioridade.includes("vendas")) {
    scores["landing-page"] += 3;
  }
  if (
    prioridade.includes("credibilidade") ||
    prioridade.includes("presença") ||
    prioridade.includes("marca")
  ) {
    scores["site-institucional"] += 3;
  }
  if (
    prioridade.includes("contatos") ||
    prioridade.includes("acessos") ||
    prioridade.includes("centralizar")
  ) {
    scores["central-de-links"] += 3;
  }
  if (
    prioridade.includes("automação") ||
    prioridade.includes("organização") ||
    prioridade.includes("interna")
  ) {
    scores.sistema += 3;
  }

  if (cenario.includes("não tenho") || cenario.includes("básico")) {
    scores["central-de-links"] += 1;
    scores["landing-page"] += 1;
  }
  if (cenario.includes("não converte") || cenario.includes("funciona")) {
    scores["landing-page"] += 2;
  }
  if (cenario.includes("automatizar") || cenario.includes("processos")) {
    scores.sistema += 2;
  }

  return scores;
}

export function inferServiceTypeFromData(data?: Record<string, unknown>): ServiceType {
  const explicit = normalizeServiceType(data?.service_type);
  if (explicit) return explicit;

  const scores = buildServiceScoresFromData(data);
  const ranked = (Object.entries(scores) as [ServiceType, number][]).sort(
    ([, left], [, right]) => right - left,
  );
  const [best] = ranked[0] ?? [DEFAULT_SERVICE_TYPE];
  return best;
}

export function getServiceTypeFromData(data?: Record<string, unknown>): ServiceType {
  const explicit = normalizeServiceType(data?.service_type);
  if (explicit) return explicit;
  return inferServiceTypeFromData(data);
}

export function getServiceFlow(serviceType: ServiceType = DEFAULT_SERVICE_TYPE): Step[] {
  return [...serviceSteps[serviceType], contactStep];
}

export function buildDiagnosticWorkflow(data?: Record<string, unknown>): Step[] {
  const inferredService = inferServiceTypeFromData(data);
  return [
    diagnosticStepA,
    diagnosticStepB,
    diagnosticStepC,
    revealStep(inferredService),
    ...getServiceFlow(inferredService),
  ];
}
