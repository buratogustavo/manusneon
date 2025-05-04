// src/app/vendedor/interacoes/nova/page.tsx
import InteracaoForm from "@/components/interacoes/InteracaoForm";

export default function NovaInteracaoPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Registrar Nova Interação</h1>
      <InteracaoForm isEditing={false} />
    </div>
  );
}

