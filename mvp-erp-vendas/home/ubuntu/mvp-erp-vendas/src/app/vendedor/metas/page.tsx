// src/app/vendedor/metas/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

interface Meta {
  id: number;
  descricao: string;
  valorAlvo: number;
  dataInicio: string;
  dataFim: string;
  tipo: string; // 'FATURAMENTO', 'VENDAS', 'INTERACOES'
}

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchMetas() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/metas');
        if (!response.ok) {
          throw new Error('Falha ao buscar metas');
        }
        const data = await response.json();
        setMetas(data);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchMetas();
  }, []);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
        // Only show date part for start/end dates
        return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
        return 'Data inválida';
    }
  };

  const formatTipoMeta = (tipo: string) => {
    switch (tipo) {
        case 'FATURAMENTO': return 'Faturamento';
        case 'VENDAS': return 'Qtd. Vendas';
        case 'INTERACOES': return 'Qtd. Interações';
        default: return tipo;
    }
  }

  const filteredMetas = metas.filter(meta =>
    meta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatTipoMeta(meta.tipo).toLowerCase().includes(searchTerm.toLowerCase())
  );

   const handleDelete = async (metaId: number, metaDescricao: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a meta "${metaDescricao}"? Esta ação não pode ser desfeita.`)) {
        setLoading(true); // Indicate loading state during deletion
        setError(null);
        try {
            const response = await fetch(`/api/metas?id=${metaId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao excluir meta');
            }
            // Remove deleted meta from state
            setMetas(prevMetas => prevMetas.filter(m => m.id !== metaId));
            alert('Meta excluída com sucesso!');
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao excluir');
        } finally {
            setLoading(false);
        }
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Metas</h1>
        <Link href="/vendedor/metas/nova" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Nova Meta
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por descrição ou tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      {loading && <p>Carregando metas...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredMetas.length > 0 ? (
              filteredMetas.map((meta) => (
                <li key={meta.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">{meta.descricao}</p>
                        <p className="text-sm text-gray-500">Tipo: {formatTipoMeta(meta.tipo)} | Período: {formatDate(meta.dataInicio)} a {formatDate(meta.dataFim)}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                      <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Alvo: {meta.tipo === 'FATURAMENTO' ? `R$ ${meta.valorAlvo.toFixed(2)}` : meta.valorAlvo}
                      </p>
                      <Link href={`/vendedor/metas/${meta.id}/editar`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Editar
                      </Link>
                       <button
                            onClick={() => handleDelete(meta.id, meta.descricao)}
                            disabled={loading} // Disable button while deleting
                            className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                        >
                            Excluir
                        </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-center text-sm text-gray-500">Nenhuma meta encontrada.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

