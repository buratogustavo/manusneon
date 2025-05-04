// src/components/vendas/VendaForm.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Cliente {
  id: number;
  nome: string;
}

interface Produto {
  id: number;
  nome: string;
  preco: number; // Needed for potential price display
}

interface VendaFormData {
  clienteId: string; // Use string for select value
  produtoId: string; // Use string for select value
  preco: number | string; // Allow string for input
  dataVenda?: string; // Optional, defaults to now in API
  fatorVenda: number | string;
  condicaoPagamento: string;
}

interface VendaFormProps {
  venda?: VendaFormData & { id: number }; // Optional existing sale data for editing
  isEditing: boolean;
}

// Function to calculate commission percentage (mirrors backend logic)
function calcularComissaoPercentual(fatorVenda: number): number {
  if (fatorVenda > 1.2) {
    return 5; // 5%
  } else if (fatorVenda > 1.1) {
    return 3; // 3%
  } else {
    return 1; // 1%
  }
}

export default function VendaForm({ venda, isEditing }: VendaFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<VendaFormData>({
    clienteId: 
    produtoId: 
    preco: 
    dataVenda: 
    fatorVenda: 
    condicaoPagamento: 
  });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch clients and products for dropdowns
  useEffect(() => {
    async function fetchOptions() {
      setLoadingOptions(true);
      try {
        const [clientesRes, produtosRes] = await Promise.all([
          fetch("/api/clientes"),
          fetch("/api/produtos"),
        ]);
        if (!clientesRes.ok || !produtosRes.ok) {
          throw new Error("Falha ao carregar clientes ou produtos");
        }
        const clientesData = await clientesRes.json();
        const produtosData = await produtosRes.json();
        setClientes(clientesData);
        setProdutos(produtosData);
      } catch (err: any) {
        setError("Erro ao carregar opções: " + err.message);
      } finally {
        setLoadingOptions(false);
      }
    }
    fetchOptions();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (isEditing && venda) {
      setFormData({
        clienteId: venda.clienteId?.toString() || 
        produtoId: venda.produtoId?.toString() || 
        preco: venda.preco || 
        // Format date for input type="datetime-local" (YYYY-MM-DDTHH:mm)
        dataVenda: venda.dataVenda ? venda.dataVenda.substring(0, 16) : 
        fatorVenda: venda.fatorVenda || 
        condicaoPagamento: venda.condicaoPagamento || 
      });
    }
  }, [isEditing, venda]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // Convert numeric fields
    if (name === "preco" || name === "fatorVenda") {
      processedValue = value === "" ? "" : parseFloat(value);
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: processedValue,
    }));

    // Auto-fill price when product changes (optional)
    if (name === "produtoId") {
        const selectedProduct = produtos.find(p => p.id === parseInt(value));
        if (selectedProduct) {
            setFormData(prevState => ({
                ...prevState,
                preco: selectedProduct.preco // Set price based on selected product
            }));
        }
    }
  };

  const comissaoInfo = useMemo(() => {
    const fator = typeof formData.fatorVenda === 'number' ? formData.fatorVenda : parseFloat(formData.fatorVenda.toString());
    const preco = typeof formData.preco === 'number' ? formData.preco : parseFloat(formData.preco.toString());

    if (!isNaN(fator) && !isNaN(preco) && fator > 0 && preco > 0) {
        const percentual = calcularComissaoPercentual(fator);
        const valorComissao = preco * (percentual / 100);
        return { percentual, valor: valorComissao };
    }
    return null;
  }, [formData.fatorVenda, formData.preco]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!formData.clienteId || !formData.produtoId || formData.preco === "" || formData.fatorVenda === "" || !formData.condicaoPagamento) {
        setError("Cliente, Produto, Preço, Fator de Venda e Condição de Pagamento são obrigatórios.");
        setLoading(false);
        return;
    }

    const dataToSend = {
        ...formData,
        clienteId: parseInt(formData.clienteId),
        produtoId: parseInt(formData.produtoId),
        preco: parseFloat(formData.preco.toString()),
        fatorVenda: parseFloat(formData.fatorVenda.toString()),
        // dataVenda is optional, API handles default
        dataVenda: formData.dataVenda ? new Date(formData.dataVenda).toISOString() : undefined,
    };

    try {
      const url = isEditing ? `/api/vendas?id=${venda?.id}` : 
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

      setSuccess(`Venda ${isEditing ? 
      // Optionally reset form or redirect
      if (!isEditing) {
        setFormData({ clienteId: 
      }
      // Redirect back to the sale list after a short delay
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

  if (loadingOptions) {
    return <p>Carregando opções...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded">Erro: {error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 rounded">Sucesso: {success}</div>}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700">Cliente *</label>
          <select id="clienteId" name="clienteId" required value={formData.clienteId} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
            <option value="">Selecione um cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="produtoId" className="block text-sm font-medium text-gray-700">Produto *</label>
          <select id="produtoId" name="produtoId" required value={formData.produtoId} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
            <option value="">Selecione um produto</option>
            {produtos.map(produto => (
              <option key={produto.id} value={produto.id}>{produto.nome} (R$ {produto.preco.toFixed(2)})</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="preco" className="block text-sm font-medium text-gray-700">Preço *</label>
          <input type="number" step="0.01" name="preco" id="preco" required value={formData.preco} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

         <div className="sm:col-span-2">
          <label htmlFor="fatorVenda" className="block text-sm font-medium text-gray-700">Fator Venda *</label>
          <input type="number" step="0.01" name="fatorVenda" id="fatorVenda" required value={formData.fatorVenda} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ex: 1.15" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="condicaoPagamento" className="block text-sm font-medium text-gray-700">Cond. Pagamento *</label>
          <input type="text" name="condicaoPagamento" id="condicaoPagamento" required value={formData.condicaoPagamento} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ex: 30 dias" />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="dataVenda" className="block text-sm font-medium text-gray-700">Data da Venda (Opcional)</label>
          <input type="datetime-local" name="dataVenda" id="dataVenda" value={formData.dataVenda} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          <p className="mt-1 text-xs text-gray-500">Deixe em branco para usar a data/hora atual.</p>
        </div>

        {/* Display Calculated Commission */}
        {comissaoInfo && (
             <div className="sm:col-span-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Comissão Calculada:</p>
                <p className="text-lg font-semibold text-green-600">R$ {comissaoInfo.valor.toFixed(2)}</p>
                <p className="text-xs text-gray-500">({comissaoInfo.percentual}% sobre R$ {typeof formData.preco === 'number' ? formData.preco.toFixed(2) : parseFloat(formData.preco.toString() || '0').toFixed(2)})</p>
            </div>
        )}

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
            disabled={loading || loadingOptions}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar Venda' : 'Criar Venda')}
          </button>
        </div>
      </div>
    </form>
  );
}

