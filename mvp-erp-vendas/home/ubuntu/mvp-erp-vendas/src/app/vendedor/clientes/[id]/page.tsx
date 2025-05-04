// src/app/vendedor/clientes/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // Import dynamic
import { format, parseISO } from 'date-fns'; // For date formatting

// Dynamically import the MapDisplay component to avoid SSR issues with Leaflet
const MapDisplay = dynamic(() => import('@/components/ui/MapDisplay'), {
  ssr: false,
  loading: () => <p>Carregando mapa...</p>,
});

interface Venda {
    id: number;
    produto: { nome: string };
    preco: number;
    dataVenda: string;
    fatorVenda: number;
}

interface Interacao {
    id: number;
    data: string;
    descricao: string;
}

interface ClienteDetalhes {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone?: string;
  setor?: string;
  regiao?: string;
  latitude?: number;
  longitude?: number;
  dataUltimaCompra?: string;
  fatorVendaUltimaCompra?: number;
  condicaoPagamentoUltimaCompra?: string;
  ultimaInteracao?: string;
  createdAt: string;
  updatedAt: string;
  vendas: Venda[];
  interacoes: Interacao[];
}

export default function ClienteDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [cliente, setCliente] = useState<ClienteDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchClienteDetalhes() {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/clientes?id=${id}`);
          if (!response.ok) {
             if (response.status === 404) {
                throw new Error('Cliente não encontrado');
            } else {
                throw new Error('Falha ao buscar detalhes do cliente');
            }
          }
          const data = await response.json();
          setCliente(data);
        } catch (err: any) {
          setError(err.message || 'Ocorreu um erro');
        } finally {
          setLoading(false);
        }
      }
      fetchClienteDetalhes();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!cliente) return;
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}? Esta ação não pode ser desfeita.`)) {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/clientes?id=${cliente.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao excluir cliente');
            }
            alert('Cliente excluído com sucesso!');
            router.push('/vendedor/clientes');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao excluir');
            setLoading(false);
        }
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
        return 'Data inválida';
    }
  };

  return (
    <div>
      {loading && <p>Carregando detalhes do cliente...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}
      {!loading && !error && cliente && (
        <div>
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-semibold text-gray-900">Detalhes do Cliente: {cliente.nome}</h1>
             <div>
                <Link href={`/vendedor/clientes/${cliente.id}/editar`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2">
                    Editar
                </Link>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                    Excluir
                </button>
             </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Informações Gerais</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nome</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.nome}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">CNPJ</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.cnpj}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">E-mail</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.email}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.telefone || 'N/A'}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Setor</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.setor || 'N/A'}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Região</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.regiao || 'N/A'}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Última Compra</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(cliente.dataUltimaCompra)}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fator Venda (Últ. Compra)</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.fatorVendaUltimaCompra?.toFixed(2) || 'N/A'}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Cond. Pagto (Últ. Compra)</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.condicaoPagamentoUltimaCompra || 'N/A'}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Última Interação</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(cliente.ultimaInteracao)}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Criado em</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(cliente.createdAt)}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Atualizado em</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(cliente.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Map Section */}
          {cliente.latitude && cliente.longitude && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Localização (Região: {cliente.regiao || 'N/A'})</h3>
                </div>
                <div className="border-t border-gray-200 p-4">
                    <MapDisplay latitude={cliente.latitude} longitude={cliente.longitude} popupText={cliente.nome} />
                </div>
            </div>
          )}

          {/* Vendas History */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Histórico de Vendas</h3>
            </div>
            <div className="border-t border-gray-200">
               <ul role="list" className="divide-y divide-gray-200">
                {cliente.vendas && cliente.vendas.length > 0 ? (
                    cliente.vendas.map((venda) => (
                        <li key={venda.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">{venda.produto.nome} - {formatDate(venda.dataVenda)}</p>
                                <p className="text-sm text-green-600">R$ {venda.preco.toFixed(2)}</p>
                            </div>
                            <p className="text-sm text-gray-500">Fator: {venda.fatorVenda.toFixed(2)}</p>
                        </li>
                    ))
                ) : (
                    <li className="px-4 py-4 text-center text-sm text-gray-500">Nenhuma venda registrada.</li>
                )}
                </ul>
            </div>
          </div>

          {/* Interacoes History */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Histórico de Interações</h3>
            </div>
            <div className="border-t border-gray-200">
               <ul role="list" className="divide-y divide-gray-200">
                {cliente.interacoes && cliente.interacoes.length > 0 ? (
                    cliente.interacoes.map((interacao) => (
                        <li key={interacao.id} className="px-4 py-4 sm:px-6">
                            <p className="text-sm font-medium text-gray-900">{formatDate(interacao.data)}</p>
                            <p className="text-sm text-gray-500 mt-1">{interacao.descricao}</p>
                        </li>
                    ))
                ) : (
                    <li className="px-4 py-4 text-center text-sm text-gray-500">Nenhuma interação registrada.</li>
                )}
                </ul>
            </div>
          </div>

        </div>
      )}
      {!loading && !error && !cliente && (
        <p className="text-red-500">Cliente não encontrado.</p>
      )}
    </div>
  );
}

