// src/components/dashboard/FaturamentoTotal.tsx
"use client";

import { useState, useEffect } from 'react';

interface FaturamentoData {
  totalFaturamento: number;
  faturamentoMesAtual: number;
}

export default function FaturamentoTotal() {
  const [data, setData] = useState<FaturamentoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Assuming the main dashboard endpoint provides this summary
        // Adjust the endpoint if necessary
        const response = await fetch('/api/dashboard?metric=faturamento');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados de faturamento');
        }
        const result = await response.json();
        setData({
            totalFaturamento: result.totalFaturamento || 0,
            faturamentoMesAtual: result.faturamentoMesAtual || 0
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
    return <p className="text-sm text-gray-500">Carregando faturamento...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Faturamento</h3>
      {data ? (
        <div className="space-y-1">
          <p className="text-2xl font-semibold text-green-600">
            R$ {data.totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500">
            (Mês Atual: R$ {data.faturamentoMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Dados não disponíveis.</p>
      )}
    </div>
  );
}

