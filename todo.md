## Checklist do Projeto: MVP ERP de Vendas

Este checklist detalha as etapas e funcionalidades a serem desenvolvidas para o MVP do ERP de Vendas.

**Fase 1: Configuração e Estrutura do Projeto**

- [X] 1.1. Inicializar projeto Next.js.
- [X] 1.2. Configurar TailwindCSS.
- [X] 1.3. Configurar Prisma ORM.
- [X] 1.4. Conectar ao banco de dados PostgreSQL (configuração inicial, sugerir provedores).
- [X] 1.5. Definir schema do Prisma (tabelas: Clientes, Produtos, Vendas, Interacoes, Metas).
- [X] 1.6. Gerar migrações do Prisma e aplicar ao banco.
- [X] 1.7. Estruturar pastas do projeto (pages, components, api, lib, etc.).

**Fase 2: Funcionalidades Principais (Backend - API Routes)**

- [X] 2.1. API CRUD para Clientes.
- [X] 2.2. API CRUD para Produtos (sem estoque).
- [X] 2.3. API CRUD para Vendas (com cálculo automático de comissão e atualização de 'última compra' do cliente).
- [X] 2.4. API CRUD para Interações (com atualização de \'última interação\' do cliente). - [X] 2.5. API CRUD para Metas.
- [X] 2.6. API para buscar dados do Dashboard (faturamento total/mensal, funil, produtos mais vendidos, desempenho setor/região, metas vs. atingido).
- [X] 2.7. API para buscar dados do painel de Interações (resumo, frequência).
- [X] 2.8. API para identificar e listar "Clientes para reativar" (> 30 dias sem contato/compra).
- [X] 2.9. API para buscar dados do painel de Comissões.

**Fase 3: Funcionalidades Principais (Frontend - Pages & Components)**

- [X] 3.1. Criar layout base da aplicação (navegação, abas: Vendedor, Dashboard).
- [ ] 3.2. **Aba Vendedor:**
    - [X] 3.2.1. Página de listagem de Clientes (com busca/filtros básicos).
    - [X] 3.2.2. Formulário de cadastro/edição de Clientes.
    - [X] 3.2.3. Página de detalhes do Cliente (exibindo todos os campos, incluindo mapa para região).
    - [X] 3.2.4. Página de listagem de Vendas (com busca/filtros básicos).
    - [X] 3.2.5. Formulário de cadastro/edição de Vendas (seleção de cliente/produto, cálculo de comissão visível).
    - [X] 3.2.6. Página de listagem de Interações (com busca/filtros básicos).
    - [X] 3.2.7. Formulário de cadastro/edição de Interações (seleção de cliente).
    - [X] 3.2.8. Página de listagem de Produtos.
    - [X] 3.2.9. Formulário de cadastro/edição de Produtos.
    - [X] 3.2.10. Página de listagem de Metas.
    - [X] 3.2.11. Formulário de cadastro/edição de Metas.
- [X] 3.3. **Aba Dashboard:**
    - [X] 3.3.1. Componente de Faturamento Total.
    - [X] 3.3.2. Gráfico de Evolução Mensal de Faturamento (Recharts).
    - [X] 3.3.3. Gráfico de Funil de Vendas (Recharts).
    - [X] 3.3.4. Lista/Gráfico de Produtos Mais Vendidos (Recharts).
  - [X] 3.3.5. Gráfico de Desempenho por Setor (Recharts).
- [X] 3.3.6. Gráfico de Desempenho por Região (Recharts).    - [X] 3.3.7. Gráfico de Metas vs. Atingido (com filtro mês/ano) (Recharts).
    - [X] 3.3.8. Seção "Clientes para reativar" (listagem com botão para registrar interação).
    - [X] 3.3.9. Painel de Comissões (geral e individual, se aplicável).
    - [X] 3.3.10. Painel de Interações (resumo, gráfico de frequência).
- [X] 3.4. Integração do mapa (Leaflet.js ou Google Maps API - verificar termos de uso/custo para Google Maps) na visualização de clientes/regiões.

**Fase 4: Finalização e Entrega**

- [X] 4.1. Refinar estilos com TailwindCSS (interfaces limpas, navegação fluida).
- [X] 4.2. Testar todas as funcionalidades e fluxos.
- [X] 4.3. Preparar arquivo `.env.example` com as variáveis de ambiente necessárias (DATABASE_URL).
- [X] 4.4. Escrever README.md com instruções de instalação, configuração e execução.
- [X] 4.5. Garantir compatibilidade com deploy na Vercel.
- [X] 4.6. Empacotar o projeto completo para entrega.

