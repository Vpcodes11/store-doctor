import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      auditId,
      productType,
      email,
      currency = 'USD',
      customerName,
      collaboratorCode,
      notes,
    } = body;

    if (!auditId || !productType || !email) {
      return NextResponse.json({ error: 'Missing required checkout fields' }, { status: 400 });
    }

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        findings: {
          orderBy: { priorityScore: 'desc' },
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // Determine price based on currency and plan
    let amount = 29.0;
    if (productType === 'full_report') {
      amount = currency === 'INR' ? 1999.0 : 29.0;
    } else if (productType === 'fix_pack') {
      amount = currency === 'INR' ? 9999.0 : 149.0;
    } else if (productType === 'monthly_reaudit') {
      amount = currency === 'INR' ? 1199.0 : 15.0;
    }

    // Create Order Record
    const order = await prisma.order.create({
      data: {
        auditId,
        email,
        productType,
        amount,
        currency,
        status: 'completed',
        paymentMethod: 'instant_secure_checkout',
        paymentId: `ORD-${Date.now().toString(36).toUpperCase()}`,
      },
    });

    // Mark audit as paid
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        paid: true,
        email: email,
      },
    });

    let fixOrderRecord = null;

    // If Fix Pack is purchased, create FixOrder and populate 10 FixTasks from top findings
    if (productType === 'fix_pack') {
      fixOrderRecord = await prisma.fixOrder.create({
        data: {
          auditId,
          customerEmail: email,
          customerName: customerName || 'Shopify Store Owner',
          storeUrl: audit.url,
          collaboratorCode: collaboratorCode || 'PENDING-CODE',
          packageType: 'fix_pack',
          amountPaid: amount,
          currency,
          status: 'pending',
          notes: notes || 'Standard 10-point CRO implementation pack',
        },
      });

      // Populate up to 10 tasks from the top findings
      const top10 = audit.findings.slice(0, 10);
      for (const finding of top10) {
        await prisma.fixTask.create({
          data: {
            fixOrderId: fixOrderRecord.id,
            findingId: finding.id,
            title: finding.title,
            category: finding.category,
            impact: finding.impact,
            ease: finding.ease,
            status: 'pending',
            assignedTo: 'Lead CRO Specialist',
            developerNotes: `Pending theme customization for: ${finding.title}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Checkout completed successfully! Access unlocked.',
      orderId: order.id,
      productType,
      paid: true,
      fixOrderId: fixOrderRecord?.id || null,
    });
  } catch (error: any) {
    console.error('Checkout processing error:', error);
    return NextResponse.json({ error: error?.message || 'Payment processing failed' }, { status: 500 });
  }
}
