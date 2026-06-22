import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import logoAsset from "@/assets/vnexus-logo.png.asset.json";
import { steps, type Field } from "@/lib/briefing-schema";
import { saveSubmission, type FormState, type Value } from "@/lib/briefing-summary";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Briefing de Landing Page · VNEXUS TEC" },
      { name: "description", content: "Formulário inteligente para coleta de briefing de Landing Pages de alta conversão." },
    ],
  }),
  component: BriefingPage,
});

const STORAGE_KEY = "vnexus.briefing.v1";

function loadState(): { step: number; data: FormState; other: Record<string, string> } {
  if (typeof window === "undefined") return { step: 0, data: {}, other: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { step: 0, data: {}, other: {} };
    return JSON.parse(raw);
  } catch {
    return { step: 0, data: {}, other: {} };
  }
}

function BriefingPage() {
  const [hydrated, setHydrated] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<FormState>({});
  const [other, setOther] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setStepIndex(loaded.step);
    setData(loaded.data);
    setOther(loaded.other);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || submitted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: stepIndex, data, other }));
  }, [stepIndex, data, other, hydrated, submitted]);

  const totalSteps = steps.length;
  const current = steps[stepIndex];
  const progress = submitted ? 100 : Math.round(((stepIndex) / totalSteps) * 100);

  const update = (id: string, v: Value) => setData((d) => ({ ...d, [id]: v }));

  const isStepValid = useMemo(() => {
    return current.fields.every((f) => {
      if (!f.required) return true;
      const v = data[f.id];
      if (Array.isArray(v)) return v.length > 0;
      return typeof v === "string" && v.trim().length > 0;
    });
  }, [current, data]);

  const next = () => {
    if (!isStepValid) return;
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Persist submission for admin and reset the working draft
      saveSubmission(data, other);
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const prev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    if (!confirm("Tem certeza que deseja apagar todas as respostas?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setData({});
    setOther({});
    setStepIndex(0);
    setSubmitted(false);
  };

  const startNew = () => {
    setData({});
    setOther({});
    setStepIndex(0);
    setSubmitted(false);
  };

  if (submitted) {
    return <ThankYou onNew={startNew} />;
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex flex-col items-center text-center">
          <img src={logoAsset.url} alt="VNEXUS TEC" className="h-20 w-auto drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-gradient-gold">
            Briefing · Landing Page
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            Vamos desenhar a sua próxima <span className="text-gradient-gold">página de alta conversão</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Leva menos de 8 minutos. Suas respostas são salvas automaticamente — você pode parar e voltar quando quiser.
          </p>
        </header>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>
              Etapa <span className="text-foreground">{stepIndex + 1}</span> de {totalSteps}
            </span>
            <span className="text-gradient-gold">{progress}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-brand transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-gradient-gold opacity-60 blur-sm transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => i < stepIndex && setStepIndex(i)}
                disabled={i > stepIndex}
                className={`flex-1 truncate rounded-md px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-all ${
                  i === stepIndex
                    ? "bg-primary/20 text-foreground ring-1 ring-primary"
                    : i < stepIndex
                      ? "bg-accent/10 text-accent hover:bg-accent/20"
                      : "bg-muted/40 text-muted-foreground"
                }`}
                title={s.title}
              >
                {i + 1}. {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div
          key={current.id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-glow sm:p-10"
        >
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{current.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{current.subtitle}</p>

          <div className="mt-8 space-y-7">
            {current.fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={data[field.id]}
                other={other[field.id] || ""}
                onChange={(v) => update(field.id, v)}
                onOtherChange={(v) => setOther((o) => ({ ...o, [field.id]: v }))}
              />
            ))}
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={stepIndex === 0}
              className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Voltar
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!isStepValid}
              className="group relative overflow-hidden rounded-lg bg-gradient-brand px-7 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <span className="relative z-10">
                {stepIndex === totalSteps - 1 ? "Enviar briefing →" : "Avançar →"}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-gold opacity-0 transition group-hover:translate-x-0 group-hover:opacity-30" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>💾 Progresso salvo automaticamente neste dispositivo</span>
          <button onClick={reset} className="underline-offset-2 hover:text-destructive hover:underline">
            Limpar tudo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Thank you ----------------------- */
function ThankYou({ onNew }: { onNew: () => void }) {
  return (
    <div className="min-h-screen px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <img src={logoAsset.url} alt="VNEXUS TEC" className="mx-auto h-20 w-auto drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]" />
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          ✓ Briefing recebido
        </div>
        <h1 className="mt-5 text-3xl font-bold sm:text-5xl">
          Obrigado! Recebemos seu <span className="text-gradient-gold">briefing</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground sm:text-base">
          Nossa equipe vai analisar suas respostas e entrará em contato em breve pelo WhatsApp ou e-mail
          informado. Enquanto isso, você pode relaxar — o trabalho pesado agora é com a gente. 🚀
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onNew}
            className="rounded-lg bg-gradient-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:scale-[1.02]"
          >
            Enviar outro briefing
          </button>
          <Link
            to="/"
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
          >
            Voltar ao início
          </Link>
        </div>

        <p className="mt-16 text-xs text-muted-foreground">
          © {new Date().getFullYear()} VNEXUS TEC · Engenharia digital de alta conversão
        </p>
      </div>
    </div>
  );
}

/* ----------------------- Field ----------------------- */
function FieldInput({
  field,
  value,
  other,
  onChange,
  onOtherChange,
}: {
  field: Field;
  value: Value | undefined;
  other: string;
  onChange: (v: Value) => void;
  onOtherChange: (v: string) => void;
}) {
  const labelEl = (
    <label className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-sm font-semibold text-foreground">
        {field.label}
        {field.required && <span className="ml-1 text-accent">*</span>}
      </span>
    </label>
  );
  const hintEl = field.hint && <p className="mt-1.5 text-xs text-muted-foreground">{field.hint}</p>;
  const inputCls =
    "w-full rounded-lg border border-border bg-input/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary focus:bg-input/70 focus:outline-none focus:ring-2 focus:ring-primary/30";

  switch (field.type) {
    case "text":
    case "email":
    case "tel":
    case "url":
      return (
        <div>
          {labelEl}
          <input
            type={field.type}
            value={(value as string) || ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
          {hintEl}
        </div>
      );
    case "textarea":
      return (
        <div>
          {labelEl}
          <textarea
            rows={4}
            value={(value as string) || ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls + " resize-y leading-relaxed"}
          />
          {hintEl}
        </div>
      );
    case "radio":
      return (
        <div>
          {labelEl}
          <div className="grid gap-2 sm:grid-cols-2">
            {field.options?.map((opt) => {
              const selected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(opt)}
                  className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                    selected
                      ? "border-accent bg-accent/10 text-foreground shadow-gold"
                      : "border-border bg-input/30 text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selected ? "border-accent bg-accent" : "border-muted-foreground/50"
                    }`}
                  >
                    {selected && <span className="h-1.5 w-1.5 rounded-full bg-graphite" />}
                  </span>
                  <span className="font-medium">{opt}</span>
                </button>
              );
            })}
            {field.allowOther && (
              <input
                type="text"
                value={other}
                onChange={(e) => {
                  onOtherChange(e.target.value);
                  if (e.target.value) onChange(`Outro: ${e.target.value}`);
                }}
                placeholder="Outro (especifique)…"
                className={inputCls + " sm:col-span-2"}
              />
            )}
          </div>
          {hintEl}
        </div>
      );
    case "checkbox": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          {labelEl}
          <div className="grid gap-2 sm:grid-cols-2">
            {field.options?.map((opt) => {
              const checked = arr.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    onChange(checked ? arr.filter((o) => o !== opt) : [...arr, opt])
                  }
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                    checked
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-input/30 text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50"
                    }`}
                  >
                    {checked && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="font-medium">{opt}</span>
                </button>
              );
            })}
          </div>
          {hintEl}
        </div>
      );
    }
    case "file": {
      const files = Array.isArray(value) ? (value as { name: string; size: number }[]) : [];
      return (
        <div>
          {labelEl}
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-input/20 px-6 py-8 text-center transition hover:border-primary hover:bg-input/40">
            <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium text-foreground">Clique para enviar arquivos</span>
            <span className="text-xs text-muted-foreground">ou arraste e solte aqui</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const list = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size }));
                onChange([...files, ...list]);
              }}
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border bg-input/30 px-3 py-2 text-xs"
                >
                  <span className="truncate font-medium text-foreground">📎 {f.name}</span>
                  <button
                    type="button"
                    onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
          {hintEl}
        </div>
      );
    }
  }
}
