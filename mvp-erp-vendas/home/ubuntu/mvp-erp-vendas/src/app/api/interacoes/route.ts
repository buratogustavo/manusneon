import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/interacoes - List all interactions or find by ID or Client ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const clienteId = searchParams.get('clienteId');

  try {
    let whereClause = {};
    if (id) {
      whereClause = { id: parseInt(id, 10) };
    } else if (clienteId) {
      whereClause = { clienteId: parseInt(clienteId, 10) };
    }

    const interacoes = await prisma.interacao.findMany({
      where: whereClause,
      include: {
        cliente: { select: { id: true, nome: true } }, // Include basic client info
      },
      orderBy: {
        data: 'desc',
      },
    });

    if (id && interacoes.length === 0) {
        return NextResponse.json({ error: 'Interação não encontrada' }, { status: 404 });
    }

    return NextResponse.json(id ? interacoes[0] : interacoes);
  } catch (error) {
    console.error('Erro ao buscar interações:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar interações' }, { status: 500 });
  }
}

// POST /api/interacoes - Create a new interaction
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Basic validation
    if (!data.clienteId || !data.descricao) {
      return NextResponse.json({ error: 'Cliente e Descrição são obrigatórios' }, { status: 400 });
    }

    const clienteId = parseInt(data.clienteId, 10);
    const dataInteracao = data.data ? new Date(data.data) : new Date(); // Use provided date or now

    // Check if client exists
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Use a transaction to create the interaction and update the client
    const novaInteracao = await prisma.$transaction(async (tx) => {
      const interacao = await tx.interacao.create({
        data: {
          clienteId: clienteId,
          data: dataInteracao,
          descricao: data.descricao,
        },
      });

      // Update client's last interaction date
      await tx.cliente.update({
        where: { id: clienteId },
        data: {
          ultimaInteracao: dataInteracao,
        },
      });

      return interacao;
    });

    return NextResponse.json(novaInteracao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar interação:', error);
    return NextResponse.json({ error: 'Erro interno ao criar interação' }, { status: 500 });
  }
}

// PUT /api/interacoes - Update an existing interaction (by ID)
export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID da interação é obrigatório para atualização' }, { status: 400 });
    }

    try {
        const data = await request.json();
        const interacaoId = parseInt(id, 10);

        // Basic validation
        if (!data.clienteId || !data.descricao) {
            return NextResponse.json({ error: 'Cliente e Descrição são obrigatórios' }, { status: 400 });
        }

        const clienteId = parseInt(data.clienteId, 10);
        const dataInteracao = data.data ? new Date(data.data) : undefined; // Allow updating date

        // Check if interaction and client exist
        const existingInteracao = await prisma.interacao.findUnique({ where: { id: interacaoId } });
        if (!existingInteracao) {
            return NextResponse.json({ error: 'Interação não encontrada' }, { status: 404 });
        }
        const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
        if (!cliente) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
        }

        // Update interaction
        // Consider implications: Should updating an interaction also update the client's last interaction date?
        // This might require complex logic if multiple interactions exist.
        // For simplicity here, we only update the interaction record.
        // Updating client's last interaction upon interaction *update* is omitted, unless the date is explicitly changed.
        const updatedInteracao = await prisma.interacao.update({
            where: { id: interacaoId },
            data: {
                clienteId: clienteId,
                data: dataInteracao, // Update date if provided
                descricao: data.descricao,
            },
        });

        // Optional: Add logic here if client's last interaction needs recalculation based on the *latest* interaction.
        if (dataInteracao) {
             // Find the latest interaction date for the client after the update
            const latestInteraction = await prisma.interacao.findFirst({
                where: { clienteId: clienteId },
                orderBy: { data: 'desc' },
                select: { data: true },
            });
            if (latestInteraction) {
                await prisma.cliente.update({
                    where: { id: clienteId },
                    data: { ultimaInteracao: latestInteraction.data },
                });
            }
        }

        return NextResponse.json(updatedInteracao);
    } catch (error) {
        console.error('Erro ao atualizar interação:', error);
        return NextResponse.json({ error: 'Erro interno ao atualizar interação' }, { status: 500 });
    }
}


// DELETE /api/interacoes - Delete an interaction (by ID)
// Consider implications: Should deleting an interaction update the client's last interaction date?
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID da interação é obrigatório para exclusão' }, { status: 400 });
    }

    try {
        const interacaoId = parseInt(id, 10);

        // Check if interaction exists
        const existingInteracao = await prisma.interacao.findUnique({ where: { id: interacaoId } });
        if (!existingInteracao) {
            return NextResponse.json({ error: 'Interação não encontrada' }, { status: 404 });
        }

        const clienteId = existingInteracao.clienteId;

        await prisma.interacao.delete({ where: { id: interacaoId } });

        // Optional: Find the *new* last interaction for the client and update them.
        const latestInteraction = await prisma.interacao.findFirst({
            where: { clienteId: clienteId },
            orderBy: { data: 'desc' },
            select: { data: true },
        });

        await prisma.cliente.update({
            where: { id: clienteId },
            data: { ultimaInteracao: latestInteraction ? latestInteraction.data : null }, // Set to null if no interactions left
        });

        return NextResponse.json({ message: 'Interação excluída com sucesso' }, { status: 200 });

    } catch (error) {
        console.error('Erro ao excluir interação:', error);
        return NextResponse.json({ error: 'Erro interno ao excluir interação' }, { status: 500 });
    }
}

