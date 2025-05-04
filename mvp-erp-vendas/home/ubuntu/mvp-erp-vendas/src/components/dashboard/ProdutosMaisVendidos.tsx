// src/components/dashboard/ProdutosMaisVendidos.tsx
"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProdutoVendido {
  produtoId: number;
  nomeProduto: string;
  quantidadeVendida: number;
  faturamentoGerado: number;
}

export default function ProdutosMaisVendidos() {
  const [data, setData] = useState<ProdutoVendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'quantidade' | 'faturamento'>('quantidade'); // Control chart view

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard?metric=produtos_mais_vendidos');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados de produtos mais vendidos');
        }
        const result = await response.json();
        // Ensure result is an array
        setData(Array.isArray(result.produtosMaisVendidos) ? result.produtosMaisVendidos : []);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando ranking de produtos...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Erro: {error}</p>;
  }

  const chartData = data.map(item => ({
      name: item.nomeProduto.length > 15 ? item.nomeProduto.substring(0, 12) + '...' : item.nomeProduto, // Shorten name for axis
      Quantidade: item.quantidadeVendida,
      Faturamento: item.faturamentoGerado
  })).slice(0, 10); // Limit to top 10 for chart clarity

  const dataKey = chartType === 'quantidade' ? 'Quantidade' : 'Faturamento';
  const fill = chartType === 'quantidade' ? '#8884d8' : '#82ca9d';
  const yAxisFormatter = chartType === 'quantidade'
    ? (value: number) => `${value}`
    : (value: number) => `R$${value.toLocaleString('pt-BR')}`;
  const tooltipFormatter = chartType === 'quantidade'
    ? (value: number) => [`${value}`, 'Quantidade']
    : (value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Faturamento'];


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Top Produtos</h3>
        <div>
            <button
                onClick={() => setChartType('quantidade')}
                className={`px-2 py-1 text-xs rounded ${chartType === 'quantidade' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Por Quantidade
            </button>
            <button
                onClick={() => setChartType('faturamento')}
                className={`ml-2 px-2 py-1 text-xs rounded ${chartType === 'faturamento' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Por Faturamento
            </button>
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={yAxisFormatter} />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip formatter={tooltipFormatter} />
            {/* <Legend /> */}
            <Bar dataKey={dataKey} fill={fill} name={chartType === 'quantidade' ? 'Quantidade Vendida' : 'Faturamento Gerado'} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500">Nenhum dado de produto vendido encontrado.</p>
      )}
    </div>
  );
}

