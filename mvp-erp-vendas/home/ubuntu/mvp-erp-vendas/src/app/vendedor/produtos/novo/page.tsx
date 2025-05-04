// src/app/vendedor/produtos/novo/page.tsx
import ProdutoForm from "@/components/produtos/ProdutoForm";

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Novo Produto</h1>
      <ProdutoForm isEditing={false} />
    </div>
  );
}

