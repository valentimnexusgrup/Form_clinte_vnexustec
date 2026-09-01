import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import logoSrc from "@/assets/vnexus-logo.webp";
import {
  type Field,
  type ServiceType,
  buildDiagnosticWorkflow,
  getServiceTypeFromData,
  NEW_FORM_VERSION,
  SERVICE_OPTIONS,
} from "@/lib/briefing-schema";
import { useIdentification } from "@/lib/identification";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/briefing")({
  head: () => ({
    meta: [
      { title: "Diagnóstico e briefing · VNEXUS TEC" },
      {
        name: "description",
        content:
          "Formulário inteligente para diagnosticar a melhor solução e iniciar o briefing do projeto.",
      },
    ],
  }),
  component: BriefingPage,
});

type Value = string | string[];
type FormState = Record<string, Value>;

const DEBOUNCE_MS = 1500;

function BriefingPage() {
  const { profile, loading: authLoading } = useIdentification();
  const navigate = useNavigate();

  const [hydrated, setHydrated] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<FormState>({ form_version: NEW_FORM_VERSION });
  const [other, setOther] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [briefingId, setBriefingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate({ to: "/" });
    }
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    if (!profile) return;

    const loadBriefing = async () => {
      const { data: list, error } = await supabase
        .from("briefings")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("[BRIEFING] erro ao carregar:", error.message);
        setHydrated(true);
        return;
      }

      if (!list || list.length === 0) {
        setData({ form_version: NEW_FORM_VERSION });
        setHydrated(true);
        return;
      }

      const existing = list[0];
      const recoveredData = (existing.data as FormState) || {};
      const isLegacyFlow = recoveredData.form_version !== NEW_FORM_VERSION;

      if (existing.completed && !isLegacyFlow) {
        setAlreadyCompleted(true);
        setBriefingId(existing.id);
        setData(recoveredData);
        setOther((existing.other as Record<string, string>) || {});
        setHydrated(true);
        return;
      }

      if (isLegacyFlow) {
        setBriefingId(existing.id);
        setStepIndex(0);
        setData({ form_version: NEW_FORM_VERSION });
        setOther({});
        setHydrated(true);
        return;
      }

      setBriefingId(existing.id);
      setStepIndex(Math.min(existing.current_step ?? 0, 6));
      setData(recoveredData);
      setOther((existing.other as Record<string, string>) || {});
      setHydrated(true);
    };

    void loadBriefing();
  }, [profile]);

  const persistForm = useCallback((formData: FormState) => {
    const inferredService = getServiceTypeFromData(formData as Record<string, unknown>);
    return {
      ...formData,
      form_version: NEW_FORM_VERSION,
      service_type: inferredService,
    } as FormState;
  }, []);

  const saveToSupabase = useCallback(
    async (step: number, formData: FormState, formOther: Record<string, string>) => {
      if (!profile || submitted) return;
      setSaving(true);

      try {
        const persistedData = persistForm(formData);

        if (briefingId) {
          await supabase
            .from("briefings")
            .update({
              current_step: step,
              data: persistedData,
              other: formOther,
              updated_at: new Date().toISOString(),
            })
            .eq("id", briefingId);
        } else {
          const { data: newBriefing } = await supabase
            .from("briefings")
            .insert({
              profile_id: profile.id,
              current_step: step,
              data: persistedData,
              other: formOther,
            })
            .select()
            .single();

          if (newBriefing) {
            setBriefingId(newBriefing.id);
          }
        }
      } catch (err) {
        console.error("[BRIEFING] auto-save error:", err);
      } finally {
        setSaving(false);
      }
    },
    [briefingId, persistForm, profile, submitted],
  );

  useEffect(() => {
    if (!hydrated || submitted || alreadyCompleted) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void saveToSupabase(stepIndex, data, other);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [stepIndex, data, other, hydrated, submitted, alreadyCompleted, saveToSupabase]);

  const workflow = useMemo(() => buildDiagnosticWorkflow(data as Record<string, unknown>), [data]);
  const totalSteps = workflow.length;
  const current = workflow[stepIndex] ?? workflow[workflow.length - 1];
  const progress = submitted ? 100 : Math.round(((stepIndex + 1) / Math.max(1, totalSteps)) * 100);
  const serviceType = useMemo(
    () => getServiceTypeFromData(data as Record<string, unknown>),
    [data],
  );

  const update = useCallback(
    (id: string, value: Value) => {
      setData((prev) => persistForm({ ...prev, [id]: value }));
    },
    [persistForm],
  );

  const isStepValid = useMemo(() => {
    if (!current) return true;
    return current.fields.every((field) => {
      if (!field.required) return true;
      const value = data[field.id];
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === "string" && value.trim().length > 0;
    });
  }, [current, data]);

  const next = async () => {
    if (!isStepValid) return;

    if (stepIndex < totalSteps - 1) {
      setStepIndex((index) => index + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (profile) {
      try {
        const persistedData = persistForm(data);
        if (briefingId) {
          await supabase
            .from("briefings")
            .update({
              current_step: stepIndex,
              data: persistedData,
              other,
              completed: true,
              status: "Novo",
              updated_at: new Date().toISOString(),
            })
            .eq("id", briefingId);
        } else {
          const { data: newBriefing } = await supabase
            .from("briefings")
            .insert({
              profile_id: profile.id,
              current_step: stepIndex,
              data: persistedData,
              other,
              completed: true,
              status: "Novo",
            })
            .select()
            .single();

          if (newBriefing) {
            setBriefingId(newBriefing.id);
          }
        }
      } catch (err) {
        console.error("[BRIEFING] submission error:", err);
      }
    }

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    if (stepIndex > 0) {
      setStepIndex((index) => index - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const reset = () => {
    if (!confirm("Tem certeza que deseja apagar todas as respostas?")) return;
    setData({ form_version: NEW_FORM_VERSION });
    setOther({});
    setStepIndex(0);
    setSubmitted(false);
    if (briefingId) {
      void supabase.from("briefings").delete().eq("id", briefingId);
      setBriefingId(null);
    }
  };

  const startNew = () => {
    setData({ form_version: NEW_FORM_VERSION });
    setOther({});
    setStepIndex(0);
    setSubmitted(false);
    setBriefingId(null);
    setAlreadyCompleted(false);
  };

  const handleNewBriefing = async () => {
    if (!profile) return;

    const { data: newBriefing, error } = await supabase
      .from("briefings")
      .insert({
        profile_id: profile.id,
        current_step: 0,
        data: { form_version: NEW_FORM_VERSION },
        other: {},
      })
      .select()
      .single();

    if (error) {
      console.error("[BRIEFING] erro ao criar novo briefing:", error.message);
      return;
    }

    if (newBriefing) {
      setBriefingId(newBriefing.id);
      startNew();
      navigate({ to: "/briefing" });
    }
  };

  if (authLoading || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="min-h-screen px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <img
            src={logoSrc}
            alt="VNEXUS TEC"
            className="mx-auto h-auto w-72 object-contain drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]"
            draggable={false}
          />
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            ✓ Briefing concluído
          </div>
          <h1 className="mt-5 text-3xl font-bold sm:text-5xl">
            Você já concluiu este <span className="text-gradient-gold">briefing</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground sm:text-base">
            Nosso time já recebeu suas respostas e está trabalhando no próximo passo.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleNewBriefing}
              className="rounded-lg bg-gradient-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:scale-[1.02]"
            >
              Preencher novo briefing
            </button>
            <Link
              to="/"
              className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <ThankYou onNew={startNew} />;
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex flex-col items-center text-center">
          <img
            src={logoSrc}
            alt="VNEXUS TEC"
            className="h-auto w-72 object-contain drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]"
            draggable={false}
          />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-gradient-gold">
            Diagnóstico inicial ·{" "}
            {SERVICE_OPTIONS.find((option) => option.id === serviceType)?.label || "Melhor solução"}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            Vamos entender seu <span className="text-gradient-gold">projeto</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            As respostas vão guiar a melhor solução e manter o processo simples, claro e rápido no
            celular.
          </p>
        </header>

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>
              Etapa <span className="text-foreground">{stepIndex + 1}</span> de {totalSteps}
            </span>
            <span className="flex items-center gap-2">
              {saving && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />}
              <span className="text-gradient-gold">{progress}%</span>
            </span>
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-brand transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

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
                onChange={(value) => update(field.id, value)}
                onOtherChange={(value) => update(field.id, value)}
              />
            ))}

            {current.id === "resultado-revelado" && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Solução recomendada
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {SERVICE_OPTIONS.find((option) => option.id === serviceType)?.icon ?? "✨"}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {SERVICE_OPTIONS.find((option) => option.id === serviceType)?.label ??
                        "Solução personalizada"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {SERVICE_OPTIONS.find((option) => option.id === serviceType)?.description ??
                        "A solução ideal para seu caso."}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                {stepIndex === totalSteps - 1 ? "Finalizar →" : "Avançar →"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>{saving ? "Salvando..." : "Progresso salvo automaticamente"}</span>
          <button
            onClick={reset}
            className="underline-offset-2 hover:text-destructive hover:underline"
          >
            Limpar tudo
          </button>
        </div>
      </div>
    </div>
  );
}

function ThankYou({ onNew }: { onNew: () => void }) {
  return (
    <div className="min-h-screen px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <img
          src={logoSrc}
          alt="VNEXUS TEC"
          className="mx-auto h-auto w-72 object-contain drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]"
          draggable={false}
        />
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          ✓ Briefing recebido
        </div>
        <h1 className="mt-5 text-3xl font-bold sm:text-5xl">
          Obrigado! Recebemos seu <span className="text-gradient-gold">briefing</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground sm:text-base">
          Nossa equipe vai analisar suas respostas e entrará em contato em breve pelo WhatsApp ou
          e-mail informado.
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
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  onOtherChange,
}: {
  field: Field;
  value: Value | undefined;
  onChange: (v: Value) => void;
  onOtherChange: (v: string) => void;
}) {
  const inputCls =
    "w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary focus:bg-input/70 focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (field.type === "radio") {
    return (
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-accent">*</span>}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {field.options?.map((option) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={`min-h-14 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  selected
                    ? "border-primary bg-primary/12 text-foreground shadow-glow"
                    : "border-border bg-input/25 text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {field.allowOther && (
          <input
            type="text"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => {
              const nextValue = event.target.value;
              onOtherChange(nextValue);
              if (nextValue.trim()) onChange(nextValue);
            }}
            className={`${inputCls} mt-3`}
            placeholder="Outro"
          />
        )}
      </div>
    );
  }

  if (
    field.type === "text" ||
    field.type === "email" ||
    field.type === "tel" ||
    field.type === "url"
  ) {
    return (
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-accent">*</span>}
        </label>
        <input
          type={field.type}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={inputCls}
        />
      </div>
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        {field.label}
        {field.required && <span className="ml-1 text-accent">*</span>}
      </label>
      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className={`${inputCls} resize-y`}
      />
    </div>
  );
}
