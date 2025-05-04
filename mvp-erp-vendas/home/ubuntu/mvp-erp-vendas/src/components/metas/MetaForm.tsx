// src/components/metas/MetaForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MetaFormData {
  descricao: string;
  valorAlvo: number | string; // Allow string for input
  dataInicio: string;
  dataFim: string;
  tipo: 'FATURAMENTO' | 'VENDAS' | 'INTERACOES' | ''; // Enum for type
}

interface MetaFormProps {
  meta?: MetaFormData & { id: number }; // Optional existing meta data for editing
  isEditing: boolean;
}

export default function MetaForm({ meta, isEditing }: MetaFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<MetaFormData>({
    descricao: '',
    valorAlvo: '',
    dataInicio: '',
    dataFim: '',
    tipo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && meta) {
      setFormData({
        descricao: meta.descricao || '',
        valorAlvo: meta.valorAlvo || '',
        // Format date for input type="date" (YYYY-MM-DD)
        dataInicio: meta.dataInicio ? meta.dataInicio.substring(0, 10) : '',
        dataFim: meta.dataFim ? meta.dataFim.substring(0, 10) : '',
        tipo: meta.tipo || '',
      });
    }
  }, [isEditing, meta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // Convert numeric fields
    if (name === "valorAlvo") {
      processedValue = value === "" ? "" : parseFloat(value);
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.descricao || formData.valorAlvo === "" || !formData.dataInicio || !formData.dataFim || !formData.tipo) {
        setError("Todos os campos são obrigatórios.");
        setLoading(false);
        return;
    }
    if (new Date(formData.dataFim) < new Date(formData.dataInicio)) {
        setError("A data final não pode ser anterior à data inicial.");
        setLoading(false);
        return;
    }

    const dataToSend = {
        ...formData,
        valorAlvo: parseFloat(formData.valorAlvo.toString()),
        // Ensure dates are sent in correct format (API expects ISO string)
        dataInicio: new Date(formData.dataInicio).toISOString(),
        dataFim: new Date(formData.dataFim).toISOString(),
    };

    try {
      const url = isEditing ? `/api/metas?id=${meta?.id}` : '/api/metas';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao ${isEditing ? 'atualizar' : 'criar'} meta`);
      }

      setSuccess(`Meta ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
      // Optionally reset form or redirect
      if (!isEditing) {
        setFormData({ descricao: '', valorAlvo: '', dataInicio: '', dataFim: '', tipo: '' });
      }
      // Redirect back to the meta list after a short delay
      setTimeout(() => {
        router.push('/vendedor/metas');
        router.refresh(); // Refresh the list page data
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded">Erro: {error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 rounded">Sucesso: {success}</div>}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição *</label>
          <input type="text" name="descricao" id="descricao" required value={formData.descricao} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="valorAlvo" className="block text-sm font-medium text-gray-700">Valor Alvo *</label>
          <input type="number" step="any" name="valorAlvo" id="valorAlvo" required value={formData.valorAlvo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo *</label>
          <select id="tipo" name="tipo" required value={formData.tipo} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
            <option value="">Selecione o tipo</option>
            <option value="FATURAMENTO">Faturamento (R$)</option>
            <option value="VENDAS">Quantidade de Vendas</option>
            <option value="INTERACOES">Quantidade de Interações</option>
          </select>
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">Data Início *</label>
          <input type="date" name="dataInicio" id="dataInicio" required value={formData.dataInicio} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700">Data Fim *</label>
          <input type="date" name="dataFim" id="dataFim" required value={formData.dataFim} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()} // Go back to previous page
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar Meta' : 'Criar Meta')}
          </button>
        </div>
      </div>
    </form>
  );
}

