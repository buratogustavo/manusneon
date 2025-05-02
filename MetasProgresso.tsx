// src/components/dashboard/MetasProgresso.tsx
"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface MetaProgresso {
  id: number;
  descricao: string;
  valorAlvo: number;
  valorAtingido: number;
  tipo: string; // FATURAMENTO, VENDAS, INTERACOES
  dataInicio: string;
  dataFim: string;
}

// Helper to format currency or plain number based on type
const formatValue = (value: number, tipo: string) => {
    if (tipo === 'FATURAMENTO') {
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value.toLocaleString('pt-BR');
};

export default function MetasProgresso() {
  const [data, setData] = useState<MetaProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add state for filters if needed (e.g., month/year)
  const [ano] = useState(new Date().getFullYear());
  const [mes] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch progress for current month/year (adjust API call as needed)
        const response = await fetch(`/api/dashboard?metric=metas_progresso&ano=${ano}&mes=${mes}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar progresso das metas');
        }
        const result = await response.json();
        // Ensure result is an array
        setData(Array.isArray(result.metasComProgresso) ? result.metasComProgresso : []);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [ano, mes]);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando progresso das metas...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Erro: {error}</p>;
  }

  const chartData = data.map(item => ({
      name: item.descricao.length > 20 ? item.descricao.substring(0, 17) + '...' : item.descricao, // Shorten name
      Alvo: item.valorAlvo,
      Atingido: item.valorAtingido,
      tipo: item.tipo // Pass type for tooltip/label formatting
  }));

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Progresso das Metas (Mês Atual)</h3>
      {/* Add filter controls here if implemented */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value, index) => {
                // Find the corresponding data item to get the type
                const item = data[index];
                return item ? formatValue(value, item.tipo) : value.toLocaleString('pt-BR');
            }} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={(value: number, name: string, props: any) => {
                const tipo = props.payload.tipo;
                const formattedValue = formatValue(value, tipo);
                const label = name === 'Alvo' ? 'Meta' : 'Atingido';
                return [formattedValue, label];
            }} />
            <Legend />
            <Bar dataKey="Atingido" fill="#82ca9d" name="Valor Atingido" />
            <Bar dataKey="Alvo" fill="#8884d8" name="Valor Alvo" />
             {/* Optional: Add a reference line for 100% if applicable, might need different chart type */}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500">Nenhuma meta ativa encontrada para o período.</p>
      )}
    </div>
  );
}

