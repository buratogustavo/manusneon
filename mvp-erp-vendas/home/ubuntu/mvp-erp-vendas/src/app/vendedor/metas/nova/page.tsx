// src/app/vendedor/metas/nova/page.tsx
import MetaForm from "@/components/metas/MetaForm";

export default function NovaMetaPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Criar Nova Meta</h1>
      <MetaForm isEditing={false} />
    </div>
  );
}

