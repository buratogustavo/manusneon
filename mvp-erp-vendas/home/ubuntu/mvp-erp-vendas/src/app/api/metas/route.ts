import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/metas - List all goals or find by ID or filter by year/month/seller
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const vendedorId = searchParams.get('vendedorId');
  const ano = searchParams.get('ano');
  const mes = searchParams.get('mes');

  try {
    let whereClause: any = {};
    if (id) {
      whereClause = { id: parseInt(id, 10) };
    } else {
      if (vendedorId) whereClause.vendedorId = vendedorId;
      if (ano) whereClause.ano = parseInt(ano, 10);
      if (mes) whereClause.mes = parseInt(mes, 10);
    }

    const metas = await prisma.meta.findMany({
      where: whereClause,
      orderBy: [
        { ano: 'desc' },
        { mes: 'desc' },
        { vendedorId: 'asc' },
      ],
    });

    if (id && metas.length === 0) {
        return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 });
    }

    return NextResponse.json(id ? metas[0] : metas);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar metas' }, { status: 500 });
  }
}

// POST /api/metas - Create a new goal
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Basic validation
    if (!data.vendedorId || !data.valorVenda || !data.fatorMedioDesejado || !data.mes || !data.ano) {
      return NextResponse.json({ error: 'Vendedor, Valor da Venda, Fator Médio, Mês e Ano são obrigatórios' }, { status: 400 });
    }

    const novaMeta = await prisma.meta.create({
      data: {
        vendedorId: data.vendedorId,
        valorVenda: parseFloat(data.valorVenda),
        fatorMedioDesejado: parseFloat(data.fatorMedioDesejado),
        mes: parseInt(data.mes, 10),
        ano: parseInt(data.ano, 10),
      },
    });
    return NextResponse.json(novaMeta, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar meta:', error);
    if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json({ error: 'Já existe uma meta para este vendedor neste mês/ano.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno ao criar meta' }, { status: 500 });
  }
}

// PUT /api/metas - Update an existing goal (by ID)
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID da meta é obrigatório para atualização' }, { status: 400 });
  }

  try {
    const data = await request.json();
    const metaId = parseInt(id, 10);

     // Basic validation
    if (!data.vendedorId || !data.valorVenda || !data.fatorMedioDesejado || !data.mes || !data.ano) {
      return NextResponse.json({ error: 'Vendedor, Valor da Venda, Fator Médio, Mês e Ano são obrigatórios' }, { status: 400 });
    }

    // Check if goal exists
    const existingMeta = await prisma.meta.findUnique({ where: { id: metaId } });
    if (!existingMeta) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 });
    }

    const updatedMeta = await prisma.meta.update({
      where: { id: metaId },
      data: {
        vendedorId: data.vendedorId,
        valorVenda: parseFloat(data.valorVenda),
        fatorMedioDesejado: parseFloat(data.fatorMedioDesejado),
        mes: parseInt(data.mes, 10),
        ano: parseInt(data.ano, 10),
      },
    });
    return NextResponse.json(updatedMeta);
  } catch (error: any) {
    console.error('Erro ao atualizar meta:', error);
     if (error.code === 'P2002') { // Unique constraint violation
      // Need to check which fields caused the violation if the unique constraint involves multiple fields
      return NextResponse.json({ error: 'Já existe uma meta para este vendedor neste mês/ano.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar meta' }, { status: 500 });
  }
}

// DELETE /api/metas - Delete a goal (by ID)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID da meta é obrigatório para exclusão' }, { status: 400 });
  }

  try {
    const metaId = parseInt(id, 10);

    // Check if goal exists
    const existingMeta = await prisma.meta.findUnique({ where: { id: metaId } });
    if (!existingMeta) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 });
    }

    await prisma.meta.delete({ where: { id: metaId } });

    return NextResponse.json({ message: 'Meta excluída com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir meta' }, { status: 500 });
  }
}
