// src/components/dashboard/DesempenhoRegiaoSetor.tsx
"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DesempenhoData {
  grupo: string; // Região or Setor
  faturamento: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF1919", "#19FFD5", "#E8FF19"];

export default function DesempenhoRegiaoSetor() {
  const [dataRegiao, setDataRegiao] = useState<DesempenhoData[]>([]);
  const [dataSetor, setDataSetor] = useState<DesempenhoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'regiao' | 'setor'>('regiao');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch both region and sector data
        const response = await fetch('/api/dashboard?metric=desempenho_grupo');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados de desempenho');
        }
        const result = await response.json();
        setDataRegiao(Array.isArray(result.desempenhoPorRegiao) ? result.desempenhoPorRegiao.map((d: any) => ({ grupo: d.regiao || 'N/A', faturamento: d.faturamento })) : []);
        setDataSetor(Array.isArray(result.desempenhoPorSetor) ? result.desempenhoPorSetor.map((d: any) => ({ grupo: d.setor || 'N/A', faturamento: d.faturamento })) : []);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const chartData = view === 'regiao' ? dataRegiao : dataSetor;
  const title = view === 'regiao' ? 'Desempenho por Região' : 'Desempenho por Setor';

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando gráficos de desempenho...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div>
            <button
                onClick={() => setView('regiao')}
                className={`px-2 py-1 text-xs rounded ${view === 'regiao' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Por Região
            </button>
            <button
                onClick={() => setView('setor')}
                className={`ml-2 px-2 py-1 text-xs rounded ${view === 'setor' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Por Setor
            </button>
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="faturamento"
              nameKey="grupo"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500">Nenhum dado de desempenho encontrado para {view}.</p>
      )}
    </div>
  );
}

