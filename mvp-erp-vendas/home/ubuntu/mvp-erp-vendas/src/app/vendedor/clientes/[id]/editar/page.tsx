// src/app/vendedor/clientes/[id]/editar/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ClienteForm from "@/components/clientes/ClienteForm";

interface ClienteData {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone?: string;
  setor?: string;
  regiao?: string;
  latitude?: number;
  longitude?: number;
}

export default function EditarClientePage() {
  const params = useParams();
  const id = params.id as string;
  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchCliente() {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/clientes?id=${id}`);
          if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Cliente não encontrado');
            } else {
                throw new Error('Falha ao buscar dados do cliente');
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
      fetchCliente();
    }
  }, [id]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Editar Cliente</h1>
      {loading && <p>Carregando dados do cliente...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}
      {!loading && !error && cliente && (
        <ClienteForm cliente={cliente} isEditing={true} />
      )}
       {!loading && !error && !cliente && (
        <p className="text-red-500">Cliente não encontrado.</p>
      )}
    </div>
  );
}

