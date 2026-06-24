import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import logoSrc from "@/assets/vnexus-logo.webp";
import { useIdentification } from "@/lib/identification";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { steps } from "@/lib/briefing-schema";
import { buildBriefing, type FormState } from "@/lib/briefing-summary";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração · VNEXUS TEC" },
      {
        name: "description",
        content: "Painel administrativo do sistema de briefing VNEXUS TEC.",
      },
    ],
  }),
  component: AdminPage,
});

type BriefingRow = {
  id: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  current_step: number;
  completed: boolean;
  status: string | null;
  data: Record<string, unknown>;
  other: Record<string, unknown>;
  profiles?: {
    full_name: string;
  };
};

const STATUS_OPTIONS = [
  "Novo",
  "Em análise",
  "Em produção",
  "Aguardando aprovação",
  "Aprovado",
  "Arquivado",
];

const ADMIN_USERS = [{ full_name: "Admin VNEXUS", phone_last4: "{0203}" }];

function AdminPage() {
  const {
    profile,
    loading: authLoading,
    identify,
    setProfile,
    clearIdentification,
  } = useIdentification();
  const navigate = useNavigate();

  const [briefings, setBriefings] = useState<BriefingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const isAdmin = profile
    ? ADMIN_USERS.some(
        (u) => u.full_name === profile.full_name && u.phone_last4 === profile.phone_last4,
      )
    : false;

  useEffect(() => {
    if (!authLoading && profile && !isAdmin) {
      navigate({ to: "/" });
    }
  }, [authLoading, profile, isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;
      setLoading(true);

      const query = supabase
        .from("briefings")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      const { data } = await query;
      if (data) {
        setBriefings(data as unknown as BriefingRow[]);
      }
      setLoading(false);
    };

    fetchData();
  }, [isAdmin]);

  const filtered = briefings.filter((b) => {
    const searchLower = search.toLowerCase();
    const nameMatch = b.profiles?.full_name?.toLowerCase().includes(searchLower);
    const statusMatch = !statusFilter || b.status === statusFilter;
    return (nameMatch || !search) && statusMatch;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("briefings").update({ status }).eq("id", id);
    setBriefings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const deleteBriefing = async (id: string) => {
    if (!confirm("Excluir este briefing permanentemente?")) return;
    await supabase.from("briefings").delete().eq("id", id);
    setBriefings((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");

    const name = adminName.trim();
    const identifier = adminPhone.trim();

    if (!name) {
      setAdminError("Informe o nome do administrador.");
      return;
    }
    if (!identifier) {
      setAdminError("Informe o identificador.");
      return;
    }

    console.log("[ADMIN] login iniciado:", name, identifier);

    const matched = ADMIN_USERS.find((u) => u.full_name === name && u.phone_last4 === identifier);

    if (!matched) {
      console.warn("[ADMIN] credenciais inválidas:", name, identifier);
      setAdminError("Credenciais administrativas inválidas.");
      return;
    }

    console.log("[ADMIN] credenciais válidas, acesso liberado");
    clearIdentification();
    setProfile({
      id: "admin",
      full_name: matched.full_name,
      phone_last4: matched.phone_last4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setAdminSubmitting(false);
    navigate({ to: "/admin" });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile || !isAdmin) {
    return (
      <div className="min-h-screen px-4 py-10 sm:py-16">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <img
            src={logoSrc}
            alt="VNEXUS TEC"
            className="w-80 h-auto object-contain drop-shadow-[0_0_20px_rgba(15,76,255,0.35)]"
            draggable={false}
          />
          <h1 className="mt-6 text-2xl font-bold">Área Administrativa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Identifique-se para acessar o painel.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-8 w-full space-y-4">
            <div className="text-left">
              <label
                htmlFor="admin-name"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Nome
              </label>
              <input
                id="admin-name"
                name="admin-name"
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Digite seu nome"
                className="w-full rounded-lg border border-border bg-input/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary focus:bg-input/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={adminSubmitting}
              />
            </div>
            <div className="text-left">
              <label
                htmlFor="admin-identifier"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Identificador
              </label>
              <input
                id="admin-identifier"
                name="admin-identifier"
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="Digite seu identificador"
                className="w-full rounded-lg border border-border bg-input/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary focus:bg-input/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={adminSubmitting}
              />
            </div>
            {adminError && <p className="text-xs font-medium text-destructive">{adminError}</p>}
            <button
              type="submit"
              disabled={adminSubmitting}
              className="group relative w-full overflow-hidden rounded-lg bg-gradient-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative z-10">
                {adminSubmitting ? "Aguarde..." : "Acessar painel"}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-gold opacity-0 transition group-hover:translate-x-0 group-hover:opacity-30" />
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/"
              className="text-xs text-muted-foreground/50 transition hover:text-muted-foreground"
            >
              Voltar ao início
            </Link>
            <button
              onClick={() => {
                clearIdentification();
                setAdminError("");
              }}
              className="text-xs text-muted-foreground/50 transition hover:text-destructive"
            >
              Limpar cache
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selected = briefings.find((b) => b.id === selectedId);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <img
              src={logoSrc}
              alt="VNEXUS TEC"
              className="w-56 h-auto object-contain drop-shadow-[0_0_20px_rgba(15,76,255,0.35)]"
              draggable={false}
            />
            <div>
              <h1 className="text-2xl font-bold">Administração</h1>
              <p className="text-xs text-muted-foreground">
                {briefings.length} briefing{briefings.length !== 1 && "s"} registrado
                {briefings.length !== 1 && "s"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{profile.full_name}</span>
            <Link
              to="/"
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              Início
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px]">
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Buscar por nome do cliente…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.245_264)]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-input/40 px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-44"
              >
                <option value="">Todos os status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center">
                <p className="text-sm text-muted-foreground">Nenhum briefing encontrado.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border/60">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Perfil</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Progresso</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Data</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filtered.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedId(b.id)}
                        className={`cursor-pointer transition hover:bg-muted/20 ${
                          selectedId === b.id ? "bg-accent/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-[10px] font-bold uppercase text-primary-foreground">
                              {b.profiles?.full_name?.charAt(0).toUpperCase() ||
                                b.profile_id?.charAt(0).toUpperCase() ||
                                "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {b.profiles?.full_name || "—"}
                              </p>
                              {b.profile_id && (
                                <p className="truncate text-[10px] text-muted-foreground">
                                  {b.profile_id}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status || "Novo"} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">
                            {b.completed
                              ? "Completo"
                              : `Etapa ${b.current_step + 1}/${steps.length}`}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                          {new Date(b.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBriefing(b.id);
                            }}
                            className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                            title="Excluir"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            {selected ? (
              <BriefingDetail
                briefing={selected}
                onStatusChange={(s: string) => updateStatus(selected.id, s)}
                onBack={() => setSelectedId(null)}
              />
            ) : (
              <div className="sticky top-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
                <p className="text-sm text-muted-foreground">
                  Selecione um briefing para ver detalhes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Novo: "bg-blue-500/20 text-blue-400",
    "Em análise": "bg-yellow-500/20 text-yellow-400",
    "Em produção": "bg-purple-500/20 text-purple-400",
    "Aguardando aprovação": "bg-orange-500/20 text-orange-400",
    Aprovado: "bg-green-500/20 text-green-400",
    Arquivado: "bg-muted-foreground/20 text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
        map[status] || "bg-muted/40 text-muted-foreground"
      }`}
    >
      {status || "Novo"}
    </span>
  );
}

function BriefingDetail({
  briefing,
  onStatusChange,
  onBack,
}: {
  briefing: BriefingRow;
  onStatusChange: (s: string) => void;
  onBack: () => void;
}) {
  const data = briefing.data as Record<string, string | string[]>;
  const [copied, setCopied] = useState(false);

  const fileFieldIds = new Set(
    steps.flatMap((s) => s.fields.filter((f) => f.type === "file").map((f) => f.id)),
  );

  const handleCopyIA = useCallback(async () => {
    const markdown = buildBriefing(data as FormState, {
      clientName: briefing.profiles?.full_name || undefined,
      date: briefing.created_at,
    });
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data, briefing.profiles?.full_name, briefing.created_at]);

  const isImageUrl = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
  const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(url);
  const getFileName = (url: string) => url.split("/").pop() || "arquivo";

  const renderFileValue = (val: string | string[]) => {
    const urls = Array.isArray(val) ? val : [val];
    return (
      <div className="flex flex-col gap-2">
        {urls.map((url, i) => {
          if (!url || typeof url !== "string") return null;
          return (
            <div
              key={i}
              className="flex flex-col gap-1.5 rounded-lg border border-border/40 bg-muted/20 p-2"
            >
              {isImageUrl(url) ? (
                <img
                  src={url}
                  alt={getFileName(url)}
                  className="max-h-48 w-full rounded object-contain"
                  loading="lazy"
                />
              ) : isVideoUrl(url) ? (
                <video controls className="max-h-48 w-full rounded" preload="metadata">
                  <source src={url} />
                </video>
              ) : null}
              <div className="flex items-center gap-2">
                <span className="truncate text-xs text-muted-foreground">{getFileName(url)}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-primary/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary transition hover:bg-primary/30"
                >
                  <Download className="h-3 w-3" />
                  Baixar
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="sticky top-10 rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-glow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Detalhes do Briefing</h2>
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Voltar
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </label>
        <select
          value={briefing.status || "Novo"}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 rounded-lg border border-border/40 bg-muted/20 p-3">
        <p className="text-xs font-semibold text-muted-foreground">ID do Perfil</p>
        <p className="text-sm font-medium">{briefing.profile_id || "—"}</p>
      </div>

      <div className="mb-4 text-xs text-muted-foreground">
        <p>Criado em: {new Date(briefing.created_at).toLocaleString("pt-BR")}</p>
        <p>Atualizado em: {new Date(briefing.updated_at).toLocaleString("pt-BR")}</p>
      </div>

      <button
        onClick={handleCopyIA}
        className="mb-5 w-full rounded-lg bg-gradient-gold px-4 py-3 text-sm font-bold uppercase tracking-wider text-graphite shadow-gold transition hover:scale-[1.02]"
      >
        {copied ? "✅ Copiado!" : "📋 Copiar briefing para IA"}
      </button>

      <div className="space-y-4">
        {steps.map((step) => {
          const stepData = step.fields
            .map((field) => {
              const val = data[field.id];
              if (!val) return null;
              return (
                <div key={field.id} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {field.label}
                  </p>
                  {fileFieldIds.has(field.id) ? (
                    renderFileValue(val)
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {Array.isArray(val) ? val.join(", ") : val || "—"}
                    </p>
                  )}
                </div>
              );
            })
            .filter(Boolean);

          if (stepData.length === 0) return null;

          return (
            <div key={step.id}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gradient-gold">
                {step.title}
              </h3>
              <div className="space-y-2">{stepData}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
