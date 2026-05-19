import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Lock, User, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { registerTeacher } from "@/lib/storage";

const schema = z.object({
  displayName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  username: z.string().min(3, "Utilizador deve ter pelo menos 3 caracteres").regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e _"),
  password: z.string().min(4, "Palavra-passe deve ter pelo menos 4 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As palavras-passe não coincidem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function AdminRegister() {
  const [, setLocation] = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    const result = registerTeacher({
      displayName: data.displayName,
      username: data.username,
      password: data.password,
    });
    if (typeof result === "string") {
      setServerError(result);
      setIsSubmitting(false);
    } else {
      setLocation("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <Link href="/admin/login" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao login
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-card p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-border">
        <div className="flex justify-center mb-6">
          <img src="/images/logo-escola.png" alt="Logo" className="w-16 h-16 object-contain" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold">Registo de Professor</h1>
          <p className="text-muted-foreground mt-2 text-sm">Cria a tua conta para gerir os resultados EDF</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-primary" /> Nome a apresentar
            </label>
            <Input {...register("displayName")} placeholder="Ex: Prof. Ana Costa"
              className={errors.displayName ? "border-destructive" : ""} />
            {errors.displayName && <p className="text-destructive text-xs">{errors.displayName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Nome de utilizador
            </label>
            <Input {...register("username")} placeholder="Ex: prof_ana"
              className={errors.username ? "border-destructive" : ""} />
            {errors.username && <p className="text-destructive text-xs">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Palavra-passe
            </label>
            <Input type="password" {...register("password")} placeholder="••••••••"
              className={errors.password ? "border-destructive" : ""} />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Confirmar palavra-passe
            </label>
            <Input type="password" {...register("confirmPassword")} placeholder="••••••••"
              className={errors.confirmPassword ? "border-destructive" : ""} />
            {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
          </div>

          {serverError && (
            <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center">
              {serverError}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "A criar conta..." : "Criar conta"}
          </Button>
        </form>
      </div>
    </div>
  );
}
