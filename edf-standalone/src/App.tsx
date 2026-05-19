import { Switch, Route, Router as WouterRouter } from "wouter";
import { ThemeProvider } from "@/lib/theme-context";

import Home from "@/pages/Home";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";
import AdminRegister from "@/pages/AdminRegister";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminSetup from "@/pages/AdminSetup";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/register" component={AdminRegister} />
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WouterRouter>
        <Router />
      </WouterRouter>
    </ThemeProvider>
  );
}
