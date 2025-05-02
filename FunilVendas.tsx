// src/components/dashboard/FunilVendas.tsx
"use client";

import { useState, useEffect } from 'react';
import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';

interface FunilData {
  totalClientes: number;
  clientesComInteracao: number;
  clientesComVenda: number;
}

export default function FunilVendas() {
  const [data, setData] = useState<any[]>([]); // Data formatted for FunnelChart
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard?metric=funil');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do funil de vendas');
        }
        const result: FunilData = await response.json();

        // Format data for Recharts FunnelChart
        const formattedData = [
          { name: 'Total Clientes', value: result.totalClientes || 0, fill: '#8884d8' },
          { name: 'Com Interação', value: result.clientesComInteracao || 0, fill: '#83a6ed' },
          { name: 'Com Venda', value: result.clientesComVenda || 0, fill: '#82ca9d' },
        ];
        setData(formattedData);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando funil de vendas...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Erro: {error}</p>;
  }

  // Calculate conversion rates for display (optional)
  const totalClientes = data.find(d => d.name === 'Total Clientes')?.value || 0;
  const comInteracao = data.find(d => d.name === 'Com Interação')?.value || 0;
  const comVenda = data.find(d => d.name === 'Com Venda')?.value || 0;

  const taxaInteracao = totalClientes > 0 ? ((comInteracao / totalClientes) * 100).toFixed(1) : 0;
  const taxaConversao = comInteracao > 0 ? ((comVenda / comInteracao) * 100).toFixed(1) : 0;
  const taxaGeral = totalClientes > 0 ? ((comVenda / totalClientes) * 100).toFixed(1) : 0;


  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Funil de Vendas</h3>
       <p className="text-xs text-gray-500 mb-3">
         Conversão Geral: {taxaGeral}% | Interação: {taxaInteracao}% | Venda (pós-interação): {taxaConversao}%
       </p>
      {data.length > 0 && totalClientes > 0 ? (
        <ResponsiveContainer width="100%" height={250}> // Adjusted height
          <FunnelChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={data}
              isAnimationActive
            >
              <LabelList position="right" fill="#000" stroke="none" dataKey="name" formatter={(name: string) => name} />
               <LabelList position="center" fill="#fff" stroke="none" dataKey="value" formatter={(value: number) => value} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500">Nenhum dado disponível para o funil de vendas.</p>
      )}
    </div>
  );
}

