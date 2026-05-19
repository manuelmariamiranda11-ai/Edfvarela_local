import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Plus, X, QrCode, Copy, Check, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isAdminLoggedIn, getCurrentTeacher } from "@/lib/storage";
import {
  PERIODS, PRESET_ACTIVITY_GROUPS, encodeEventConfig, type EventConfig,
} from "@/lib/event-config";

export default function AdminSetup() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState(PERIODS[0]);
  const [activities, setActivities] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) setLocation("/admin/login");
  }, [setLocation]);

  const teacher = getCurrentTeacher();

  const addActivity = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || activities.includes(trimmed)) return;
    setActivities((prev) => [...prev, trimmed]);
    setCustomInput("");
    setGeneratedUrl(null);
  };

  const removeActivity = (name: string) => {
    setActivities((prev) => prev.filter((a) => a !== name));
    setGeneratedUrl(null);
  };

  const handleGenerate = () => {
    if (!teacher || activities.length === 0) return;
    const config: EventConfig = {
      period, activities,
      teacherId: teacher.id,
      teacherName: teacher.displayName,
    };
    const encoded = encodeEventConfig(config);
    setGeneratedUrl(`${window.location.origin}/register?ev=${encoded}`);
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!teacher) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <Settings2 className="w-5 h-5 text-primary" /> Configurar Evento
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block font-semibold text-foreground">{teacher.displayName}</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">1. Selecionar Período</h2>
            <Select value={period} onChange={(e) => { setPeriod(e.target.value); setGeneratedUrl(null); }}>
              {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">2. Escolher Atividades</h2>
            <div className="space-y-4">
              {PRESET_ACTIVITY_GROUPS.map((grp) => (
                <div key={grp.group}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{grp.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {grp.activities.map((act) => {
                      const selected = activities.includes(act);
                      return (
                        <button key={act} onClick={() => selected ? removeActivity(act) : addActivity(act)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                            selected ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                          }`}>
                          {selected && "✓ "}{act}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Personalizada</p>
              <div className="flex gap-2">
                <Input placeholder="Nome da atividade..." value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addActivity(customInput)}
                  className="h-10" />
                <Button size="sm" onClick={() => addActivity(customInput)} disabled={!customInput.trim()} className="h-10 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {activities.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Selecionadas ({activities.length})</p>
                <div className="flex flex-wrap gap-2">
                  {activities.map((act) => (
                    <span key={act} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      {act}
                      <button onClick={() => removeActivity(act)} className="hover:text-destructive ml-1"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button size="lg" className="w-full" onClick={handleGenerate} disabled={activities.length === 0}>
            <QrCode className="w-5 h-5 mr-2" /> Gerar QR Code
          </Button>
        </div>

        <div className="flex flex-col items-center justify-start">
          {generatedUrl ? (
            <div className="bg-card border border-border rounded-2xl p-6 w-full space-y-5">
              <div>
                <h2 className="font-display font-bold text-lg mb-1">QR Code Gerado</h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{period}</span> · {activities.length} atividade{activities.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-2xl shadow-inner border border-border/50">
                  <QRCodeSVG value={generatedUrl} size={220} level="H" fgColor="#0f172a" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Link de inscrição</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-xl px-3 py-2 text-xs font-mono text-muted-foreground truncate">{generatedUrl}</div>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground">
                Professor: <span className="font-semibold text-foreground">{teacher.displayName}</span><br />
                Atividades: <span className="font-semibold text-foreground">{activities.join(", ")}</span>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 w-full flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
              <QrCode className="w-16 h-16 text-border" />
              <div>
                <p className="font-semibold text-foreground">QR Code aparece aqui</p>
                <p className="text-sm text-muted-foreground mt-1">Seleciona o período, as atividades<br />e clica em "Gerar QR Code"</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
