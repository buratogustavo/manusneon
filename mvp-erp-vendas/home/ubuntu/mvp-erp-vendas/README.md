# MVP ERP Vendas Simplificado

Este é um MVP (Minimum Viable Product) de um sistema ERP simplificado focado em vendas, desenvolvido com Next.js, TypeScript, TailwindCSS e Prisma ORM.

## Funcionalidades Principais

*   **Gestão de Clientes:** CRUD completo, visualização de detalhes, mapa de localização (Leaflet).
*   **Gestão de Produtos:** CRUD básico (sem controle de estoque).
*   **Gestão de Vendas:** CRUD, cálculo automático de comissão (5% fixo), atualização de data da última compra do cliente.
*   **Gestão de Interações:** CRUD, atualização de data da última interação do cliente.
*   **Gestão de Metas:** CRUD para metas de Faturamento, Quantidade de Vendas ou Quantidade de Interações.
*   **Dashboard Analítico:**
    *   Faturamento total e mensal.
    *   Gráfico de evolução mensal de faturamento.
    *   Gráfico de funil de vendas (Clientes > Interações > Vendas).
    *   Gráfico/Lista de produtos mais vendidos (por quantidade ou faturamento).
    *   Gráficos de desempenho de faturamento por setor e região do cliente.
    *   Gráfico de progresso das metas (atingido vs. alvo) para o mês atual.
    *   Lista de "Clientes para Reativar" (> 30 dias sem interação ou compra) com botão para registrar interação.
    *   Painel de comissões (total e mês atual).
    *   Painel de interações (total, mês atual, gráfico de frequência diária).

## Tecnologias Utilizadas

*   **Frontend:** Next.js (App Router), React, TypeScript, TailwindCSS
*   **Backend:** Next.js API Routes, TypeScript
*   **Banco de Dados:** PostgreSQL (conectado via Prisma ORM)
*   **ORM:** Prisma
*   **Componentes UI:** TailwindCSS (sem bibliotecas adicionais como Shadcn/ui)
*   **Gráficos:** Recharts
*   **Mapas:** React-Leaflet

## Pré-requisitos

*   Node.js (versão 20.x ou superior recomendada)
*   npm (geralmente vem com o Node.js)
*   Um banco de dados PostgreSQL acessível (ex: Neon, Supabase, Railway, Aiven, ou local)

## Instalação e Configuração

1.  **Clone o repositório ou descompacte o projeto:**
    ```bash
    # Se for um repositório git
    # git clone <url_do_repositorio>
    # cd mvp-erp-vendas

    # Se for um arquivo zip
    # unzip mvp-erp-vendas.zip
    # cd mvp-erp-vendas
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    *   Renomeie o arquivo `.env.example` para `.env`.
    *   Abra o arquivo `.env` e substitua o valor da variável `DATABASE_URL` pela string de conexão do seu banco de dados PostgreSQL.
        *   **Exemplo Neon (com pooler):** `postgresql://user:password@project-pooler.region.aws.neon.tech/dbname?sslmode=require`
        *   **Exemplo Supabase (com pooler):** `postgresql://postgres.project:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true`
        *   **Importante:** Certifique-se de que seu banco de dados esteja acessível a partir do ambiente onde a aplicação será executada.

4.  **Execute as migrações do banco de dados:**
    Este comando criará as tabelas no seu banco de dados com base no schema definido em `prisma/schema.prisma`.
    ```bash
    npx prisma migrate dev --name init
    ```
    *   O Prisma também gerará o Prisma Client, necessário para interagir com o banco de dados.

## Execução

1.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

2.  Abra seu navegador e acesse `http://localhost:3000` (ou a porta indicada no terminal).

## Deploy (Vercel)

Este projeto está configurado para ser facilmente implantado na Vercel.

1.  **Conecte seu repositório Git (GitHub, GitLab, Bitbucket) à Vercel.**
2.  **Configure as variáveis de ambiente na Vercel:**
    *   Adicione a variável `DATABASE_URL` com a string de conexão do seu banco de dados PostgreSQL (use a URL do pooler se disponível e compatível com migrações, ou a URL direta se necessário para o build/migração inicial).
3.  **A Vercel detectará automaticamente que é um projeto Next.js e o configurará.**
4.  **Build e Deploy:** A Vercel cuidará do processo de build e deploy.
    *   **Importante sobre Migrações:** A Vercel não executa `prisma migrate dev` automaticamente. Você tem algumas opções:
        *   **Executar migrações localmente:** Execute `npx prisma migrate deploy` (ou `dev` se for a primeira vez) localmente apontando para o banco de produção *antes* de fazer o deploy na Vercel.
        *   **Usar `prisma db push` (Não recomendado para produção):** Em alguns cenários simples ou de desenvolvimento, `prisma db push` pode ser usado no comando de build da Vercel (`prisma generate && prisma db push && next build`), mas isso não é ideal para produção pois não gerencia o histórico de migrações.
        *   **Soluções de CI/CD:** Configurar um pipeline de CI/CD para executar as migrações antes do deploy na Vercel.
        *   **Provedores com Integração:** Alguns provedores de banco de dados (como Neon com a integração Vercel) podem oferecer maneiras mais fáceis de gerenciar migrações.

## Estrutura do Projeto

```
/mvp-erp-vendas
|-- /prisma
|   |-- schema.prisma       # Schema do banco de dados
|   |-- migrations/         # Arquivos de migração gerados
|-- /public                 # Arquivos estáticos
|-- /src
|   |-- /app                # App Router (páginas e APIs)
|   |   |-- /api            # Rotas da API
|   |   |   |-- /clientes
|   |   |   |-- /dashboard
|   |   |   |-- /interacoes
|   |   |   |-- /metas
|   |   |   |-- /produtos
|   |   |   |-- /vendas
|   |   |-- /dashboard      # Página do Dashboard
|   |   |-- /vendedor       # Páginas da área do vendedor
|   |   |   |-- /clientes
|   |   |   |-- /interacoes
|   |   |   |-- /metas
|   |   |   |-- /produtos
|   |   |   |-- /vendas
|   |   |-- layout.tsx      # Layout principal
|   |   |-- page.tsx        # Página inicial (redireciona para /vendedor)
|   |-- /components         # Componentes React reutilizáveis
|   |   |-- /dashboard      # Componentes específicos do Dashboard
|   |   |-- /clientes
|   |   |-- /interacoes
|   |   |-- /metas
|   |   |-- /produtos
|   |   |-- /ui             # Componentes genéricos de UI (ex: MapDisplay)
|   |   |-- /vendas
|   |-- /lib                # Funções utilitárias (ex: instância do Prisma Client)
|   |   |-- prisma.ts
|-- .env.example            # Exemplo de arquivo de variáveis de ambiente
|-- .eslintrc.json          # Configuração do ESLint
|-- .gitignore
|-- next.config.mjs         # Configuração do Next.js
|-- package.json
|-- postcss.config.js       # Configuração do PostCSS (para Tailwind)
|-- tailwind.config.ts      # Configuração do TailwindCSS
|-- tsconfig.json           # Configuração do TypeScript
|-- README.md               # Este arquivo
```

