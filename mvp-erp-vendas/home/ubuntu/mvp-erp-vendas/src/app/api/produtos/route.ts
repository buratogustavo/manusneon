import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/produtos - List all products or find by ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const codigo = searchParams.get('codigo');

  try {
    if (id) {
      const produto = await prisma.produto.findUnique({
        where: { id: parseInt(id, 10) },
      });
      if (!produto) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
      }
      return NextResponse.json(produto);
    } else if (codigo) {
      const produto = await prisma.produto.findUnique({
        where: { codigo: codigo },
      });
      if (!produto) {
        return NextResponse.json({ error: 'Produto não encontrado com este código' }, { status: 404 });
      }
      return NextResponse.json(produto);
    } else {
      const produtos = await prisma.produto.findMany({
        orderBy: {
          nome: 'asc',
        },
      });
      return NextResponse.json(produtos);
    }
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar produtos' }, { status: 500 });
  }
}

// POST /api/produtos - Create a new product
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Basic validation
    if (!data.nome || !data.codigo || !data.preco) {
      return NextResponse.json({ error: 'Nome, código e preço são obrigatórios' }, { status: 400 });
    }

    const novoProduto = await prisma.produto.create({
      data: {
        nome: data.nome,
        codigo: data.codigo,
        preco: parseFloat(data.preco),
      },
    });
    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar produto:', error);
    if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json({ error: 'Já existe um produto com este código.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno ao criar produto' }, { status: 500 });
  }
}

// PUT /api/produtos - Update an existing product (by ID)
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID do produto é obrigatório para atualização' }, { status: 400 });
  }

  try {
    const data = await request.json();
    const produtoId = parseInt(id, 10);

    // Check if product exists
    const existingProduto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!existingProduto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const updatedProduto = await prisma.produto.update({
      where: { id: produtoId },
      data: {
        nome: data.nome,
        codigo: data.codigo,
        preco: parseFloat(data.preco),
      },
    });
    return NextResponse.json(updatedProduto);
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error);
    if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json({ error: 'Já existe um produto com este código.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar produto' }, { status: 500 });
  }
}

// DELETE /api/produtos - Delete a product (by ID)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID do produto é obrigatório para exclusão' }, { status: 400 });
  }

  try {
    const produtoId = parseInt(id, 10);

    // Check if product exists
    const existingProduto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!existingProduto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Check if there are sales associated with this product
    const vendasCount = await prisma.venda.count({ where: { produtoId: produtoId } });
    if (vendasCount > 0) {
      return NextResponse.json({ error: 'Não é possível excluir produto com vendas registradas.' }, { status: 400 });
    }

    await prisma.produto.delete({ where: { id: produtoId } });

    return NextResponse.json({ message: 'Produto excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir produto' }, { status: 500 });
  }
}
