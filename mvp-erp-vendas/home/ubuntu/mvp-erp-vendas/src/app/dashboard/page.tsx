// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components to potentially improve initial load
const FaturamentoTotal = dynamic(() => import('@/components/dashboard/FaturamentoTotal'), { ssr: false, loading: () => <p>Carregando Faturamento...</p> });
const EvolucaoMensal = dynamic(() => import('@/components/dashboard/EvolucaoMensal'), { ssr: false, loading: () => <p>Carregando Gráfico Mensal...</p> });
const FunilVendas = dynamic(() => import('@/components/dashboard/FunilVendas'), { ssr: false, loading: () => <p>Carregando Funil...</p> });
const ProdutosMaisVendidos = dynamic(() => import('@/components/dashboard/ProdutosMaisVendidos'), { ssr: false, loading: () => <p>Carregando Ranking Produtos...</p> });
const DesempenhoRegiaoSetor = dynamic(() => import('@/components/dashboard/DesempenhoRegiaoSetor'), { ssr: false, loading: () => <p>Carregando Desempenho...</p> });
const MetasProgresso = dynamic(() => import('@/components/dashboard/MetasProgresso'), { ssr: false, loading: () => <p>Carregando Metas...</p> });
const ClientesReativar = dynamic(() => import('@/components/dashboard/ClientesReativar'), { ssr: false, loading: () => <p>Carregando Clientes para Reativar...</p> });
const PainelComissoes = dynamic(() => import('@/components/dashboard/PainelComissoes'), { ssr: false, loading: () => <p>Carregando Comissões...</p> });

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null); // Use a more specific type later

  // Fetch general dashboard data (optional, could be fetched by individual components)
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        // Example: Fetch summary data if needed, otherwise components fetch their own
        // const response = await fetch('/api/dashboard'); // Main dashboard endpoint
        // if (!response.ok) {
        //   throw new Error('Falha ao buscar dados do dashboard');
        // }
        // const data = await response.json();
        // setDashboardData(data);
        setDashboardData({}); // Placeholder if no general data is fetched here
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao carregar o dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return <p>Carregando dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard de Vendas</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        {/* Top Row Widgets */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
           <FaturamentoTotal />
        </div>
         <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
           <EvolucaoMensal />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
         {/* Middle Row Widgets */}
         <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
            <FunilVendas />
         </div>
         <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
            <ProdutosMaisVendidos />
         </div>
         <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
            <DesempenhoRegiaoSetor />
         </div>
      </div>

       <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          {/* Bottom Row Widgets */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
            <MetasProgresso />
          </div>
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
             <ClientesReativar />
          </div>
       </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <PainelComissoes />
        </div>

    </div>
  );
}

