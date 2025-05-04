// src/app/vendedor/vendas/nova/page.tsx
import VendaForm from "@/components/vendas/VendaForm";

export default function NovaVendaPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Registrar Nova Venda</h1>
      <VendaForm isEditing={false} />
    </div>
  );
}

