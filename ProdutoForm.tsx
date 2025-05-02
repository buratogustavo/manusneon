// src/components/produtos/ProdutoForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProdutoFormData {
  nome: string;
  codigo: string;
  preco: number | string; // Allow string for input flexibility
}

interface ProdutoFormProps {
  produto?: ProdutoFormData & { id: number }; // Optional existing product data for editing
  isEditing: boolean;
}

export default function ProdutoForm({ produto, isEditing }: ProdutoFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProdutoFormData>({
    nome: 
    codigo: 
    preco: 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && produto) {
      setFormData({
        nome: produto.nome || 
        codigo: produto.codigo || 
        preco: produto.preco || 
      });
    }
  }, [isEditing, produto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // Convert numeric fields
    if (name === "preco") {
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
    if (!formData.nome || !formData.codigo || formData.preco === "") {
        setError("Nome, Código e Preço são obrigatórios.");
        setLoading(false);
        return;
    }

    const dataToSend = {
        ...formData,
        preco: parseFloat(formData.preco.toString()),
    };

    try {
      const url = isEditing ? `/api/produtos?id=${produto?.id}` : 
      const method = isEditing ? 

      const response = await fetch(url, {
        method: method,
        headers: {
          
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao ${isEditing ? 
      }

      setSuccess(`Produto ${isEditing ? 
      // Optionally reset form or redirect
      if (!isEditing) {
        setFormData({ nome: 
      }
      // Redirect back to the product list after a short delay
      setTimeout(() => {
        router.push(
        router.refresh(); // Refresh the list page data
      }, 1500);

    } catch (err: any) {
      setError(err.message || 
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
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código *</label>
          <input type="text" name="codigo" id="codigo" required value={formData.codigo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="preco" className="block text-sm font-medium text-gray-700">Preço *</label>
          <input type="number" step="0.01" name="preco" id="preco" required value={formData.preco} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
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
            {loading ? 
          </button>
        </div>
      </div>
    </form>
  );
}

