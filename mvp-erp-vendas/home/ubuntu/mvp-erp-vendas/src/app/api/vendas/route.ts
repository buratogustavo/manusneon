import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Function to calculate commission
function calcularComissao(fatorVenda: number): number {
  if (fatorVenda > 1.2) {
    return 0.05; // 5%
  } else if (fatorVenda > 1.1) {
    return 0.03; // 3%
  } else {
    return 0.01; // 1%
  }
}

// GET /api/vendas - List all sales or find by ID
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

    const vendas = await prisma.venda.findMany({
      where: whereClause,
      include: {
        cliente: { select: { id: true, nome: true } }, // Include basic client info
        produto: { select: { id: true, nome: true, codigo: true } }, // Include basic product info
      },
      orderBy: {
        dataVenda: 'desc',
      },
    });

    if (id && vendas.length === 0) {
        return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
    }

    return NextResponse.json(id ? vendas[0] : vendas);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar vendas' }, { status: 500 });
  }
}

// POST /api/vendas - Create a new sale
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Basic validation
    if (!data.clienteId || !data.produtoId || !data.preco || !data.fatorVenda || !data.condicaoPagamento) {
      return NextResponse.json({ error: 'Cliente, Produto, Preço, Fator de Venda e Condição de Pagamento são obrigatórios' }, { status: 400 });
    }

    const clienteId = parseInt(data.clienteId, 10);
    const produtoId = parseInt(data.produtoId, 10);
    const preco = parseFloat(data.preco);
    const fatorVenda = parseFloat(data.fatorVenda);
    const dataVenda = data.dataVenda ? new Date(data.dataVenda) : new Date(); // Use provided date or now

    // Check if client and product exist
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }
    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Calculate commission
    const comissaoPercentual = calcularComissao(fatorVenda);
    const comissaoCalculada = preco * comissaoPercentual;

    // Use a transaction to create the sale and update the client
    const novaVenda = await prisma.$transaction(async (tx) => {
      const venda = await tx.venda.create({
        data: {
          clienteId: clienteId,
          produtoId: produtoId,
          preco: preco,
          dataVenda: dataVenda,
          fatorVenda: fatorVenda,
          condicaoPagamento: data.condicaoPagamento,
          comissaoCalculada: comissaoCalculada, // Store the calculated commission value
        },
      });

      // Update client's last purchase info
      await tx.cliente.update({
        where: { id: clienteId },
        data: {
          dataUltimaCompra: dataVenda,
          fatorVendaUltimaCompra: fatorVenda,
          condicaoPagamentoUltimaCompra: data.condicaoPagamento,
        },
      });

      return venda;
    });

    return NextResponse.json(novaVenda, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    return NextResponse.json({ error: 'Erro interno ao criar venda' }, { status: 500 });
  }
}

// PUT /api/vendas - Update an existing sale (by ID)
// Note: Updating sales might have implications on commissions and client history.
// Decide if updates should be allowed and how they affect related data.
// For simplicity, this example allows updating basic fields.
export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID da venda é obrigatório para atualização' }, { status: 400 });
    }

    try {
        const data = await request.json();
        const vendaId = parseInt(id, 10);

        // Basic validation
        if (!data.clienteId || !data.produtoId || !data.preco || !data.fatorVenda || !data.condicaoPagamento) {
         return NextResponse.json({ error: 'Todos os campos são obrigatórios para atualização' }, { status: 400 });
        }

        const clienteId = parseInt(data.clienteId, 10);
        const produtoId = parseInt(data.produtoId, 10);
        const preco = parseFloat(data.preco);
        const fatorVenda = parseFloat(data.fatorVenda);
        const dataVenda = data.dataVenda ? new Date(data.dataVenda) : undefined; // Allow updating date

        // Check if sale, client, and product exist
        const existingVenda = await prisma.venda.findUnique({ where: { id: vendaId } });
        if (!existingVenda) {
            return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
        }
        const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
        const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
        if (!cliente || !produto) {
            return NextResponse.json({ error: 'Cliente ou Produto não encontrado' }, { status: 404 });
        }

        // Recalculate commission
        const comissaoPercentual = calcularComissao(fatorVenda);
        const comissaoCalculada = preco * comissaoPercentual;

        // Update sale
        // Consider implications: Should updating a sale also update the client's last purchase info?
        // This might require complex logic if multiple sales exist.
        // For simplicity here, we only update the sale record.
        // Updating client's last purchase info upon sale *update* is omitted.
        const updatedVenda = await prisma.venda.update({
            where: { id: vendaId },
            data: {
                clienteId: clienteId,
                produtoId: produtoId,
                preco: preco,
                dataVenda: dataVenda, // Update date if provided
                fatorVenda: fatorVenda,
                condicaoPagamento: data.condicaoPagamento,
                comissaoCalculada: comissaoCalculada,
            },
        });

        // Optional: Add logic here if client's last purchase info needs recalculation based on the *latest* sale.

        return NextResponse.json(updatedVenda);
    } catch (error) {
        console.error('Erro ao atualizar venda:', error);
        return NextResponse.json({ error: 'Erro interno ao atualizar venda' }, { status: 500 });
    }
}


// DELETE /api/vendas - Delete a sale (by ID)
// Consider implications: Should deleting a sale update the client's last purchase info?
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID da venda é obrigatório para exclusão' }, { status: 400 });
    }

    try {
        const vendaId = parseInt(id, 10);

        // Check if sale exists
        const existingVenda = await prisma.venda.findUnique({ where: { id: vendaId } });
        if (!existingVenda) {
            return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
        }

        await prisma.venda.delete({ where: { id: vendaId } });

        // Optional: Add logic here to find the *new* last purchase for the client and update them.
        // This requires finding the most recent remaining sale for that client.

        return NextResponse.json({ message: 'Venda excluída com sucesso' }, { status: 200 });

    } catch (error) {
        console.error('Erro ao excluir venda:', error);
        return NextResponse.json({ error: 'Erro interno ao excluir venda' }, { status: 500 });
    }
}

