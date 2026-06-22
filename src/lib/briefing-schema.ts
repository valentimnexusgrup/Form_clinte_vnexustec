export type FieldType = "text" | "textarea" | "email" | "tel" | "url" | "radio" | "checkbox" | "file";

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

export const steps: Step[] = [
  {
    id: "sobre-voce",
    title: "Sobre você",
    subtitle: "Vamos começar com o básico. Como podemos te chamar?",
    fields: [
      { id: "nome", label: "Seu nome completo", type: "text", placeholder: "Ex.: Ana Souza", required: true },
      { id: "email", label: "E-mail principal", type: "email", placeholder: "voce@email.com", required: true },
      { id: "whatsapp", label: "WhatsApp", type: "tel", placeholder: "(00) 00000-0000", required: true },
      { id: "cargo", label: "Sua função no negócio", type: "text", placeholder: "Ex.: Fundadora, Sócia, Diretora de Marketing" },
      { id: "como_conheceu", label: "Como conheceu a VNEXUS TEC?", type: "radio", options: ["Indicação", "Instagram", "Google", "LinkedIn", "Outro"], allowOther: true },
    ],
  },
  {
    id: "sobre-negocio",
    title: "Sobre seu negócio",
    subtitle: "Conte um pouco sobre a empresa ou marca pessoal.",
    fields: [
      { id: "empresa", label: "Nome da empresa ou marca", type: "text", required: true },
      { id: "site_atual", label: "Site atual (se houver)", type: "url", placeholder: "https://..." },
      { id: "nicho", label: "Qual o seu nicho de atuação?", type: "text", placeholder: "Ex.: fotografia, advocacia, arquitetura", required: true },
      { id: "tempo_mercado", label: "Há quanto tempo atua nesse mercado?", type: "radio", options: ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"] },
      { id: "descricao", label: "Descreva seu negócio em poucas linhas", hint: "Pense como explicaria para alguém que nunca te conheceu.", type: "textarea", required: true },
    ],
  },
  {
    id: "clientes",
    title: "Seus clientes",
    subtitle: "Quem é a pessoa que você quer atrair?",
    fields: [
      { id: "publico", label: "Quem é o seu cliente ideal?", hint: "Idade, profissão, estilo de vida...", type: "textarea", required: true },
      { id: "dores", label: "Quais são as principais dores ou desafios desse cliente?", type: "textarea", required: true },
      { id: "desejos", label: "O que ele realmente deseja conquistar?", type: "textarea" },
      { id: "objeções", label: "Quais dúvidas ou objeções costumam aparecer antes de fechar?", type: "textarea" },
    ],
  },
  {
    id: "diferenciais",
    title: "Diferenciais",
    subtitle: "O que torna seu trabalho único.",
    fields: [
      { id: "diferenciais", label: "Quais são seus 3 principais diferenciais?", type: "textarea", required: true },
      { id: "concorrentes", label: "Quem são seus concorrentes diretos? (sites ou nomes)", type: "textarea" },
      { id: "prova_social", label: "Possui depoimentos, cases, números ou prêmios?", type: "checkbox", options: ["Depoimentos", "Cases de sucesso", "Números/estatísticas", "Prêmios", "Certificações", "Mídia/imprensa"] },
      { id: "garantias", label: "Oferece alguma garantia ou bônus?", type: "text" },
    ],
  },
  {
    id: "objetivos",
    title: "Objetivos da Landing Page",
    subtitle: "Para que essa página vai trabalhar.",
    fields: [
      { id: "objetivo_principal", label: "Qual o objetivo principal da Landing Page?", type: "radio", options: ["Gerar leads/contatos", "Vender um produto/serviço", "Agendar consultas/reuniões", "Captar inscrições para evento", "Apresentar a marca"], required: true, allowOther: true },
      { id: "cta", label: "Qual a ação ideal que o visitante deve realizar?", type: "text", placeholder: "Ex.: Clicar em \"Falar no WhatsApp\"", required: true },
      { id: "oferta", label: "Existe alguma oferta, promoção ou condição especial?", type: "textarea" },
      { id: "secoes", label: "Seções que gostaria de ter na página", type: "checkbox", options: ["Hero com chamada principal", "Sobre", "Serviços/Produtos", "Diferenciais", "Depoimentos", "Portfólio/Galeria", "Perguntas frequentes", "Formulário de contato", "Mapa/Localização", "Blog/Conteúdo"] },
      { id: "integracoes", label: "Integrações necessárias", type: "checkbox", options: ["WhatsApp", "Instagram", "Google Analytics", "Pixel do Meta", "E-mail marketing", "Agenda online", "Pagamento online"] },
    ],
  },
  {
    id: "referencias",
    title: "Referências e materiais",
    subtitle: "Inspirações e arquivos que você já tem.",
    fields: [
      { id: "referencias_sites", label: "Sites de referência que você admira", hint: "Cole 1 ou mais links e explique o que gosta neles.", type: "textarea" },
      { id: "estilo", label: "Estilo visual desejado", type: "radio", options: ["Minimalista", "Moderno e tecnológico", "Elegante e premium", "Colorido e vibrante", "Clássico e sóbrio"], allowOther: true },
      { id: "cores", label: "Possui paleta de cores definida?", type: "text", placeholder: "Cole códigos hex ou descreva" },
      { id: "logo", label: "Envie sua logo", hint: "PNG, SVG, JPG ou PDF.", type: "file" },
      { id: "materiais", label: "Outros materiais (fotos, vídeos, textos)", type: "file" },
    ],
  },
  {
    id: "final",
    title: "Informações finais",
    subtitle: "Últimos detalhes para fecharmos com chave de ouro.",
    fields: [
      { id: "prazo", label: "Tem alguma data ou prazo importante?", type: "text", placeholder: "Ex.: lançamento dia 15/08" },
      { id: "investimento", label: "Faixa de investimento prevista", type: "radio", options: ["Até R$ 2.000", "R$ 2.000 – R$ 5.000", "R$ 5.000 – R$ 10.000", "Acima de R$ 10.000", "Prefiro discutir depois"] },
      { id: "dominio", label: "Já possui domínio e hospedagem?", type: "radio", options: ["Sim, ambos", "Apenas domínio", "Não, preciso de orientação"] },
      { id: "observacoes", label: "Algo mais que gostaria de compartilhar?", type: "textarea", hint: "Ideias, restrições, expectativas..." },
    ],
  },
];
