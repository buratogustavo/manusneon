// src/app/vendedor/vendas/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

interface Venda {
  id: number;
  cliente: { id: number; nome: string };
  produto: { id: number; nome: string };
  preco: number;
  dataVenda: string;
  fatorVenda: number;
  comissaoCalculada: number;
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchVendas() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/vendas');
        if (!response.ok) {
          throw new Error('Falha ao buscar vendas');
        }
        const data = await response.json();
        setVendas(data);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchVendas();
  }, []);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
        return 'Data inválida';
    }
  };

  const filteredVendas = vendas.filter(venda =>
    venda.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venda.produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Vendas</h1>
        <Link href="/vendedor/vendas/nova" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Nova Venda
        </Link>
      </div>

       <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente ou produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      {loading && <p>Carregando vendas...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredVendas.length > 0 ? (
              filteredVendas.map((venda) => (
                <li key={venda.id}>
                  {/* Make list item clickable to view details if a detail page is created */}
                  {/* <Link href={`/vendedor/vendas/${venda.id}`} className="block hover:bg-gray-50"> */}
                  <div className="px-4 py-4 sm:px-6 block hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">Venda #{venda.id} - {venda.cliente.nome}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                         <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                           R$ {venda.preco.toFixed(2)}
                         </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 mr-4">
                          {/* Icon for Product */}
                           <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.707 14.707a1 1 0 001.414 0L14 10.414V14a1 1 0 102 0V8a1 1 0 00-1-1h-6a1 1 0 100 2h3.586L8.707 13.293a1 1 0 000 1.414z" clipRule="evenodd" />
                            </svg>
                          {venda.produto.nome}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          {/* Icon for Date */}
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {formatDate(venda.dataVenda)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                         <p className="text-sm text-gray-500">Comissão: R$ {venda.comissaoCalculada.toFixed(2)} (Fator: {venda.fatorVenda.toFixed(2)})</p>
                        {/* Icon for Arrow - if linking to details */}
                        {/* <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg> */}
                      </div>
                    </div>
                  </div>
                  {/* </Link> */}
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-center text-sm text-gray-500">Nenhuma venda encontrada.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

