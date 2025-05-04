// src/app/vendedor/vendas/[id]/editar/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import VendaForm from "@/components/vendas/VendaForm";

interface VendaData {
  id: number;
  clienteId: number;
  produtoId: number;
  preco: number;
  dataVenda?: string;
  fatorVenda: number;
  condicaoPagamento: string;
  // Include other fields if needed from the API response for editing
}

export default function EditarVendaPage() {
  const params = useParams();
  const id = params.id as string;
  const [venda, setVenda] = useState<VendaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchVenda() {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/vendas?id=${id}`);
          if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Venda não encontrada');
            } else {
                throw new Error('Falha ao buscar dados da venda');
            }
          }
          const data = await response.json();
          setVenda(data);
        } catch (err: any) {
          setError(err.message || 'Ocorreu um erro');
        } finally {
          setLoading(false);
        }
      }
      fetchVenda();
    }
  }, [id]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Editar Venda</h1>
      {loading && <p>Carregando dados da venda...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}
      {!loading && !error && venda && (
        // Pass venda data to the form component
        // Ensure the VendaFormProps and VendaData interfaces match the expected structure
        <VendaForm venda={{
            ...venda,
            clienteId: venda.clienteId.toString(), // Convert IDs to string for select
            produtoId: venda.produtoId.toString(),
            preco: venda.preco,
            fatorVenda: venda.fatorVenda,
            condicaoPagamento: venda.condicaoPagamento,
            dataVenda: venda.dataVenda
         }} isEditing={true} />
      )}
       {!loading && !error && !venda && (
        <p className="text-red-500">Venda não encontrada.</p>
      )}
    </div>
  );
}

