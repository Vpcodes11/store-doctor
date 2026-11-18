import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.fixOrder.findMany({
      include: {
        audit: {
          select: {
            id: true,
            url: true,
            storeName: true,
            score: true,
            grade: true,
            desktopShot: true,
            mobileShot: true,
          },
        },
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      inProgressOrders: orders.filter((o) => o.status === 'in_progress').length,
      completedOrders: orders.filter((o) => o.status === 'completed').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.amountPaid, 0),
    };

    return NextResponse.json({ orders, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch fix orders' }, { status: 500 });
  }
}
