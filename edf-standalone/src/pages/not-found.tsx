export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-4 p-8 bg-card rounded-2xl shadow border border-border text-center">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground">Página não encontrada.</p>
      </div>
    </div>
  );
}
