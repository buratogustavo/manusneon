// src/app/vendedor/interacoes/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

interface Interacao {
  id: number;
  cliente: { id: number; nome: string };
  data: string;
  descricao: string;
}

export default function InteracoesPage() {
  const [interacoes, setInteracoes] = useState<Interacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchInteracoes() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/interacoes');
        if (!response.ok) {
          throw new Error('Falha ao buscar interações');
        }
        const data = await response.json();
        setInteracoes(data);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchInteracoes();
  }, []);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
        return 'Data inválida';
    }
  };

  const filteredInteracoes = interacoes.filter(interacao =>
    interacao.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interacao.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Interações com Clientes</h1>
        <Link href="/vendedor/interacoes/nova" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Nova Interação
        </Link>
      </div>

       <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      {loading && <p>Carregando interações...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredInteracoes.length > 0 ? (
              filteredInteracoes.map((interacao) => (
                <li key={interacao.id}>
                   {/* Make list item clickable to edit if an edit page is created */}
                  {/* <Link href={`/vendedor/interacoes/${interacao.id}/editar`} className="block hover:bg-gray-50"> */}
                  <div className="px-4 py-4 sm:px-6 block hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{interacao.cliente.nome}</p>
                      <p className="text-sm text-gray-500">{formatDate(interacao.data)}</p>
                    </div>
                    <div className="mt-2">
                       <p className="text-sm text-gray-700">{interacao.descricao}</p>
                    </div>
                  </div>
                  {/* </Link> */}
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-center text-sm text-gray-500">Nenhuma interação encontrada.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

