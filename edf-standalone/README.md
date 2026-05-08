# Inscrições EDF — Servidor Local (Windows)

Site de inscrições para o evento de Educação Física do Agrupamento de Escolas de Montijo.
Funciona diretamente no PC como servidor temporário — sem internet, sem base de dados.

---

## Como usar no PC da escola

### Requisitos
- [Node.js](https://nodejs.org/) v18 ou superior (download gratuito)

### Arranque rápido (recomendado)

1. Abre a pasta `edf-standalone`
2. Faz duplo clique em **`INICIAR.bat`**
3. Na primeira vez instala as dependências automaticamente (~1-2 min)
4. O browser abre sozinho em `http://localhost:3000`

### Partilhar com outros dispositivos (telemóveis, tablets)

Para que os alunos se possam inscrever pelo telemóvel:
1. O PC e os telemóveis têm de estar na **mesma rede Wi-Fi**
2. Corre **`VER_IP.bat`** para descobrir o IP do PC (ex: `192.168.1.45`)
3. No telemóvel, abre o browser e vai a `http://192.168.1.45:3000`
4. O QR Code na página inicial aponta automaticamente para o endereço correto

### Fechar o servidor
Fecha a janela preta do `INICIAR.bat` ou prime `CTRL+C`.

---

## Arranque manual (CMD / PowerShell)

```bat
npm install        (só na primeira vez)
npm run dev        (inicia o servidor)
```

---

## Funcionalidades

| Página | Endereço |
|---|---|
| Portal de inscrições + QR Code | `http://localhost:3000` |
| Formulário de inscrição | `http://localhost:3000/register` |
| Login admin | `http://localhost:3000/admin/login` |
| Painel admin | `http://localhost:3000/admin` |

### Painel de administração
- Ver todas as inscrições ordenadas por nome, ano de nascimento ou turma
- Lançar notas (0-100) para 5 atividades por aluno
- Média calculada automaticamente
- Marcar faltas (falta) por aluno
- Apagar registos
- Exportar tabela para **Excel** com fórmulas AVERAGE

## Credenciais de Admin

| Campo | Valor |
|---|---|
| Utilizador | `edfvarela026` |
| Palavra-passe | `varelaedf026` |

---

## Armazenamento de dados

Todos os dados ficam guardados no **localStorage do browser** — não é necessária qualquer base de dados.

> Os dados persistem enquanto o browser não for limpo. Para guardar os resultados permanentemente, usa a exportação para Excel antes de fechar.

---

## Estrutura da pasta

```
edf-standalone/
├── INICIAR.bat         ← duplo clique para arrancar (Windows)
├── VER_IP.bat          ← mostra o IP do PC na rede local
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── pages/          ← Home, Register, AdminLogin, AdminDashboard
│   ├── components/     ← ThemeToggle + componentes UI
│   └── lib/            ← storage.ts, theme-context.tsx, utils.ts
└── public/
    ├── favicon.svg
    └── images/logo-escola.png
```
