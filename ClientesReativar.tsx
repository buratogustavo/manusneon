// src/components/dashboard/ClientesReativar.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

interface ClienteReativar {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  ultimaInteracao?: string;
  dataUltimaCompra?: string;
}

export default function ClientesReativar() {
  const [clientes, setClientes] = useState<ClienteReativar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard/reativar');
        if (!response.ok) {
          throw new Error('Falha ao buscar clientes para reativar');
        }
        const result = await response.json();
        setClientes(Array.isArray(result) ? result : []);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Nunca';
    try {
        return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
        return 'Data inválida';
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando clientes para reativar...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Clientes para Reativar (&gt; 30 dias)</h3>
      {clientes.length > 0 ? (
        <ul role="list" className="divide-y divide-gray-200 max-h-60 overflow-y-auto"> {/* Added scroll */} 
          {clientes.map((cliente) => (
            <li key={cliente.id} className="py-3 flex justify-between items-center">
              <div>
                <Link href={`/vendedor/clientes/${cliente.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate">
                  {cliente.nome}
                </Link>
                <p className="text-xs text-gray-500">
                  Últ. Contato: {formatDate(cliente.ultimaInteracao)} | Últ. Compra: {formatDate(cliente.dataUltimaCompra)}
                </p>
              </div>
              <Link
                href={`/vendedor/interacoes/nova?clienteId=${cliente.id}`}
                className="ml-4 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Interagir
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">Nenhum cliente precisando de reativação no momento.</p>
      )}
    </div>
  );
}

