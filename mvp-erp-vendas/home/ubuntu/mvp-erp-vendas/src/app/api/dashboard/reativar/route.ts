import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

// GET /api/dashboard/reativar - List clients needing reactivation
export async function GET(request: Request) {
    try {
        const thirtyDaysAgo = subDays(new Date(), 30);

        // Find clients whose last interaction AND last purchase (if any) were more than 30 days ago
        // Or clients who have never interacted AND never purchased
        // Or clients who have interacted but never purchased, and last interaction > 30 days
        // Or clients who have purchased but never interacted, and last purchase > 30 days
        const clientesParaReativar = await prisma.cliente.findMany({
            where: {
                OR: [
                    // No interaction and no purchase ever
                    {
                        ultimaInteracao: null,
                        dataUltimaCompra: null,
                    },
                    // Last interaction > 30 days ago AND no purchase ever
                    {
                        ultimaInteracao: {
                            lt: thirtyDaysAgo,
                        },
                        dataUltimaCompra: null,
                    },
                    // No interaction ever AND last purchase > 30 days ago
                    {
                        ultimaInteracao: null,
                        dataUltimaCompra: {
                            lt: thirtyDaysAgo,
                        },
                    },
                    // Both interaction and purchase exist, both > 30 days ago
                    {
                        ultimaInteracao: {
                            lt: thirtyDaysAgo,
                        },
                        dataUltimaCompra: {
                            lt: thirtyDaysAgo,
                        },
                    },
                ],
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                ultimaInteracao: true,
                dataUltimaCompra: true,
            },
            orderBy: [
                {
                    ultimaInteracao: 'asc', // Prioritize those with oldest interaction
                },
                {
                    dataUltimaCompra: 'asc', // Then by oldest purchase
                },
                 {
                    nome: 'asc',
                },
            ],
        });

        return NextResponse.json(clientesParaReativar);

    } catch (error) {
        console.error('Erro ao buscar clientes para reativar:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar clientes para reativar' }, { status: 500 });
    }
}

