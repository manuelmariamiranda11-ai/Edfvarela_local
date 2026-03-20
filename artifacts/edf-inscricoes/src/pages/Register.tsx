import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, CheckCircle2, User, Calendar, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCreateRegistration } from "@workspace/api-client-react";

// Form Schema
const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  birthYear: z.coerce.number().min(2000, "Ano inválido").max(new Date().getFullYear(), "Ano inválido"),
  schoolYear: z.string().min(1, "Selecione um ano de escolaridade"),
  className: z.string().min(1, "A turma é obrigatória").max(10, "Turma muito longa"),
});

type FormData = z.infer<typeof formSchema>;

const schoolYears = ["1.º", "2.º", "3.º", "4.º", "5.º", "6.º", "7.º", "8.º", "9.º"];

export default function Register() {
  const [isSuccess, setIsSuccess] = useState(false);
  const createMutation = useCreateRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync({ data });
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to register", error);
      // Let standard mutation error handling show toast or UI if needed
      // Orval hooks throw on error when using mutateAsync
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl shadow-xl border border-border text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Inscrição Concluída!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            A tua inscrição foi registada com sucesso. Prepara-te para dar o teu melhor no evento!
          </p>
          <Link href="/">
            <Button size="lg" className="w-full">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-b-[50%] blur-3xl -z-10" />

      <header className="w-full max-w-3xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-4 pb-20">
        <div className="bg-card rounded-[2rem] shadow-xl border border-border/50 p-6 sm:p-10 relative">
          
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="bg-white p-2 rounded-2xl shadow-lg shadow-primary/30 border border-border/30">
              <img
                src="/images/logo-escola.png"
                alt="Agrupamento de Escolas de Montijo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          <div className="text-center mt-6 mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground">Ficha de Inscrição</h1>
            <p className="text-muted-foreground mt-2">Preenche os teus dados para participar no evento.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Nome Completo
              </label>
              <Input 
                placeholder="Ex: João Silva" 
                {...register("name")}
                className={errors.name ? "border-destructive focus-visible:ring-destructive/10" : ""}
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Ano Nascimento */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Ano de Nascimento
                </label>
                <Input 
                  type="number"
                  placeholder="Ex: 2008" 
                  {...register("birthYear")}
                  className={errors.birthYear ? "border-destructive focus-visible:ring-destructive/10" : ""}
                />
                {errors.birthYear && <p className="text-destructive text-sm mt-1">{errors.birthYear.message}</p>}
              </div>

              {/* Ano Escolaridade */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" /> Ano de Escolaridade
                </label>
                <Select 
                  {...register("schoolYear")}
                  className={errors.schoolYear ? "border-destructive focus-visible:ring-destructive/10" : ""}
                >
                  <option value="">Selecione...</option>
                  {schoolYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
                {errors.schoolYear && <p className="text-destructive text-sm mt-1">{errors.schoolYear.message}</p>}
              </div>
            </div>

            {/* Turma */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Turma
              </label>
              <Input 
                placeholder="Ex: A, B, C..." 
                {...register("className")}
                className={errors.className ? "border-destructive focus-visible:ring-destructive/10 uppercase" : "uppercase"}
              />
              {errors.className && <p className="text-destructive text-sm mt-1">{errors.className.message}</p>}
            </div>

            {createMutation.isError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {createMutation.error?.message || "Ocorreu um erro ao submeter a inscrição. Tenta novamente."}
              </div>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg mt-8"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "A submeter..." : "Confirmar Inscrição"}
            </Button>

          </form>

        </div>
      </main>
    </div>
  );
}
