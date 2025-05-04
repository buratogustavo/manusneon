// src/app/vendedor/produtos/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Produto {
  id: number;
  nome: string;
  codigo: string;
  preco: number;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/produtos');
        if (!response.ok) {
          throw new Error('Falha ao buscar produtos');
        }
        const data = await response.json();
        setProdutos(data);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro');
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, []);

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (produtoId: number, produtoNome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto ${produtoNome}? Esta ação não pode ser desfeita e só é possível se não houver vendas associadas.`)) {
        setLoading(true); // Indicate loading state during deletion
        setError(null);
        try {
            const response = await fetch(`/api/produtos?id=${produtoId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao excluir produto');
            }
            // Remove deleted product from state
            setProdutos(prevProdutos => prevProdutos.filter(p => p.id !== produtoId));
            alert('Produto excluído com sucesso!');
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
        <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
        <Link href="/vendedor/produtos/novo" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Novo Produto
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      {loading && <p>Carregando produtos...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredProdutos.length > 0 ? (
              filteredProdutos.map((produto) => (
                <li key={produto.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">{produto.nome}</p>
                        <p className="text-sm text-gray-500">Código: {produto.codigo}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                      <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        R$ {produto.preco.toFixed(2)}
                      </p>
                      <Link href={`/vendedor/produtos/${produto.id}/editar`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Editar
                      </Link>
                       <button
                            onClick={() => handleDelete(produto.id, produto.nome)}
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
              <li className="px-4 py-4 text-center text-sm text-gray-500">Nenhum produto encontrado.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

