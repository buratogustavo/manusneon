import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// GET /api/dashboard/interacoes - Fetch interaction summary and frequency
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'mes_atual'; // e.g., 'mes_atual', 'ano_atual', 'ultimos_30_dias'

    try {
        let startDate: Date;
        let endDate: Date = new Date(); // Default end date is now

        switch (periodo) {
            case 'ano_atual':
                startDate = startOfYear(endDate);
                endDate = endOfYear(endDate); // Ensure we cover the whole year if specified
                break;
            case 'ultimos_30_dias':
                startDate = subDays(endDate, 30);
                break;
            case 'mes_atual':
            default:
                startDate = startOfMonth(endDate);
                endDate = endOfMonth(endDate); // Ensure we cover the whole month
                break;
        }

        // Fetch interactions within the calculated period
        const interacoes = await prisma.interacao.findMany({
            where: {
                data: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                id: true,
                data: true,
                clienteId: true,
            },
            orderBy: {
                data: 'asc',
            },
        });

        const totalInteracoes = interacoes.length;

        // Calculate frequency (e.g., interactions per day/week/month depending on period)
        // For simplicity, let's calculate daily frequency for the last 30 days if that period is selected
        let frequenciaDiaria: { [key: string]: number } = {};
        if (periodo === 'ultimos_30_dias') {
            interacoes.forEach(interacao => {
                const dia = interacao.data.toISOString().split('T')[0]; // Get YYYY-MM-DD
                frequenciaDiaria[dia] = (frequenciaDiaria[dia] || 0) + 1;
            });
        }
        // Could add more complex frequency calculations for other periods (e.g., weekly, monthly)

        // Count interactions per client
        const interacoesPorCliente = interacoes.reduce((acc, interacao) => {
            acc[interacao.clienteId] = (acc[interacao.clienteId] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        // Fetch client names for better display
        const clienteIds = Object.keys(interacoesPorCliente).map(id => parseInt(id));
        const clientesInfo = await prisma.cliente.findMany({
            where: { id: { in: clienteIds } },
            select: { id: true, nome: true },
        });
        const clientesInfoMap = new Map(clientesInfo.map(c => [c.id, c.nome]));

        const resumoPorCliente = Object.entries(interacoesPorCliente).map(([clienteId, count]) => ({
            clienteId: parseInt(clienteId),
            nomeCliente: clientesInfoMap.get(parseInt(clienteId)) || 'Cliente Desconhecido',
            count: count,
        })).sort((a, b) => b.count - a.count); // Sort by most interactions


        return NextResponse.json({
            periodo: { start: startDate.toISOString(), end: endDate.toISOString() },
            totalInteracoes,
            resumoPorCliente,
            frequenciaDiaria: periodo === 'ultimos_30_dias' ? Object.entries(frequenciaDiaria).map(([dia, count]) => ({ dia, count })) : [], // Only return daily for last 30 days for now
        });

    } catch (error) {
        console.error('Erro ao buscar dados do painel de interações:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar dados do painel de interações' }, { status: 500 });
    }
}

