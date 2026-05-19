import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CheckCircle2, User, Calendar, GraduationCap,
  Users, Dumbbell, UserCircle2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createRegistration, getTeachers } from "@/lib/storage";
import { computeEscalao, decodeEventConfig, type EventConfig } from "@/lib/event-config";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  birthYear: z.coerce.number().min(2000, "Ano inválido").max(new Date().getFullYear(), "Ano inválido"),
  schoolYear: z.string().min(1, "Selecione um ano de escolaridade"),
  className: z.string().min(1, "A turma é obrigatória").max(10, "Turma muito longa"),
});
type FormData = z.infer<typeof formSchema>;
const schoolYears = ["1.º", "2.º", "3.º", "4.º", "5.º", "6.º", "7.º", "8.º", "9.º"];

export default function Register() {
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [gender, setGender] = useState<"M" | "F" | null>(null);
  const [genderError, setGenderError] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activityError, setActivityError] = useState(false);
  const [liveEscalao, setLiveEscalao] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [teacherError, setTeacherError] = useState(false);

  const teachers = getTeachers();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ev = params.get("ev");
    if (ev) {
      const config = decodeEventConfig(ev);
      if (config) {
        setEventConfig(config);
        if (config.teacherId) setSelectedTeacherId(config.teacherId);
      }
    }
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const birthYearValue = watch("birthYear");
  useEffect(() => {
    const year = Number(birthYearValue);
    if (year >= 2000 && year <= new Date().getFullYear()) setLiveEscalao(computeEscalao(year));
    else setLiveEscalao(null);
  }, [birthYearValue]);

  const toggleActivity = (name: string) => {
    setActivityError(false);
    setSelectedActivities((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]);
  };

  const onSubmit = (data: FormData) => {
    let valid = true;
    if (!gender) { setGenderError(true); valid = false; }
    if (!selectedTeacherId) { setTeacherError(true); valid = false; }
    if (availableActivities.length > 0 && selectedActivities.length === 0) { setActivityError(true); valid = false; }
    if (!valid) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const teacher = teachers.find((t) => t.id === selectedTeacherId);
    try {
      createRegistration({
        ...data,
        gender: gender!,
        selectedActivities,
        teacherId: selectedTeacherId,
        teacherName: teacher?.displayName ?? "—",
      });
      setIsSuccess(true);
    } catch {
      setSubmitError("Ocorreu um erro ao submeter a inscrição. Tenta novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableActivities = eventConfig?.activities ?? [];
  const preselectedTeacher = eventConfig?.teacherId
    ? teachers.find((t) => t.id === eventConfig.teacherId)
    : null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl shadow-xl border border-border text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-3">Inscrição Concluída!</h2>
          {eventConfig && <p className="text-sm text-primary font-semibold mb-1">{eventConfig.period}</p>}
          <p className="text-sm text-muted-foreground mb-1">
            Professor: <span className="font-semibold text-foreground">{eventConfig?.teacherName ?? teachers.find(t => t.id === selectedTeacherId)?.displayName ?? "—"}</span>
          </p>
          {selectedActivities.length > 0 && (
            <p className="text-sm text-muted-foreground mb-1">Atividades: <span className="font-semibold text-foreground">{selectedActivities.join(", ")}</span></p>
          )}
          <p className="text-sm text-muted-foreground mb-4">Género: <span className="font-semibold text-foreground">{gender === "M" ? "Masculino" : "Feminino"}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-b-[50%] blur-3xl -z-10" />
      <header className="w-full max-w-3xl mx-auto px-6 py-6 flex justify-end items-center">
        <ThemeToggle />
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-4 pb-20">
        <div className="bg-card rounded-[2rem] shadow-xl border border-border/50 p-6 sm:p-10 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="bg-white p-2 rounded-2xl shadow-lg shadow-primary/30 border border-border/30">
              <img src="/images/logo-escola.png" alt="Logo" className="w-16 h-16 object-contain" />
            </div>
          </div>

          <div className="text-center mt-6 mb-8">
            <h1 className="text-3xl font-display font-bold">Ficha de Inscrição</h1>
            {eventConfig ? (
              <div className="mt-2 space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {eventConfig.period}
                </div>
                {eventConfig.teacherName && (
                  <p className="text-sm text-muted-foreground">Prof. <span className="font-semibold text-foreground">{eventConfig.teacherName}</span></p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">Preenche os teus dados para participar.</p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Teacher selector — only show if not pre-selected from QR */}
            {!preselectedTeacher && (
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-primary" /> Professor
                </label>
                {teachers.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    Nenhum professor registado no sistema.
                  </div>
                ) : (
                  <Select value={selectedTeacherId} onChange={(e) => { setSelectedTeacherId(e.target.value); setTeacherError(false); }}
                    className={teacherError ? "border-destructive" : ""}>
                    <option value="">Selecionar professor...</option>
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.displayName}</option>)}
                  </Select>
                )}
                {teacherError && <p className="text-destructive text-sm">Seleciona o professor.</p>}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Nome Completo</label>
              <Input placeholder="Ex: João Silva" {...register("name")} className={errors.name ? "border-destructive" : ""} />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            {/* Birth year */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Ano de Nascimento</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input type="number" placeholder="Ex: 2010" {...register("birthYear")} className={errors.birthYear ? "border-destructive" : ""} />
                  {errors.birthYear && <p className="text-destructive text-sm mt-1">{errors.birthYear.message}</p>}
                </div>
                {liveEscalao && (
                  <div className="h-12 flex items-center px-4 rounded-xl bg-secondary/15 text-secondary text-sm font-bold border border-secondary/20 whitespace-nowrap">
                    {liveEscalao}
                  </div>
                )}
              </div>
            </div>

            {/* School year + class */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Ano</label>
                <Select {...register("schoolYear")} className={errors.schoolYear ? "border-destructive" : ""}>
                  <option value="">Selecione...</option>
                  {schoolYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </Select>
                {errors.schoolYear && <p className="text-destructive text-sm">{errors.schoolYear.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Turma</label>
                <Input placeholder="Ex: A" {...register("className")} className={errors.className ? "border-destructive uppercase" : "uppercase"} />
                {errors.className && <p className="text-destructive text-sm">{errors.className.message}</p>}
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2"><UserCircle2 className="w-4 h-4 text-primary" /> Género</label>
              <div className="grid grid-cols-2 gap-3">
                {(["M", "F"] as const).map((g) => (
                  <button key={g} type="button" onClick={() => { setGender(g); setGenderError(false); }}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      gender === g && g === "M"
                        ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                        : gender === g && g === "F"
                        ? "border-pink-500 bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                    }`}>
                    {g === "M" ? "♂ Masculino" : "♀ Feminino"}
                  </button>
                ))}
              </div>
              {genderError && <p className="text-destructive text-sm">Seleciona o género.</p>}
            </div>

            {/* Activities */}
            {availableActivities.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2"><Dumbbell className="w-4 h-4 text-primary" /> Atividades em que vais participar</label>
                <p className="text-xs text-muted-foreground">A média será calculada só com as atividades que escolheres.</p>
                <div className="grid grid-cols-2 gap-2">
                  {availableActivities.map((act) => {
                    const sel = selectedActivities.includes(act);
                    return (
                      <button key={act} type="button" onClick={() => toggleActivity(act)}
                        className={`py-2.5 px-3 rounded-xl border-2 font-semibold text-sm text-left transition-all ${
                          sel ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}>
                        {sel ? "✓ " : ""}{act}
                      </button>
                    );
                  })}
                </div>
                {activityError && <p className="text-destructive text-sm">Seleciona pelo menos uma atividade.</p>}
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">{submitError}</div>
            )}

            <Button type="submit" size="lg" className="w-full text-lg" disabled={isSubmitting}>
              {isSubmitting ? "A submeter..." : "Confirmar Inscrição"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
