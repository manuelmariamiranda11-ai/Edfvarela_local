import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Lock, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { adminLogin, getTeachers } from "@/lib/storage";

const loginSchema = z.object({
  username: z.string().min(1, "Utilizador obrigatório"),
  password: z.string().min(1, "Palavra-passe obrigatória"),
});
type LoginData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const teachers = getTeachers();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginData) => {
    setIsSubmitting(true);
    setIsError(false);
    const ok = adminLogin(data.username, data.password);
    if (ok) {
      setLocation("/admin");
    } else {
      setIsError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Portal
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-card p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-border">
        <div className="flex justify-center mb-8">
          <img src="/images/logo-escola.png" alt="Logo" className="w-20 h-20 object-contain" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold">Área dos Professores</h1>
          <p className="text-muted-foreground mt-2 text-sm">Gestão de resultados EDF</p>
        </div>

        {teachers.length === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <p className="font-semibold">Nenhum professor registado.</p>
            <p className="mt-1">Cria a primeira conta de professor antes de entrar.</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> Utilizador
            </label>
            <Input {...register("username")} placeholder="Inserir utilizador"
              autoComplete="username" className={errors.username ? "border-destructive" : ""} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" /> Palavra-passe
            </label>
            <Input type="password" {...register("password")} placeholder="••••••••"
              autoComplete="current-password" className={errors.password ? "border-destructive" : ""} />
          </div>

          {isError && (
            <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center">
              Credenciais inválidas. Tente novamente.
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-2" disabled={isSubmitting || teachers.length === 0}>
            {isSubmitting ? "A autenticar..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-3">Novo professor?</p>
          <Link href="/admin/register">
            <Button variant="outline" className="w-full">
              <UserPlus className="w-4 h-4 mr-2" /> Criar conta de professor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
