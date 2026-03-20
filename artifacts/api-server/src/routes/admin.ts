import { Router, type IRouter, type Request } from "express";

const ADMIN_USERNAME = "edfvarela026";
const ADMIN_PASSWORD = "varelaedf026";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

const router: IRouter = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true, message: "Login realizado com sucesso" });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Sessão terminada" });
  });
});

router.get("/me", (req: Request, res) => {
  if (req.session.isAdmin) {
    res.json({ message: "Autenticado" });
  } else {
    res.status(401).json({ error: "Não autenticado" });
  }
});

export default router;
