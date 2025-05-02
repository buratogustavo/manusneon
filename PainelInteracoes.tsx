// src/components/dashboard/PainelInteracoes.tsx
"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InteracaoResumo {
  totalInteracoes: number;
  interacoesMesAtual: number;
  frequenciaDiaria?: { dia: string; quantidade: number }[]; // Optional: for frequency chart
}

// Helper to format day (e.g., DD/MM)
const formatDay = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } catch {
        return dateString; // Fallback
    }
};

export default function PainelInteracoes() {
  const [data, setData] = useState<InteracaoResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard/interacoes');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados de interações');
        }
        const result = await response.json();
        setData({
            totalInteracoes: result.totalInteracoes || 0,
            interacoesMesAtual: result.interacoesMesAtual || 0,
            // Format frequency data if present
            frequenciaDiaria: Array.isArray(result.frequenciaDiariaUltimos30Dias) ?
                result.frequenciaDiariaUltimos30Dias.map((item: any) => ({
                    dia: formatDay(item.dia),
                    quantidade: item.quantidade || 0
                })) : []
        });
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando painel de interações...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Painel de Interações</h3>
      {data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-500">Total de Interações</p>
                <p className="text-xl font-semibold text-purple-600">
                  {data.totalInteracoes.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-500">Interações (Mês Atual)</p>
                <p className="text-xl font-semibold text-purple-600">
                  {data.interacoesMesAtual.toLocaleString('pt-BR')}
                </p>
              </div>
          </div>

          {/* Optional: Frequency Chart */}
          {data.frequenciaDiaria && data.frequenciaDiaria.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mt-4 mb-2">Frequência Diária (Últimos 30 dias)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.frequenciaDiaria} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}> {/* Adjusted margins */} 
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" fontSize={10} /> {/* Smaller font for XAxis */} 
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value: number) => [value, 'Interações']} />
                  <Bar dataKey="quantidade" fill="#8884d8" name="Interações" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Dados de interação não disponíveis.</p>
      )}
    </div>
  );
}

