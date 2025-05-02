import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clientes - List all clients or find by CNPJ
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get('cnpj');
  const id = searchParams.get('id');

  try {
    if (id) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: parseInt(id, 10) },
        include: { vendas: true, interacoes: true }, // Include related data if needed
      });
      if (!cliente) {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
      }
      return NextResponse.json(cliente);
    } else if (cnpj) {
       const cliente = await prisma.cliente.findUnique({
        where: { cnpj: cnpj },
        include: { vendas: true, interacoes: true },
      });
       if (!cliente) {
        return NextResponse.json({ error: 'Cliente não encontrado com este CNPJ' }, { status: 404 });
      }
      return NextResponse.json(cliente);
    }
     else {
      const clientes = await prisma.cliente.findMany({
        orderBy: {
          nome: 'asc',
        },
      });
      return NextResponse.json(clientes);
    }
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar clientes' }, { status: 500 });
  }
}

// POST /api/clientes - Create a new client
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Basic validation (can be expanded)
    if (!data.nome || !data.cnpj || !data.email) {
      return NextResponse.json({ error: 'Nome, CNPJ e E-mail são obrigatórios' }, { status: 400 });
    }

    // Add geocoding logic here later if needed based on 'regiao' or address
    // For now, latitude/longitude are optional

    const novoCliente = await prisma.cliente.create({
      data: {
        nome: data.nome,
        cnpj: data.cnpj,
        email: data.email,
        telefone: data.telefone,
        setor: data.setor,
        regiao: data.regiao,
        latitude: data.latitude, // Optional
        longitude: data.longitude, // Optional
        // dataUltimaCompra, fatorVendaUltimaCompra, condicaoPagamentoUltimaCompra, ultimaInteracao will be updated by other operations
      },
    });
    return NextResponse.json(novoCliente, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    if (error.code === 'P2002') { // Unique constraint violation (e.g., CNPJ or email already exists)
        return NextResponse.json({ error: `Já existe um cliente com este ${error.meta?.target?.includes('cnpj') ? 'CNPJ' : 'E-mail'}.` }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno ao criar cliente' }, { status: 500 });
  }
}

// PUT /api/clientes - Update an existing client (by ID)
export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID do cliente é obrigatório para atualização' }, { status: 400 });
    }

    try {
        const data = await request.json();
        const clienteId = parseInt(id, 10);

        // Check if client exists
        const existingCliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
        if (!existingCliente) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
        }

        const updatedCliente = await prisma.cliente.update({
            where: { id: clienteId },
            data: {
                nome: data.nome,
                cnpj: data.cnpj,
                email: data.email,
                telefone: data.telefone,
                setor: data.setor,
                regiao: data.regiao,
                latitude: data.latitude,
                longitude: data.longitude,
                // Other fields like ultimaCompra etc. should be updated via their respective operations (Venda, Interacao)
            },
        });
        return NextResponse.json(updatedCliente);
    } catch (error: any) {
        console.error('Erro ao atualizar cliente:', error);
         if (error.code === 'P2002') { // Unique constraint violation
            return NextResponse.json({ error: `Já existe um cliente com este ${error.meta?.target?.includes('cnpj') ? 'CNPJ' : 'E-mail'}.` }, { status: 409 });
        }
        return NextResponse.json({ error: 'Erro interno ao atualizar cliente' }, { status: 500 });
    }
}

// DELETE /api/clientes - Delete a client (by ID)
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID do cliente é obrigatório para exclusão' }, { status: 400 });
    }

    try {
        const clienteId = parseInt(id, 10);

        // Check if client exists
        const existingCliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
        if (!existingCliente) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
        }

        // Add logic here to check for related records (Vendas, Interacoes) if deletion should be restricted
        // Example: Check if there are vendas associated
        const vendasCount = await prisma.venda.count({ where: { clienteId: clienteId } });
        if (vendasCount > 0) {
             return NextResponse.json({ error: 'Não é possível excluir cliente com vendas registradas.' }, { status: 400 });
        }
        // Similar check for Interacoes if needed

        await prisma.cliente.delete({ where: { id: clienteId } });

        return NextResponse.json({ message: 'Cliente excluído com sucesso' }, { status: 200 });

    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        // Handle potential errors, e.g., foreign key constraints if not checked above
        return NextResponse.json({ error: 'Erro interno ao excluir cliente' }, { status: 500 });
    }
}

