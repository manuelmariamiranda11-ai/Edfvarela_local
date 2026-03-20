import { Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Timer, Users, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

export default function Home() {
  const [registerUrl, setRegisterUrl] = useState("");

  useEffect(() => {
    setRegisterUrl(`${window.location.origin}/register`);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center z-10 relative max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo-escola.png"
            alt="Agrupamento de Escolas de Montijo"
            className="w-12 h-12 object-contain"
          />
          <span className="font-display font-bold text-xl tracking-tight text-foreground hidden sm:block">
            EDF Eventos
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/admin/login">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/30 hover:bg-primary/90 transition-colors">
              <Lock className="w-4 h-4" />
              Área Admin
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Inscrições Abertas
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-foreground leading-[1.1] mb-6">
              O Teu Desafio <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Começa Aqui.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-lg">
              Regista-te agora no evento anual de Educação Física. Mostra o teu talento, supera os teus limites e representa a tua turma com orgulho.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg group">
                  Fazer Inscrição
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border/50 w-full max-w-lg">
              <div className="flex flex-col items-center lg:items-start gap-2">
                <Users className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold text-foreground">Todas as Turmas</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <Timer className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold text-foreground">5 Atividades</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold text-foreground">Registo Oficial</span>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code */}
          <div className="flex justify-center lg:justify-end z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[2.5rem] transform rotate-3 scale-105 blur-sm" />

              <div className="relative bg-card p-8 sm:p-12 rounded-[2rem] shadow-2xl border border-border/30 backdrop-blur-xl flex flex-col items-center text-center">
                <h3 className="font-display text-2xl font-bold mb-2">Acesso Rápido</h3>
                <p className="text-muted-foreground mb-8 text-sm max-w-[250px]">
                  Lê o código QR com o teu telemóvel para acederes diretamente ao formulário.
                </p>

                <div className="bg-white p-4 rounded-2xl shadow-inner border border-border/50">
                  {registerUrl ? (
                    <QRCodeSVG
                      value={registerUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                      className="rounded-lg"
                      fgColor="#0f172a"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded-lg" />
                  )}
                </div>

                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-primary">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Scanner Pronto
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
