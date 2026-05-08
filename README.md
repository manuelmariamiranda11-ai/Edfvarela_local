# EDF Inscrições — Agrupamento de Escolas de Montijo

Site de inscrições para o evento anual de Educação Física (EDF), do 1.º ao 9.º ano.

## Como usar

### Abrir o site

Basta abrir o projeto no Replit e clicar em **Run**. O site fica disponível no painel de pré-visualização.

Para partilhar com os alunos, usa o link público do Replit ou faz deploy com o botão **Publish**.

---

## Funcionalidades

### Página Inicial (`/`)
- Apresentação do evento
- Código QR que aponta diretamente para o formulário de inscrição

### Inscrição de Alunos (`/register`)
- Formulário com: nome completo, ano de nascimento, ano de escolaridade (1.º–9.º) e turma
- Os dados são guardados no **LocalStorage** do browser — sem servidor, sem base de dados externa

### Área Admin (`/admin/login`)
- Login com as credenciais abaixo
- Dashboard com tabela de todos os inscritos
- Ordenação por nome, ano de nascimento ou turma
- Pesquisa por nome ou turma
- Introdução de notas (0–100) para 5 atividades por aluno
- Média calculada automaticamente
- Marcar aluno como **Falta** (desativa as notas)
- **Apagar** aluno (confirmação de duplo clique)
- Exportação para **Excel** com fórmulas AVERAGE

---

## Credenciais de Admin

| Campo       | Valor           |
|-------------|-----------------|
| Utilizador  | `edfvarela026`  |
| Palavra-passe | `varelaedf026` |

---

## Tecnologia

- **Frontend:** React + Vite (compila para HTML/CSS/JS estático)
- **Armazenamento:** `localStorage` do browser (sem servidor, sem PostgreSQL)
- **Sessão admin:** `sessionStorage` (dura até fechar o separador)
- **Export Excel:** SheetJS (xlsx)
- **Estilo:** Tailwind CSS + shadcn/ui

## Notas importantes

- Os dados ficam guardados **no browser onde o site é acedido**. Cada dispositivo tem os seus próprios dados.
- Para transferir dados entre dispositivos, usa a exportação Excel.
- A sessão de admin termina automaticamente ao fechar o separador do browser.
