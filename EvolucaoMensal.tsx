// src/components/dashboard/EvolucaoMensal.tsx
"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EvolucaoData {
  mes: number;
  ano: number;
  faturamento: number;
}

// Helper to get month name
const getMonthName = (monthNumber: number) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('pt-BR', { month: 'short' });
};

export default function EvolucaoMensal() {
  const [data, setData] = useState<EvolucaoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anoAtual] = useState(new Date().getFullYear()); // Get current year

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch data for the current year
        const response = await fetch(`/api/dashboard?metric=evolucao_mensal&ano=${anoAtual}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar dados de evolução mensal');
        }
        const result = await response.json();
        // Ensure result is an array and format for chart
        const formattedData = Array.isArray(result.evolucaoMensal) ? result.evolucaoMensal.map((item: any) => ({
            mes: item.mes,
            ano: item.ano,
            faturamento: item.faturamento || 0,
            // Add month name for XAxis display
            nomeMes: getMonthName(item.mes)
        })) : [];
        setData(formattedData);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [anoAtual]);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando gráfico de evolução...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução Mensal ({anoAtual})</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nomeMes" />
            <YAxis tickFormatter={(value) => `R$${value.toLocaleString('pt-BR')}`} />
            <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Faturamento"]} />
            <Legend />
            <Bar dataKey="faturamento" fill="#4f46e5" name="Faturamento" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500">Nenhum dado de faturamento mensal encontrado para {anoAtual}.</p>
      )}
    </div>
  );
}

