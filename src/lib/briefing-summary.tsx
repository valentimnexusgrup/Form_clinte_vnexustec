import { useMemo, useState } from "react";
import logoSrc from "@/assets/vnexus-logo.webp";
import { steps } from "@/lib/briefing-schema";

export type Value = string | string[] | { name: string; size: number }[];
export type FormState = Record<string, Value>;

export type SubmissionStatus =
  | "Novo"
  | "Em análise"
  | "Aguardando cliente"
  | "Aprovado"
  | "Concluído";

export type Submission = {
  id: string;
  createdAt: string;
  data: FormState;
  other: Record<string, string>;
  status: SubmissionStatus;
};

export const SUBMISSIONS_KEY = "vnexus.briefing.submissions.v1";

export function loadSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSubmission(data: FormState, other: Record<string, string>) {
  const list = loadSubmissions();
  const entry: Submission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    data,
    other,
    status: "Novo",
  };
  list.unshift(entry);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
  return entry;
}

export function deleteSubmission(id: string) {
  const list = loadSubmissions().filter((s) => s.id !== id);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
  return list;
}

export function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  const list = loadSubmissions().map((s) => (s.id === id ? { ...s, status } : s));
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
  return list;
}

export function buildBriefing(data: FormState): string {
  const get = (id: string) => {
    const v = data[id];
    if (!v) return "—";
    if (Array.isArray(v)) {
      if (v.length === 0) return "—";
      if (typeof v[0] === "string") return (v as string[]).join(", ");
      return (v as { name: string }[]).map((f) => f.name).join(", ");
    }
    return String(v);
  };

  const lines: string[] = [];
  lines.push("# BRIEFING DE LANDING PAGE — VNEXUS TEC");
  lines.push("");
  lines.push(`> Gerado em ${new Date().toLocaleString("pt-BR")}`);
  lines.push("");
  for (const step of steps) {
    lines.push(`## ${step.title}`);
    for (const f of step.fields) {
      lines.push(`**${f.label}:** ${get(f.id)}`);
    }
    lines.push("");
  }
  lines.push("---");
  lines.push("## INSTRUÇÕES PARA A IA");
  lines.push(
    "Utilize as informações acima para criar uma Landing Page de alta conversão, com copywriting persuasivo, hierarquia visual clara, estrutura otimizada para SEO e CTAs alinhados ao objetivo principal informado. Respeite o estilo visual, paleta de cores, público-alvo e diferenciais do cliente.",
  );
  return lines.join("\n");
}

export function Summary({
  data,
  title = "Briefing pronto",
  subtitle = "Conteúdo formatado para uso por IA na criação da Landing Page.",
  actions,
}: {
  data: FormState;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const briefing = useMemo(() => buildBriefing(data), [data]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(briefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const download = () => {
    const blob = new Blob([briefing], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `briefing-vnexus-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <img src={logoSrc} alt="VNEXUS TEC" className="mx-auto w-44 h-auto object-contain" draggable={false} />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            ✓ {title}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={copy}
            className="rounded-lg bg-gradient-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-graphite shadow-gold transition hover:scale-[1.02]"
          >
            {copied ? "✓ Copiado!" : "📋 Copiar briefing"}
          </button>
          <button
            onClick={download}
            className="rounded-lg bg-gradient-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:scale-[1.02]"
          >
            ⬇ Baixar .md
          </button>
          {actions}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className="rounded-2xl border border-border/60 bg-gradient-surface p-5 shadow-glow"
            >
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gradient-gold">
                {step.title}
              </h3>
              <dl className="space-y-2.5 text-sm">
                {step.fields.map((f) => {
                  const v = data[f.id];
                  const display = Array.isArray(v)
                    ? v.length === 0
                      ? "—"
                      : typeof v[0] === "string"
                        ? (v as string[]).join(", ")
                        : (v as { name: string }[]).map((x) => x.name).join(", ")
                    : (v as string) || "—";
                  return (
                    <div
                      key={f.id}
                      className="flex flex-col gap-0.5 border-b border-border/40 pb-2 last:border-0"
                    >
                      <dt className="text-xs font-medium text-muted-foreground">{f.label}</dt>
                      <dd className="break-words text-foreground">{display}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border/60 bg-graphite/80 p-1">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              briefing.md
            </span>
            <button onClick={copy} className="text-xs font-semibold text-accent hover:underline">
              {copied ? "✓ copiado" : "copiar"}
            </button>
          </div>
          <pre className="max-h-[480px] overflow-auto p-4 text-xs leading-relaxed text-muted-foreground">
            {briefing}
          </pre>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} VNEXUS TEC · Engenharia digital de alta conversão
        </p>
      </div>
    </div>
  );
}
