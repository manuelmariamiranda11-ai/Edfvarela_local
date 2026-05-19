import { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "wouter";
import * as XLSX from "xlsx";
import { LogOut, Download, Search, ArrowUpDown, Check, Trash2, XCircle, Settings2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type Registration, getRegistrations, deleteRegistration,
  updateScores, toggleAbsent, toggleArbitro, isAdminLoggedIn, adminLogout, getCurrentTeacher, deleteTeacher,
} from "@/lib/storage";
import { ESCALOES } from "@/lib/event-config";

type SortKey = "name" | "birthYear" | "className" | "escalao";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [filterEscalao, setFilterEscalao] = useState("Todos");
  const [filterGender, setFilterGender] = useState("Todos");

  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const teacher = getCurrentTeacher();

  useEffect(() => {
    if (!isAdminLoggedIn()) { setLocation("/admin/login"); return; }
    setRegistrations(getRegistrations());
  }, [setLocation]);

  const refresh = useCallback(() => setRegistrations(getRegistrations()), []);
  const handleLogout = () => { adminLogout(); setLocation("/admin/login"); };
  const handleDeleteAccount = () => {
    if (!confirmDeleteAccount) { setConfirmDeleteAccount(true); setTimeout(() => setConfirmDeleteAccount(false), 4000); return; }
    if (teacher) { deleteTeacher(teacher.id); setLocation("/admin/login"); }
  };

  const filtered = registrations
    .filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.className.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEscalao = filterEscalao === "Todos" || r.escalao === filterEscalao;
      const matchGender = filterGender === "Todos" || r.gender === filterGender;
      return matchSearch && matchEscalao && matchGender;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "birthYear") return a.birthYear - b.birthYear;
      if (sortBy === "escalao") return ESCALOES.indexOf(a.escalao) - ESCALOES.indexOf(b.escalao);
      return a.className.localeCompare(b.className) || a.name.localeCompare(b.name);
    });

  const allActivities = Array.from(new Set(registrations.flatMap((r) => r.selectedActivities))).sort();

  const handleExportExcel = () => {
    const headers = ["Nome", "Escalão", "Género", "Ano Nasc.", "Ano/Turma", "Atividades", ...allActivities, "Média"];
    const rows = filtered.map((reg) => [
      reg.name, reg.escalao,
      reg.gender === "M" ? "Masculino" : "Feminino",
      reg.birthYear, `${reg.schoolYear} ${reg.className}`,
      reg.selectedActivities.join(", "),
      ...allActivities.map((act) => reg.selectedActivities.includes(act) ? (reg.activityScores[act] ?? "") : "N/A"),
      reg.average !== null ? Number(reg.average).toFixed(2) : "",
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados EDF");
    XLSX.writeFile(wb, "resultados_edf.xlsx");
  };

  const sortLabels: Record<SortKey, string> = { name: "A-Z", birthYear: "Nasc.", className: "Turma", escalao: "Escalão" };
  const cycleSorts: SortKey[] = ["name", "escalao", "birthYear", "className"];
  const cycleSort = () => { const idx = cycleSorts.indexOf(sortBy); setSortBy(cycleSorts[(idx + 1) % cycleSorts.length]); };

  const total = registrations.length;
  const males = registrations.filter((r) => r.gender === "M").length;
  const females = registrations.filter((r) => r.gender === "F").length;
  const byEscalao = ESCALOES.map((e) => ({ e, count: registrations.filter((r) => r.escalao === e).length })).filter((x) => x.count > 0);

  if (!teacher) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo-escola.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-display font-bold text-base leading-tight">Gestão EDF</p>
              <p className="text-xs text-muted-foreground leading-tight">{teacher.displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/setup">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Settings2 className="w-4 h-4 mr-2" /> Configurar Evento
              </Button>
            </Link>
            <ThemeToggle />
            <button onClick={handleDeleteAccount}
              className={`h-9 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                confirmDeleteAccount
                  ? "bg-destructive border-destructive text-white animate-pulse"
                  : "border-border text-muted-foreground hover:text-destructive hover:border-destructive/40"
              }`}>
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{confirmDeleteAccount ? "Tens a certeza?" : "Apagar conta"}</span>
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-2xl px-5 py-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total</p>
            <p className="text-3xl font-display font-bold">{total}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl px-5 py-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Masculino</p>
            <p className="text-3xl font-display font-bold text-blue-500">{males}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl px-5 py-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Feminino</p>
            <p className="text-3xl font-display font-bold text-pink-500">{females}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl px-5 py-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Por Escalão</p>
            <div className="flex flex-wrap gap-1">
              {byEscalao.length === 0
                ? <span className="text-muted-foreground text-xs">—</span>
                : byEscalao.map(({ e, count }) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {e.slice(0, 3)}: {count}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Pesquisar aluno ou turma..." className="pl-10 h-11"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cycleSort} className="bg-background">
                <ArrowUpDown className="w-4 h-4 mr-2" /> {sortLabels[sortBy]}
              </Button>
              <Button onClick={handleExportExcel} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Download className="w-4 h-4 mr-2" /> Excel
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Escalão:</span>
            {["Todos", ...ESCALOES].map((e) => (
              <button key={e} onClick={() => setFilterEscalao(e)}
                className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${
                  filterEscalao === e ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                }`}>{e}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Género:</span>
            {[["Todos", "Todos"], ["M", "Masculino"], ["F", "Feminino"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilterGender(val)}
                className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${
                  filterGender === val ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                }`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Aluno</th>
                  <th className="px-4 py-3 text-center">Escalão</th>
                  <th className="px-4 py-3 text-center">Género</th>
                  <th className="px-4 py-3 text-center">Ano/Turma</th>
                  {allActivities.map((act) => (
                    <th key={act} className="px-3 py-3 text-center min-w-[90px]">{act}</th>
                  ))}
                  <th className="px-4 py-3 text-center font-bold text-primary">Média</th>
                  <th className="px-3 py-3 text-center text-orange-500 font-bold">Árbitro</th>
                  <th className="px-3 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6 + allActivities.length} className="px-6 py-12 text-center text-muted-foreground">
                    {total === 0 ? "Nenhuma inscrição ainda. Gera o QR Code em \"Configurar Evento\"." : "Nenhuma inscrição encontrada."}
                  </td></tr>
                ) : (
                  filtered.map((reg) => (
                    <RegistrationRow key={reg.id} registration={reg} allActivities={allActivities} onSaved={refresh} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function RegistrationRow({ registration, allActivities, onSaved }: {
  registration: Registration; allActivities: string[]; onSaved: () => void;
}) {
  const [scores, setScores] = useState<Record<string, number | "">>(() => {
    const s: Record<string, number | ""> = {};
    allActivities.forEach((act) => { s[act] = registration.activityScores[act] ?? ""; });
    return s;
  });
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isAbsent = registration.absent;

  const handleScoreChange = (act: string, value: string) => {
    if (value !== "" && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) return;
    setScores((prev) => ({ ...prev, [act]: value === "" ? "" : value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    const updated: Record<string, number | null> = {};
    allActivities.forEach((act) => { updated[act] = scores[act] !== "" ? Number(scores[act]) : null; });
    updateScores(registration.id, updated);
    setIsDirty(false);
    onSaved();
  };

  const handleToggleAbsent = () => { toggleAbsent(registration.id, !isAbsent); onSaved(); };
  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    deleteRegistration(registration.id); onSaved();
  };

  const calcLocalAverage = () => {
    const values = registration.selectedActivities
      .map((act) => scores[act])
      .map((v) => (v !== "" && v !== undefined ? Number(v) : null))
      .filter((v): v is number => v !== null);
    if (values.length === 0) return "--";
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const genderColor = registration.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700";

  return (
    <tr className={`hover:bg-muted/30 transition-colors ${isAbsent ? "opacity-60" : ""}`}>
      <td className="px-4 py-3 font-medium whitespace-nowrap">
        <div className="flex items-center gap-2">
          {isAbsent && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-bold"><XCircle className="w-3 h-3" /> Falta</span>}
          {registration.name}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex px-2 py-1 rounded-md bg-secondary/15 text-secondary text-xs font-bold">{registration.escalao}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${genderColor}`}>
          {registration.gender === "M" ? "♂ M" : "♀ F"}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-bold">
          {registration.schoolYear} {registration.className}
        </span>
      </td>
      {allActivities.map((act) => {
        const isSelected = registration.selectedActivities.includes(act);
        return (
          <td key={act} className="px-2 py-3">
            {isSelected ? (
              <Input value={scores[act]} onChange={(e) => handleScoreChange(act, e.target.value)}
                disabled={isAbsent} className="w-16 h-9 text-center px-1 font-mono mx-auto disabled:opacity-40" placeholder="-" />
            ) : (
              <div className="w-16 h-9 mx-auto flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground/40 text-xs font-semibold">N/A</div>
            )}
          </td>
        );
      })}
      <td className="px-4 py-3 text-center font-display font-bold text-lg text-primary">
        {isAbsent ? <XCircle className="w-5 h-5 text-destructive mx-auto" />
          : isDirty ? calcLocalAverage()
          : registration.average !== null ? Number(registration.average).toFixed(1) : "--"}
      </td>
      <td className="px-3 py-3 text-center">
        <button
          onClick={() => { toggleArbitro(registration.id, !registration.arbitro); onSaved(); }}
          title={registration.arbitro ? "Remover árbitro" : "Marcar como árbitro"}
          className={`h-8 px-3 rounded-lg border text-xs font-bold transition-all ${
            registration.arbitro
              ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/30"
              : "border-border text-muted-foreground hover:border-orange-400 hover:text-orange-500"
          }`}>
          {registration.arbitro ? "✓ Árb." : "Árb."}
        </button>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          {isDirty && <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0" title="Guardar"><Check className="w-4 h-4" /></Button>}
          <button onClick={handleToggleAbsent}
            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors ${
              isAbsent ? "bg-destructive/15 border-destructive/30 text-destructive" : "border-border text-muted-foreground hover:text-destructive hover:border-destructive/30"
            }`}><XCircle className="w-4 h-4" /></button>
          <button onClick={handleDelete}
            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors ${
              confirmDelete ? "bg-destructive border-destructive text-white animate-pulse" : "border-border text-muted-foreground hover:text-destructive hover:border-destructive/30"
            }`}><Trash2 className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  );
}
