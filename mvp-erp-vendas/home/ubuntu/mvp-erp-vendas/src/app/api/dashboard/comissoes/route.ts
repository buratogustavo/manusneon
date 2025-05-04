import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// GET /api/dashboard/comissoes - Fetch commission data
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ano = searchParams.get('ano') ? parseInt(searchParams.get('ano')!, 10) : new Date().getFullYear();
    const mes = searchParams.get('mes') ? parseInt(searchParams.get('mes')!, 10) : null; // Optional month filter
    const groupBy = searchParams.get('groupBy') || 'venda'; // 'venda' or 'mes'

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

        // Fetch sales within the period with necessary details for commission
        const vendas = await prisma.venda.findMany({
            where: {
                dataVenda: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                id: true,
                dataVenda: true,
                preco: true,
                fatorVenda: true,
                comissaoCalculada: true,
                cliente: { select: { id: true, nome: true } },
                produto: { select: { id: true, nome: true } },
            },
            orderBy: {
                dataVenda: 'desc',
            },
        });

        let resultado;
        let totalComissaoPeriodo = vendas.reduce((sum, venda) => sum + venda.comissaoCalculada, 0);

        if (groupBy === 'mes') {
            const comissoesPorMes: { [key: number]: { totalVendas: number, totalComissao: number, countVendas: number } } = {};
            for (let m = 1; m <= 12; m++) {
                comissoesPorMes[m] = { totalVendas: 0, totalComissao: 0, countVendas: 0 };
            }

            vendas.forEach(venda => {
                const vendaMes = venda.dataVenda.getMonth() + 1;
                if (venda.dataVenda.getFullYear() === ano) { // Ensure it's within the target year
                    comissoesPorMes[vendaMes].totalVendas += venda.preco;
                    comissoesPorMes[vendaMes].totalComissao += venda.comissaoCalculada;
                    comissoesPorMes[vendaMes].countVendas += 1;
                }
            });
            resultado = Object.entries(comissoesPorMes)
                .filter(([mes, data]) => data.countVendas > 0) // Show only months with sales
                .map(([mes, data]) => ({
                    mes: parseInt(mes),
                    ano: ano,
                    ...data,
                }));
        } else { // Default: groupBy 'venda'
            resultado = vendas.map(venda => ({
                idVenda: venda.id,
                dataVenda: venda.dataVenda,
                cliente: venda.cliente.nome,
                produto: venda.produto.nome,
                valorVenda: venda.preco,
                fatorVenda: venda.fatorVenda,
                comissao: venda.comissaoCalculada,
            }));
        }

        return NextResponse.json({
            periodo: { start: startDate.toISOString(), end: endDate.toISOString() },
            totalComissaoPeriodo,
            detalhes: resultado,
            groupBy: groupBy,
        });

    } catch (error) {
        console.error('Erro ao buscar dados do painel de comissões:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar dados do painel de comissões' }, { status: 500 });
    }
}

