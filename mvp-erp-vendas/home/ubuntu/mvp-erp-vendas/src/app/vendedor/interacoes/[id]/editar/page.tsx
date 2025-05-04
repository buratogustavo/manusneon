// src/app/vendedor/interacoes/[id]/editar/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InteracaoForm from "@/components/interacoes/InteracaoForm";

interface InteracaoData {
  id: number;
  clienteId: number;
  data?: string;
  descricao: string;
  // Include other fields if needed from the API response for editing
}

export default function EditarInteracaoPage() {
  const params = useParams();
  const id = params.id as string;
  const [interacao, setInteracao] = useState<InteracaoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchInteracao() {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/interacoes?id=${id}`);
          if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Interação não encontrada');
            } else {
                throw new Error('Falha ao buscar dados da interação');
            }
          }
          const data = await response.json();
          setInteracao(data);
        } catch (err: any) {
          setError(err.message || 'Ocorreu um erro');
        } finally {
          setLoading(false);
        }
      }
      fetchInteracao();
    }
  }, [id]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Editar Interação</h1>
      {loading && <p>Carregando dados da interação...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}
      {!loading && !error && interacao && (
        // Pass interaction data to the form component
        <InteracaoForm interacao={{
            ...interacao,
            clienteId: interacao.clienteId.toString(), // Convert ID to string for select
            descricao: interacao.descricao,
            data: interacao.data
         }} isEditing={true} />
      )}
       {!loading && !error && !interacao && (
        <p className="text-red-500">Interação não encontrada.</p>
      )}
    </div>
  );
}

