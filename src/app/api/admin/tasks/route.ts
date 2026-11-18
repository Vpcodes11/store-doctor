import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      taskId,
      status,
      assignedTo,
      beforeScreenshot,
      afterScreenshot,
      developerNotes,
    } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const updated = await prisma.fixTask.update({
      where: { id: taskId },
      data: {
        ...(status && {
          status,
          completedAt: status === 'completed' ? new Date() : null,
        }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(beforeScreenshot !== undefined && { beforeScreenshot }),
        ...(afterScreenshot !== undefined && { afterScreenshot }),
        ...(developerNotes !== undefined && { developerNotes }),
      },
    });

    // Check if all tasks in the order are completed
    const orderTasks = await prisma.fixTask.findMany({
      where: { fixOrderId: updated.fixOrderId },
    });

    const allDone = orderTasks.every((t) => t.status === 'completed');
    const anyInProgress = orderTasks.some((t) => t.status === 'in_progress' || t.status === 'completed');

    let newOrderStatus = 'pending';
    if (allDone) {
      newOrderStatus = 'completed';
    } else if (anyInProgress) {
      newOrderStatus = 'in_progress';
    }

    await prisma.fixOrder.update({
      where: { id: updated.fixOrderId },
      data: { status: newOrderStatus },
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update task' }, { status: 500 });
  }
}
