// src/app/vendedor/page.tsx
import Link from 'next/link';

export default function VendedorPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Área do Vendedor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Links para as seções */}
        <Link href="/vendedor/clientes" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium text-indigo-600">Clientes</h2>
          <p className="text-sm text-gray-500 mt-1">Gerenciar cadastros de clientes.</p>
        </Link>
        <Link href="/vendedor/produtos" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium text-indigo-600">Produtos</h2>
          <p className="text-sm text-gray-500 mt-1">Visualizar e gerenciar produtos.</p>
        </Link>
        <Link href="/vendedor/vendas" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium text-indigo-600">Vendas</h2>
          <p className="text-sm text-gray-500 mt-1">Registrar e visualizar vendas.</p>
        </Link>
        <Link href="/vendedor/interacoes" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium text-indigo-600">Interações</h2>
          <p className="text-sm text-gray-500 mt-1">Registrar e visualizar interações com clientes.</p>
        </Link>
        <Link href="/vendedor/metas" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium text-indigo-600">Metas</h2>
          <p className="text-sm text-gray-500 mt-1">Definir e acompanhar metas.</p>
        </Link>
      </div>
    </div>
  );
}

