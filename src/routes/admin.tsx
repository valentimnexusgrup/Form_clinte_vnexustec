import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import logoAsset from "@/assets/vnexus-logo.png.asset.json";
import {
  buildBriefing,
  deleteSubmission,
  loadSubmissions,
  Summary,
  updateSubmissionStatus,
  type Submission,
  type SubmissionStatus,
} from "@/lib/briefing-summary";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · VNEXUS TEC" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

const ADMIN_EMAIL = "elielvalentim.dev@gmail.com";
const SESSION_KEY = "vnexus.admin.session.v1";

const STATUS_OPTIONS: SubmissionStatus[] = [
  "Novo",
  "Em análise",
  "Aguardando cliente",
  "Aprovado",
  "Concluído",
];

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  Novo: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Em análise": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Aguardando cliente": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Aprovado: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Concluído: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SubmissionStatus | "Todos">("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
    setSubmissions(loadSubmissions());
    setHydrated(true);
  }, []);

  const refresh = () => setSubmissions(loadSubmissions());

  const handleLogin = (email: string) => {
    if (email.trim().toLowerCase() === ADMIN_EMAIL) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setSelectedId(null);
  };

  const changeStatus = (id: string, status: SubmissionStatus) => {
    updateSubmissionStatus(id, status);
    refresh();
  };

  const filtered = submissions.filter((s) => {
    const matchesStatus = filter === "Todos" || s.status === filter;
    const term = search.trim().toLowerCase();
    const name = String(s.data["nome"] || "").toLowerCase();
    const email = String(s.data["email"] || "").toLowerCase();
    const business = String(s.data["empresa"] || "").toLowerCase();
    const matchesSearch = !term || name.includes(term) || email.includes(term) || business.includes(term);
    return matchesStatus && matchesSearch;
  });

  if (!hydrated) return null;
  if (!authed) return <LoginGate onLogin={handleLogin} />;

  const selected = submissions.find((s) => s.id === selectedId);
  if (selected) {
    const clientName = selected.data["nome"] as string | undefined;
    return (
      <Summary
        data={selected.data}
        title={`Briefing · ${clientName || new Date(selected.createdAt).toLocaleString("pt-BR")}`}
        subtitle={`Recebido em ${new Date(selected.createdAt).toLocaleString("pt-BR")} · Status: ${selected.status}`}
        actions={
          <>
            <button
              onClick={() => setSelectedId(null)}
              className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              ← Voltar à lista
            </button>
            <button
              onClick={() => {
                if (!confirm("Excluir este briefing permanentemente?")) return;
                deleteSubmission(selected.id);
                setSelectedId(null);
                refresh();
              }}
              className="rounded-lg border border-destructive/40 px-6 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            >
              Excluir
            </button>
          </>
        }
      />
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={logoAsset.url} alt="VNEXUS TEC" className="h-12 w-auto" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gradient-gold">Painel Admin</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Briefings recebidos</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:border-destructive hover:text-destructive"
          >
            Sair
          </button>
        </header>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, e-mail ou empresa..."
                className="w-full rounded-lg border border-border bg-input/40 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary focus:bg-input/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filtrar status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as SubmissionStatus | "Todos")}
              className="rounded-lg border border-border bg-input/40 px-3 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="Todos">Todos</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filtered.length} {filtered.length === 1 ? "briefing" : "briefings"} encontrado
            {filtered.length !== 1 && "s"}
          </span>
          <span>
            Total: {submissions.length}
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-gradient-surface p-16 text-center">
            <p className="text-sm text-muted-foreground">Nenhum briefing recebido ainda.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-gradient-surface p-16 text-center">
            <p className="text-sm text-muted-foreground">Nenhum briefing corresponde ao filtro.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-surface shadow-glow">
            <div className="grid grid-cols-12 gap-4 border-b border-border/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-5 sm:col-span-4">Cliente</div>
              <div className="col-span-3 hidden sm:block">Recebido em</div>
              <div className="col-span-3 sm:col-span-2">Status</div>
              <div className="col-span-4 sm:col-span-3 text-right">Ações</div>
            </div>
            <ul>
              {filtered.map((s) => {
                const name = s.data["nome"] as string | undefined;
                const email = s.data["email"] as string | undefined;
                const business = s.data["empresa"] as string | undefined;
                const date = new Date(s.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
                return (
                  <li key={s.id} className="border-b border-border/40 last:border-0">
                    <div className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition hover:bg-primary/5">
                      <div className="col-span-5 sm:col-span-4 min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">{name || "Cliente sem nome"}</p>
                        <p className="truncate text-xs text-muted-foreground">{business || email || "—"}</p>
                      </div>
                      <div className="col-span-3 hidden sm:block text-xs text-muted-foreground">{date}</div>
                      <div className="col-span-3 sm:col-span-2">
                        <select
                          value={s.status}
                          onChange={(e) => changeStatus(s.id, e.target.value as SubmissionStatus)}
                          className={`w-full rounded-md border px-2 py-1.5 text-xs font-semibold outline-none transition ${STATUS_STYLES[s.status]}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedId(s.id)}
                          className="rounded-md bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                          title="Abrir briefing"
                        >
                          Abrir
                        </button>
                        <CopyButton data={s.data} />
                        <button
                          onClick={() => {
                            if (!confirm("Excluir este briefing permanentemente?")) return;
                            deleteSubmission(s.id);
                            refresh();
                          }}
                          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                          title="Excluir"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          🔒 Acesso restrito · Os briefings ficam salvos apenas neste dispositivo
        </p>
      </div>
    </div>
  );
}

function CopyButton({ data }: { data: Submission["data"] }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(buildBriefing(data));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
        copied
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-accent/15 text-accent hover:bg-accent hover:text-primary-foreground"
      }`}
      title="Copiar briefing"
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

function LoginGate({ onLogin }: { onLogin: (email: string) => boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(email)) {
      setError("E-mail não autorizado. Apenas o administrador pode acessar.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logoAsset.url} alt="VNEXUS TEC" className="h-16 w-auto drop-shadow-[0_0_30px_rgba(15,76,255,0.35)]" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-gradient-gold">Área Restrita</p>
          <h1 className="mt-2 text-2xl font-bold">Acesso do administrador</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre com sua conta Google autorizada.</p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-glow sm:p-8"
        >
          <label className="mb-2 block text-sm font-semibold text-foreground">E-mail Google</label>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="seuemail@gmail.com"
            className="w-full rounded-lg border border-border bg-input/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary focus:bg-input/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {error && <p className="mt-3 text-xs font-medium text-destructive">{error}</p>}

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:scale-[1.01]"
          >
            <GoogleIcon /> Entrar com Google
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          🔒 Apenas o e-mail autorizado tem acesso a esta área.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.7 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.66 4.34 14.55 3.5 12 3.5 6.98 3.5 2.9 7.58 2.9 12.6s4.08 9.1 9.1 9.1c5.25 0 8.73-3.69 8.73-8.88 0-.6-.06-1.05-.18-1.72z" />
    </svg>
  );
}
