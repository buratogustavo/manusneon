// src/app/vendedor/metas/[id]/editar/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MetaForm from "@/components/metas/MetaForm";

interface MetaData {
  id: number;
  descricao: string;
  valorAlvo: number;
  dataInicio: string;
  dataFim: string;
  tipo: 'FATURAMENTO' | 'VENDAS' | 'INTERACOES';
  // Include other fields if needed from the API response for editing
}

export default function EditarMetaPage() {
  const params = useParams();
  const id = params.id as string;
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchMeta() {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/metas?id=${id}`);
          if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Meta não encontrada');
            } else {
                throw new Error('Falha ao buscar dados da meta');
            }
          }
          const data = await response.json();
          setMeta(data);
        } catch (err: any) {
          setError(err.message || 'Ocorreu um erro');
        } finally {
          setLoading(false);
        }
      }
      fetchMeta();
    }
  }, [id]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Editar Meta</h1>
      {loading && <p>Carregando dados da meta...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}
      {!loading && !error && meta && (
        // Pass meta data to the form component
        <MetaForm meta={{
            ...meta,
            valorAlvo: meta.valorAlvo // Ensure value is passed correctly
         }} isEditing={true} />
      )}
       {!loading && !error && !meta && (
        <p className="text-red-500">Meta não encontrada.</p>
      )}
    </div>
  );
}

