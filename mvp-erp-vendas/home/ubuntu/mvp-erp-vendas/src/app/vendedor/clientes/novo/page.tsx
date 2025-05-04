// src/app/vendedor/clientes/novo/page.tsx
import ClienteForm from "@/components/clientes/ClienteForm";

export default function NovoClientePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Novo Cliente</h1>
      <ClienteForm isEditing={false} />
    </div>
  );
}

