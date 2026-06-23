import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logoSrc from "@/assets/vnexus-logo.svg";
import { useIdentification } from "@/lib/identification";

export const Route = createFileRoute("/")({
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
  component: LandingPage,
});

function LandingPage() {
  const { identify, loading } = useIdentification();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!phoneLast4.trim() || phoneLast4.trim().length !== 4 || !/^\d{4}$/.test(phoneLast4.trim())) {
      setError("Informe os 4 últimos dígitos do WhatsApp.");
      return;
    }

    setSubmitting(true);
    const profile = await identify(fullName.trim(), phoneLast4.trim());
    setSubmitting(false);

    if (profile) {
      navigate({ to: "/briefing" });
    } else {
      setError("Erro ao identificar. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <img
          src={logoSrc}
          alt="VNEXUS TEC"
          className="h-24 w-auto drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]"
        />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gradient-gold">
          Briefing · Landing Page
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
          Vamos criar sua <span className="text-gradient-gold">Landing Page</span>
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
          Informe seus dados para iniciar ou continuar seu briefing.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 w-full space-y-5">
          <div className="text-left">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="João da Silva"
              className="w-full rounded-lg border border-border bg-input/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary focus:bg-input/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={submitting}
            />
          </div>

          <div className="text-left">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Últimos 4 dígitos do WhatsApp
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={phoneLast4}
              onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ""))}
              placeholder="4587"
              className="w-full rounded-lg border border-border bg-input/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary focus:bg-input/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={submitting}
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className="group relative w-full overflow-hidden rounded-lg bg-gradient-brand px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative z-10">
              {submitting ? "Aguarde..." : "Continuar"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-gold opacity-0 transition group-hover:translate-x-0 group-hover:opacity-30" />
          </button>
        </form>

        <p className="mt-6 max-w-md text-xs text-muted-foreground">
          Ao continuar, você concorda que seus dados serão utilizados para elaboração do briefing e
          contato comercial pela VNEXUS TEC.
        </p>

        <div className="mt-20 border-t border-border/40 pt-8">
          <Link
            to="/admin"
            className="text-xs text-muted-foreground/50 transition hover:text-muted-foreground"
          >
            Área Administrativa
          </Link>
        </div>
      </div>
    </div>
  );
}
