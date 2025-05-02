// src/components/clientes/ClienteForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClienteFormData {
  nome: string;
  cnpj: string;
  email: string;
  telefone?: string;
  setor?: string;
  regiao?: string;
  latitude?: number | string; // Allow string for input flexibility
  longitude?: number | string;
}

interface ClienteFormProps {
  cliente?: ClienteFormData & { id: number }; // Optional existing client data for editing
  isEditing: boolean;
}

export default function ClienteForm({ cliente, isEditing }: ClienteFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    setor: '',
    regiao: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && cliente) {
      setFormData({
        nome: cliente.nome || '',
        cnpj: cliente.cnpj || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        setor: cliente.setor || '',
        regiao: cliente.regiao || '',
        latitude: cliente.latitude?.toString() || '', // Convert to string for input
        longitude: cliente.longitude?.toString() || '', // Convert to string for input
      });
    }
  }, [isEditing, cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Convert lat/lon back to numbers or null if empty
    const dataToSend = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude.toString()) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude.toString()) : null,
    };

    // Basic validation
    if (!dataToSend.nome || !dataToSend.cnpj || !dataToSend.email) {
        setError("Nome, CNPJ e E-mail são obrigatórios.");
        setLoading(false);
        return;
    }

    try {
      const url = isEditing ? `/api/clientes?id=${cliente?.id}` : '/api/clientes';
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
        throw new Error(errorData.error || `Falha ao ${isEditing ? 'atualizar' : 'criar'} cliente`);
      }

      setSuccess(`Cliente ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      // Optionally reset form or redirect
      if (!isEditing) {
        setFormData({ nome: '', cnpj: '', email: '', telefone: '', setor: '', regiao: '', latitude: '', longitude: '' });
      }
      // Redirect back to the client list after a short delay
      setTimeout(() => {
        router.push('/vendedor/clientes');
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
        <div className="sm:col-span-3">
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome *</label>
          <input type="text" name="nome" id="nome" required value={formData.nome} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ *</label>
          <input type="text" name="cnpj" id="cnpj" required value={formData.cnpj} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="00.000.000/0000-00" />
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail *</label>
          <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone</label>
          <input type="tel" name="telefone" id="telefone" value={formData.telefone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="setor" className="block text-sm font-medium text-gray-700">Setor</label>
          <input type="text" name="setor" id="setor" value={formData.setor} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="regiao" className="block text-sm font-medium text-gray-700">Região</label>
          <input type="text" name="regiao" id="regiao" value={formData.regiao} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

         {/* Optional Latitude/Longitude for map feature */}
         <div className="sm:col-span-3">
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude (Opcional)</label>
          <input type="number" step="any" name="latitude" id="latitude" value={formData.latitude} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
         <div className="sm:col-span-3">
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude (Opcional)</label>
          <input type="number" step="any" name="longitude" id="longitude" value={formData.longitude} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
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
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar Cliente' : 'Criar Cliente')}
          </button>
        </div>
      </div>
    </form>
  );
}

