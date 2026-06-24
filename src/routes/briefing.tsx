import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import logoSrc from "@/assets/vnexus-logo.webp";
import { steps, type Field } from "@/lib/briefing-schema";
import { useIdentification } from "@/lib/identification";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/briefing")({
  head: () => ({
    meta: [
      { title: "Briefing de Landing Page · VNEXUS TEC" },
      {
        name: "description",
        content:
          "Formulário inteligente para coleta de briefing de Landing Pages de alta conversão.",
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
  const [data, setData] = useState<FormState>({});
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
      console.log("[BRIEFING] carregando para profile:", profile.id);

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
        console.log("[BRIEFING] nenhum briefing encontrado");
        setHydrated(true);
        return;
      }

      const existing = list[0];

      if (existing.completed) {
        console.log("[BRIEFING] briefing já concluído:", existing.id);
        setAlreadyCompleted(true);
        setBriefingId(existing.id);
        setData((existing.data as FormState) || {});
        setOther((existing.other as Record<string, string>) || {});
        setHydrated(true);
        return;
      }

      console.log("[BRIEFING] briefing incompleto restaurado:", existing.id);
      setBriefingId(existing.id);
      setStepIndex(existing.current_step);
      setData((existing.data as FormState) || {});
      setOther((existing.other as Record<string, string>) || {});
      setHydrated(true);
    };

    loadBriefing();
  }, [profile]);

  const saveToSupabase = useCallback(
    async (step: number, formData: FormState, formOther: Record<string, string>) => {
      if (!profile || submitted) return;
      setSaving(true);

      try {
        if (briefingId) {
          await supabase
            .from("briefings")
            .update({
              current_step: step,
              data: formData,
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
              data: formData,
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
    [profile, briefingId, submitted],
  );

  useEffect(() => {
    if (!hydrated || submitted || alreadyCompleted) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveToSupabase(stepIndex, data, other);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [stepIndex, data, other, hydrated, submitted, alreadyCompleted, saveToSupabase]);

  const totalSteps = steps.length;
  const current = steps[stepIndex];
  const progress = submitted ? 100 : Math.round((stepIndex / totalSteps) * 100);

  const update = useCallback((id: string, v: Value) => {
    setData((d) => ({ ...d, [id]: v }));
  }, []);

  const isStepValid = useMemo(() => {
    return current.fields.every((f) => {
      if (!f.required) return true;
      const v = data[f.id];
      if (Array.isArray(v)) return v.length > 0;
      return typeof v === "string" && v.trim().length > 0;
    });
  }, [current, data]);

  const next = async () => {
    if (!isStepValid) return;
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (profile) {
        try {
          if (briefingId) {
            await supabase
              .from("briefings")
              .update({
                current_step: stepIndex,
                data,
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
                data,
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
    }
  };

  const prev = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const reset = () => {
    if (!confirm("Tem certeza que deseja apagar todas as respostas?")) return;
    setData({});
    setOther({});
    setStepIndex(0);
    setSubmitted(false);
    if (briefingId) {
      supabase.from("briefings").delete().eq("id", briefingId);
      setBriefingId(null);
    }
  };

  const startNew = () => {
    setData({});
    setOther({});
    setStepIndex(0);
    setSubmitted(false);
    setBriefingId(null);
    setAlreadyCompleted(false);
  };

  const handleNewBriefing = async () => {
    if (!profile) return;
    console.log("[BRIEFING] criando novo briefing para profile:", profile.id);
    const { data: newBriefing, error } = await supabase
      .from("briefings")
      .insert({
        profile_id: profile.id,
        current_step: 0,
        data: {},
        other: {},
      })
      .select()
      .single();

    if (error) {
      console.error("[BRIEFING] erro ao criar novo briefing:", error.message);
      return;
    }

    if (newBriefing) {
      console.log("[BRIEFING] novo briefing criado:", newBriefing.id);
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
            className="mx-auto w-72 h-auto object-contain drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]"
            draggable={false}
          />
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            ✓ Briefing concluído
          </div>
          <h1 className="mt-5 text-3xl font-bold sm:text-5xl">
            Você já concluiu este <span className="text-gradient-gold">briefing</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground sm:text-base">
            Nosso time já recebeu suas respostas. Se precisar de algo, estamos à disposição.
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
            className="w-72 h-auto object-contain drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]"
            draggable={false}
          />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-gradient-gold">
            Briefing · Landing Page
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            Vamos desenhar a sua próxima{" "}
            <span className="text-gradient-gold">página de alta conversão</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Leva menos de 8 minutos. Suas respostas são salvas automaticamente — você pode parar e
            voltar quando quiser.
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
                profileId={profile?.id || ""}
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
          className="mx-auto w-72 h-auto object-contain drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]"
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

        <p className="mt-16 text-xs text-muted-foreground">
          © {new Date().getFullYear()} VNEXUS TEC · Engenharia digital de alta conversão
        </p>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  other,
  onChange,
  onOtherChange,
  profileId,
}: {
  field: Field;
  value: Value | undefined;
  other: string;
  onChange: (v: Value) => void;
  onOtherChange: (v: string) => void;
  profileId: string;
}) {
  const [uploading, setUploading] = useState(false);
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
                  onClick={() => onChange(checked ? arr.filter((o) => o !== opt) : [...arr, opt])}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                    checked
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-input/30 text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/50"
                    }`}
                  >
                    {checked && (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
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
      const urls = Array.isArray(value) ? (value as string[]) : [];

      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0 || !profileId) return;

        setUploading(true);
        try {
          const uploadedUrls: string[] = [];
          for (const file of files) {
            try {
              const filePath = `${profileId}/${field.id}/${Date.now()}-${file.name}`;
              await supabase.storage.from("briefing_files").upload(filePath, file);
              const {
                data: { publicUrl },
              } = supabase.storage.from("briefing_files").getPublicUrl(filePath);
              uploadedUrls.push(publicUrl);
            } catch (err) {
              console.error("[BRIEFING] upload error for file:", file.name, err);
            }
          }
          if (uploadedUrls.length > 0) {
            onChange([...urls, ...uploadedUrls]);
          }
        } finally {
          setUploading(false);
        }
        e.target.value = "";
      };

      return (
        <div>
          {labelEl}
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-input/20 px-6 py-8 text-center transition hover:border-primary hover:bg-input/40">
            <svg
              className="h-8 w-8 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium text-foreground">
              {uploading ? "Enviando..." : "Clique para enviar arquivos"}
            </span>
            <span className="text-xs text-muted-foreground">ou arraste e solte aqui</span>
            <input
              type="file"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
          {urls.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {urls.map((url, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-input/30 px-3 py-2 text-xs"
                >
                  <span className="truncate font-medium text-foreground">
                    {url.split("/").pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
          {uploading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Enviando arquivos...
            </div>
          )}
          {hintEl}
        </div>
      );
    }
  }
}
