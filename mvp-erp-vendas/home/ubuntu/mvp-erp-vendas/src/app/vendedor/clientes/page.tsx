// src/app/vendedor/clientes/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone?: string;
  setor?: string;
  regiao?: string;
  dataUltimaCompra?: string;
  ultimaInteracao?: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/clientes');
        if (!response.ok) {
          throw new Error('Falha ao buscar clientes');
        }
        const data = await response.json();
        setClientes(data);
      } catch (err: any) { // Use any or unknown and type check
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchClientes();
  }, []);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj.includes(searchTerm) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
        <Link href="/vendedor/clientes/novo" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Novo Cliente
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nome, CNPJ ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      {loading && <p>Carregando clientes...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <li key={cliente.id}>
                  <Link href={`/vendedor/clientes/${cliente.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{cliente.nome}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          {/* Optional: Add badges or status indicators here */}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500 mr-4">
                            {/* Icon for CNPJ */}
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M6 3a1 1 0 011-1h6a1 1 0 011 1v2h2a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h2V3zm1 3v2h4V6H7zm6 4H7v2h6v-2zm-1 3H8v2h4v-2z" clipRule="evenodd" />
                            </svg>
                            {cliente.cnpj}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            {/* Icon for Email */}
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {cliente.email}
                          </p>
                           {cliente.telefone && (
                             <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-4">
                                {/* Icon for Phone */}
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                   <path fillRule="evenodd" d="M17.25 6.75a.75.75 0 00-1.5 0v8.5a.75.75 0 001.5 0v-8.5zM14 6.75a.75.75 0 00-1.5 0v8.5a.75.75 0 001.5 0v-8.5zM10.75 4.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0V4.75zM7.5 7.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zM4.25 9.75a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z" clipRule="evenodd" />
                                </svg>
                                {cliente.telefone}
                              </p>
                           )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          {/* Icon for Arrow */}
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-center text-sm text-gray-500">Nenhum cliente encontrado.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

