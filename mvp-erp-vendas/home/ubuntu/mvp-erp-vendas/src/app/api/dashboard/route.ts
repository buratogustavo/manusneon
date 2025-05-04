import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/dashboard - Fetch aggregated data for the main dashboard
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ano = searchParams.get('ano') ? parseInt(searchParams.get('ano')!, 10) : new Date().getFullYear();
    const mes = searchParams.get('mes') ? parseInt(searchParams.get('mes')!, 10) : null; // Optional month filter

    try {
        // --- Date Range Calculation ---
        let startDate: Date;
        let endDate: Date;

        if (mes) {
            // Filter by specific month and year
            startDate = new Date(ano, mes - 1, 1);
            endDate = new Date(ano, mes, 0, 23, 59, 59, 999); // Last day of the month
        } else {
            // Filter by entire year
            startDate = new Date(ano, 0, 1);
            endDate = new Date(ano, 11, 31, 23, 59, 59, 999); // Last day of the year
        }

        // --- Faturamento Total & Evolução Mensal ---
        const vendasNoPeriodo = await prisma.venda.findMany({
            where: {
                dataVenda: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                preco: true,
                dataVenda: true,
            },
        });

        const faturamentoTotal = vendasNoPeriodo.reduce((sum, venda) => sum + venda.preco, 0);

        const faturamentoMensal: { [key: number]: number } = {};
        for (let m = 1; m <= 12; m++) {
            faturamentoMensal[m] = 0;
        }
        vendasNoPeriodo.forEach(venda => {
            const vendaMes = venda.dataVenda.getMonth() + 1;
            if (venda.dataVenda.getFullYear() === ano) { // Ensure it's within the target year for monthly breakdown
                 faturamentoMensal[vendaMes] += venda.preco;
            }
        });
        const evolucaoMensal = Object.entries(faturamentoMensal).map(([mes, valor]) => ({ mes: parseInt(mes), valor }));


        // --- Produtos Mais Vendidos ---
        const produtosVendidos = await prisma.venda.groupBy({
            by: ['produtoId'],
            where: {
                dataVenda: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                preco: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _sum: {
                    preco: 'desc',
                },
            },
            take: 5, // Top 5 products
        });

        const produtoIds = produtosVendidos.map(p => p.produtoId);
        const produtosInfo = await prisma.produto.findMany({
            where: { id: { in: produtoIds } },
            select: { id: true, nome: true, codigo: true },
        });
        const produtosInfoMap = new Map(produtosInfo.map(p => [p.id, p]));

        const produtosMaisVendidos = produtosVendidos.map(p => ({
            produto: produtosInfoMap.get(p.produtoId),
            totalVendido: p._sum.preco,
            quantidade: p._count.id,
        }));

        // --- Desempenho por Setor e Região ---
        const vendasComCliente = await prisma.venda.findMany({
             where: {
                dataVenda: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                cliente: {
                    select: { setor: true, regiao: true }
                }
            }
        });

        const desempenhoPorSetor = vendasComCliente.reduce((acc, venda) => {
            const setor = venda.cliente.setor || 'Não informado';
            acc[setor] = (acc[setor] || 0) + venda.preco;
            return acc;
        }, {} as Record<string, number>);

        const desempenhoPorRegiao = vendasComCliente.reduce((acc, venda) => {
            const regiao = venda.cliente.regiao || 'Não informada';
            acc[regiao] = (acc[regiao] || 0) + venda.preco;
            return acc;
        }, {} as Record<string, number>);


        // --- Metas vs. Atingido ---
        // Assuming only one seller for now, vendedorId='vendedor_unico'
        const vendedorId = 'vendedor_unico'; // Hardcoded as per MVP scope
        const metas = await prisma.meta.findMany({
            where: {
                vendedorId: vendedorId,
                ano: ano,
                ...(mes && { mes: mes }), // Add month filter if provided
            },
        });

        // Calculate achieved values (total sales and average factor for the seller in the period)
        const vendasVendedor = await prisma.venda.findMany({
             where: {
                // Assuming no specific seller field on Venda, aggregate all sales for the single seller
                dataVenda: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { preco: true, fatorVenda: true, dataVenda: true }
        });

        const atingidoPorMes: { [key: number]: { valor: number, fatorMedio: number } } = {};
         for (let m = 1; m <= 12; m++) {
            atingidoPorMes[m] = { valor: 0, fatorMedio: 0 };
        }

        let totalFatorVendas = 0;
        vendasVendedor.forEach(venda => {
            const vendaMes = venda.dataVenda.getMonth() + 1;
             if (venda.dataVenda.getFullYear() === ano) {
                atingidoPorMes[vendaMes].valor += venda.preco;
                totalFatorVendas += venda.fatorVenda; // Sum factors for average calculation later
            }
        });

        // Calculate average factor per month
        Object.keys(atingidoPorMes).forEach(mKey => {
            const monthNum = parseInt(mKey);
            const vendasNoMes = vendasVendedor.filter(v => v.dataVenda.getMonth() + 1 === monthNum && v.dataVenda.getFullYear() === ano);
            if (vendasNoMes.length > 0) {
                const somaFatores = vendasNoMes.reduce((sum, v) => sum + v.fatorVenda, 0);
                atingidoPorMes[monthNum].fatorMedio = somaFatores / vendasNoMes.length;
            }
        });

        const metasVsAtingido = metas.map(meta => {
            const atingido = atingidoPorMes[meta.mes];
            return {
                mes: meta.mes,
                ano: meta.ano,
                metaValor: meta.valorVenda,
                metaFator: meta.fatorMedioDesejado,
                atingidoValor: atingido?.valor || 0,
                atingidoFator: atingido?.fatorMedio || 0,
            };
        });

        // --- Clientes para Reativar --- (Moved to its own endpoint /api/dashboard/reativar as per checklist 2.8)

        // --- Funil de Vendas --- (Skipped - requires stages not defined in schema)

        return NextResponse.json({
            faturamentoTotal,
            evolucaoMensal,
            produtosMaisVendidos,
            desempenhoPorSetor: Object.entries(desempenhoPorSetor).map(([key, value]) => ({ name: key, value })),
            desempenhoPorRegiao: Object.entries(desempenhoPorRegiao).map(([key, value]) => ({ name: key, value })),
            metasVsAtingido,
            // Add other dashboard data points as needed
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar dados do dashboard' }, { status: 500 });
    }
}

