// src/app/vendedor/produtos/[id]/editar/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProdutoForm from "@/components/produtos/ProdutoForm";

interface ProdutoData {
  id: number;
  nome: string;
  codigo: string;
  preco: number;
  // Include other fields if needed from the API response for editing
}

export default function EditarProdutoPage() {
  const params = useParams();
  const id = params.id as string;
  const [produto, setProduto] = useState<ProdutoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchProduto() {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/produtos?id=${id}`);
          if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Produto não encontrado');
            } else {
                throw new Error('Falha ao buscar dados do produto');
            }
          }
          const data = await response.json();
          setProduto(data);
        } catch (err: any) {
          setError(err.message || 'Ocorreu um erro');
        } finally {
          setLoading(false);
        }
      }
      fetchProduto();
    }
  }, [id]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Editar Produto</h1>
      {loading && <p>Carregando dados do produto...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}
      {!loading && !error && produto && (
        // Pass product data to the form component
        <ProdutoForm produto={{
            ...produto,
            preco: produto.preco // Ensure price is passed correctly
         }} isEditing={true} />
      )}
       {!loading && !error && !produto && (
        <p className="text-red-500">Produto não encontrado.</p>
      )}
    </div>
  );
}

