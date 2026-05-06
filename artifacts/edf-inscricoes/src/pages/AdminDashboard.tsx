import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import * as XLSX from "xlsx";
import { 
  LogOut, 
  Download, 
  Search, 
  ArrowUpDown, 
  Check, 
  UserCircle,
  Trash2,
  XCircle
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

import { 
  useListRegistrations, 
  useUpdateScores, 
  useAdminLogout,
  useAdminMe,
  useDeleteRegistration,
  useToggleAbsent,
  type Registration
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "birthYear" | "className">("name");

  // Auth Check
  const { data: authData, isLoading: isAuthLoading, isError: isAuthError } = useAdminMe({
    query: { retry: false }
  });

  const { data: registrations = [], isLoading, refetch } = useListRegistrations({
    query: { enabled: !!authData }
  });
  
  const logoutMutation = useAdminLogout();

  useEffect(() => {
    if (!isAuthLoading && isAuthError) {
      setLocation("/admin/login");
    }
  }, [isAuthLoading, isAuthError, setLocation]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/admin/login");
  };

  const handleExportExcel = () => {
    const headers = ["Nome", "Ano de Nascimento", "Ano de Escolaridade", "Turma", "Atividade 1", "Atividade 2", "Atividade 3", "Atividade 4", "Atividade 5", "Média"];

    const rows = filteredAndSortedData.map((reg, idx) => {
      const rowNum = idx + 2; // Excel rows start at 1, row 1 is header
      return [
        reg.name,
        reg.birthYear,
        reg.schoolYear,
        reg.className,
        reg.activity1 !== null ? reg.activity1 : "",
        reg.activity2 !== null ? reg.activity2 : "",
        reg.activity3 !== null ? reg.activity3 : "",
        reg.activity4 !== null ? reg.activity4 : "",
        reg.activity5 !== null ? reg.activity5 : "",
        { t: 'n' as const, f: `IFERROR(AVERAGE(E${rowNum}:I${rowNum}),"")` },
      ];
    });

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 10 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 10 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados EDF");
    XLSX.writeFile(wb, "resultados_edf.xlsx");
  };

  if (isAuthLoading || !authData) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  const cycleSort = () => {
    setSortBy(prev =>
      prev === "name" ? "birthYear" : prev === "birthYear" ? "className" : "name"
    );
  };

  const sortLabel = sortBy === "name" ? "A-Z" : sortBy === "birthYear" ? "Ano Nasc." : "Turma";

  // Filter and Sort
  const filteredAndSortedData = [...registrations]
    .filter(reg => reg.name.toLowerCase().includes(searchTerm.toLowerCase()) || reg.className.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "birthYear") return a.birthYear - b.birthYear;
      return a.className.localeCompare(b.className) || a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo-escola.png"
              alt="Agrupamento de Escolas de Montijo"
              className="w-10 h-10 object-contain"
            />
            <span className="font-display font-bold text-xl hidden sm:block">Gestão EDF</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm font-medium text-muted-foreground">
              <UserCircle className="w-4 h-4" />
              Admin
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex-1 w-full relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar aluno ou turma..." 
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={cycleSort}
              className="flex-1 sm:flex-none bg-background"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Ordenar: {sortLabel}
            </Button>

            <Button onClick={handleExportExcel} className="flex-1 sm:flex-none bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Aluno</th>
                  <th className="px-6 py-4 text-center">Nasc.</th>
                  <th className="px-6 py-4 text-center">Ano/Turma</th>
                  <th className="px-4 py-4 text-center w-20">Ativ. 1</th>
                  <th className="px-4 py-4 text-center w-20">Ativ. 2</th>
                  <th className="px-4 py-4 text-center w-20">Ativ. 3</th>
                  <th className="px-4 py-4 text-center w-20">Ativ. 4</th>
                  <th className="px-4 py-4 text-center w-20">Ativ. 5</th>
                  <th className="px-6 py-4 text-center font-bold text-primary">Média</th>
                  <th className="px-4 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                      A carregar inscrições...
                    </td>
                  </tr>
                ) : filteredAndSortedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhuma inscrição encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData.map((reg) => (
                    <RegistrationRow 
                      key={reg.id} 
                      registration={reg} 
                      onSaved={() => refetch()} 
                    />
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


// Internal component for row state management
function RegistrationRow({ registration, onSaved }: { registration: Registration, onSaved: () => void }) {
  const [scores, setScores] = useState({
    activity1: registration.activity1 ?? "",
    activity2: registration.activity2 ?? "",
    activity3: registration.activity3 ?? "",
    activity4: registration.activity4 ?? "",
    activity5: registration.activity5 ?? "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateMutation = useUpdateScores();
  const deleteMutation = useDeleteRegistration();
  const absentMutation = useToggleAbsent();

  const isAbsent = registration.absent;

  const handleScoreChange = (field: keyof typeof scores, value: string) => {
    if (value !== "" && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) return;
    setScores(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const payload = {
      activity1: scores.activity1 !== "" ? Number(scores.activity1) : null,
      activity2: scores.activity2 !== "" ? Number(scores.activity2) : null,
      activity3: scores.activity3 !== "" ? Number(scores.activity3) : null,
      activity4: scores.activity4 !== "" ? Number(scores.activity4) : null,
      activity5: scores.activity5 !== "" ? Number(scores.activity5) : null,
    };
    try {
      await updateMutation.mutateAsync({ id: registration.id, data: payload });
      setIsDirty(false);
      onSaved();
    } catch (e) {
      console.error("Failed to save scores");
    }
  };

  const handleToggleAbsent = async () => {
    try {
      await absentMutation.mutateAsync({ id: registration.id, data: { absent: !isAbsent } });
      onSaved();
    } catch (e) {
      console.error("Failed to toggle absent");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id: registration.id });
      onSaved();
    } catch (e) {
      console.error("Failed to delete");
    }
  };

  const calcLocalAverage = () => {
    const values = Object.values(scores).map(v => v !== "" ? Number(v) : null).filter(v => v !== null) as number[];
    if (values.length === 0) return "--";
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  return (
    <tr className={`hover:bg-muted/30 transition-colors group ${isAbsent ? "opacity-60" : ""}`}>
      <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
        <div className="flex items-center gap-2">
          {isAbsent && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-bold">
              <XCircle className="w-3 h-3" /> Falta
            </span>
          )}
          {registration.name}
        </div>
      </td>
      <td className="px-6 py-4 text-center text-muted-foreground">
        {registration.birthYear}
      </td>
      <td className="px-6 py-4 text-center text-muted-foreground">
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-bold">
          {registration.schoolYear} {registration.className}
        </span>
      </td>

      {/* Score Inputs */}
      {(['activity1', 'activity2', 'activity3', 'activity4', 'activity5'] as const).map((act) => (
        <td key={act} className="px-2 py-4">
          <Input
            value={scores[act]}
            onChange={(e) => handleScoreChange(act, e.target.value)}
            disabled={isAbsent}
            className="w-16 h-9 text-center px-1 font-mono mx-auto disabled:opacity-40"
            placeholder="-"
          />
        </td>
      ))}

      <td className="px-6 py-4 text-center font-display font-bold text-lg text-primary">
        {isAbsent ? <XCircle className="w-5 h-5 text-destructive mx-auto" /> :
          (isDirty ? calcLocalAverage() : (registration.average !== null ? Number(registration.average).toFixed(1) : "--"))}
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-1">
          {/* Save scores button */}
          {isDirty && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="h-8 w-8 p-0 shadow-md shadow-primary/20"
              title="Guardar notas"
            >
              {updateMutation.isPending ? "..." : <Check className="w-4 h-4" />}
            </Button>
          )}

          {/* Absent toggle */}
          <button
            onClick={handleToggleAbsent}
            disabled={absentMutation.isPending}
            title={isAbsent ? "Remover falta" : "Marcar falta"}
            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors ${
              isAbsent
                ? "bg-destructive/15 border-destructive/30 text-destructive hover:bg-destructive/25"
                : "border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            }`}
          >
            <XCircle className="w-4 h-4" />
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            title={confirmDelete ? "Clica novamente para confirmar" : "Apagar aluno"}
            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors ${
              confirmDelete
                ? "bg-destructive border-destructive text-white animate-pulse"
                : "border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
