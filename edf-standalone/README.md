# Inscrições EDF — Versão Standalone (Windows)

Site de inscrições para o evento de Educação Física do Agrupamento de Escolas de Montijo.

## Como compilar e usar

### Requisitos
- [Node.js](https://nodejs.org/) v18 ou superior (recomendado: v20 LTS)
- npm (incluído com o Node.js)

### Passos no CMD / PowerShell

```bat
npm install
npm run build
```

A pasta `dist/` será criada com o site pronto.

### Visualizar o site localmente (após o build)

```bat
npm run preview
```

Depois abre o browser em `http://localhost:4173`

> **Nota:** Para navegar entre páginas corretamente, usa sempre `npm run preview`.
> Não abras o ficheiro `dist/index.html` diretamente — o routing da aplicação requer um servidor HTTP.

---

## Funcionalidades

- **Inscrições**: Formulário com nome, ano de nascimento, ano de escolaridade e turma.
- **QR Code**: Na página inicial, para acesso rápido pelo telemóvel.
- **Painel Admin**: Ver e gerir todas as inscrições, lançar notas (0-100) para 5 atividades, calcular médias, marcar faltas e apagar registos.
- **Exportar Excel**: Exporta a tabela com fórmulas AVERAGE para o Excel.
- **Modo escuro**: Botão de alternância no topo de todas as páginas.

## Credenciais de Admin

| Campo        | Valor           |
|--------------|-----------------|
| Utilizador   | `edfvarela026`  |
| Palavra-passe| `varelaedf026`  |

Acesso em: `/admin/login`

## Armazenamento

Todos os dados são guardados no **localStorage** do browser — não é necessária qualquer base de dados ou ligação à internet.

Os dados persistem entre sessões no mesmo browser/computador.

## Estrutura do projeto

```
edf-standalone/
├── index.html          ← entrada do Vite
├── package.json        ← dependências e scripts npm
├── vite.config.ts      ← configuração do Vite
├── tsconfig.json       ← TypeScript
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── pages/          ← Home, Register, AdminLogin, AdminDashboard
│   ├── components/     ← ThemeToggle + componentes UI
│   └── lib/            ← storage.ts, theme-context.tsx, utils.ts
└── public/
    ├── favicon.svg
    └── images/logo-escola.png
```
