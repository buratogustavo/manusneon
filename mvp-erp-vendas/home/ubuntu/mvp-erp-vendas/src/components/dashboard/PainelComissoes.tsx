// src/components/dashboard/PainelComissoes.tsx
"use client";

import { useState, useEffect } from 'react';

interface ComissaoData {
  totalComissao: number;
  comissaoMesAtual: number;
  // Add individual commission data if API provides it
  // comissoesIndividuais?: { vendedor: string; valor: number }[];
}

export default function PainelComissoes() {
  const [data, setData] = useState<ComissaoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard/comissoes');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados de comissões');
        }
        const result = await response.json();
        setData({
            totalComissao: result.totalComissao || 0,
            comissaoMesAtual: result.comissaoMesAtual || 0,
            // Map individual data if available
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
    return <p className="text-sm text-gray-500">Carregando painel de comissões...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Painel de Comissões</h3>
      {data ? (
        <div className="space-y-2">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-500">Comissão Total (Geral)</p>
            <p className="text-xl font-semibold text-blue-600">
              R$ {data.totalComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-500">Comissão (Mês Atual)</p>
            <p className="text-xl font-semibold text-green-600">
              R$ {data.comissaoMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          {/* Add section for individual commissions if applicable */}
          {/* {data.comissoesIndividuais && data.comissoesIndividuais.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mt-4 mb-2">Comissões Individuais (Exemplo)</h4>
              <ul className="divide-y divide-gray-200">
                {data.comissoesIndividuais.map((comissao, index) => (
                  <li key={index} className="py-2 flex justify-between">
                    <span className="text-sm text-gray-800">{comissao.vendedor}</span>
                    <span className="text-sm font-medium text-gray-900">R$ {comissao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </li>
                ))}
              </ul>
            </div>
          )} */}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Dados de comissão não disponíveis.</p>
      )}
    </div>
  );
}

