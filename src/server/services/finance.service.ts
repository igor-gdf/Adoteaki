import { prisma } from '@/server/db/client';
import { financeEntrySchema } from '@/lib/validators/schemas';

export interface FinancialSummaryDTO {
  ngoId: string;
  tradeName: string;
  cnpj: string;
  initialBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  currentBalance: number;
  verifiedScore: number;
  financialUpdatedAt: string;
  revenueByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  expenseByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlySeries: {
    month: string;
    revenue: number;
    expenses: number;
    net: number;
    veterinary: number;
    food: number;
    donations: number;
  }[];
  entries: {
    id: string;
    type: string;
    category: string;
    titlePt: string;
    titleEn: string;
    amount: number;
    month: string;
    entryDate: string;
    documentRef: string | null;
    notes: string | null;
  }[];
}

export class FinanceService {
  static async getNgoFinancialSummary(ngoIdOrSlug: string): Promise<FinancialSummaryDTO | null> {
    const ngo = await prisma.nGO.findFirst({
      where: {
        OR: [{ id: ngoIdOrSlug }, { slug: ngoIdOrSlug }],
      },
      include: {
        financialEntries: {
          orderBy: [{ month: 'desc' }, { entryDate: 'desc' }],
        },
      },
    });

    if (!ngo) return null;

    let totalRevenue = 0;
    let totalExpenses = 0;

    const revCatMap: Record<string, number> = {};
    const expCatMap: Record<string, number> = {};
    const monthMap: Record<
      string,
      {
        revenue: number;
        expenses: number;
        veterinary: number;
        food: number;
        donations: number;
      }
    > = {};

    for (const entry of ngo.financialEntries) {
      if (!monthMap[entry.month]) {
        monthMap[entry.month] = {
          revenue: 0,
          expenses: 0,
          veterinary: 0,
          food: 0,
          donations: 0,
        };
      }

      if (entry.type === 'REVENUE') {
        totalRevenue += entry.amount;
        revCatMap[entry.category] = (revCatMap[entry.category] || 0) + entry.amount;
        monthMap[entry.month].revenue += entry.amount;
        if (entry.category === 'DONATIONS') {
          monthMap[entry.month].donations += entry.amount;
        }
      } else {
        totalExpenses += entry.amount;
        expCatMap[entry.category] = (expCatMap[entry.category] || 0) + entry.amount;
        monthMap[entry.month].expenses += entry.amount;
        if (entry.category === 'VETERINARY') {
          monthMap[entry.month].veterinary += entry.amount;
        } else if (entry.category === 'FOOD') {
          monthMap[entry.month].food += entry.amount;
        }
      }
    }

    const revenueByCategory = Object.entries(revCatMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const expenseByCategory = Object.entries(expCatMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const monthlySeries = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
        net: Math.round((data.revenue - data.expenses) * 100) / 100,
        veterinary: Math.round(data.veterinary * 100) / 100,
        food: Math.round(data.food * 100) / 100,
        donations: Math.round(data.donations * 100) / 100,
      }));

    return {
      ngoId: ngo.id,
      tradeName: ngo.tradeName,
      cnpj: ngo.cnpj,
      initialBalance: ngo.initialBalance,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      currentBalance: Math.round((ngo.initialBalance + totalRevenue - totalExpenses) * 100) / 100,
      verifiedScore: ngo.verifiedScore,
      financialUpdatedAt: ngo.financialUpdatedAt.toISOString(),
      revenueByCategory,
      expenseByCategory,
      monthlySeries,
      entries: ngo.financialEntries.map((e) => ({
        id: e.id,
        type: e.type,
        category: e.category,
        titlePt: e.titlePt,
        titleEn: e.titleEn,
        amount: e.amount,
        month: e.month,
        entryDate: e.entryDate.toISOString(),
        documentRef: e.documentRef,
        notes: e.notes,
      })),
    };
  }

  static async createEntry(
    ngoId: string,
    actor: { id: string; name: string; role: string },
    data: {
      type: 'REVENUE' | 'EXPENSE';
      category: string;
      titlePt: string;
      titleEn?: string;
      amount: number;
      month: string;
      documentRef?: string;
      notes?: string;
    }
  ) {
    const parsed = financeEntrySchema.safeParse(data);
    if (!parsed.success) throw new Error('Dados do lançamento financeiro inválidos.');

    const entry = await prisma.financialEntry.create({
      data: {
        ngoId,
        type: parsed.data.type,
        category: parsed.data.category,
        titlePt: parsed.data.titlePt,
        titleEn: parsed.data.titleEn || parsed.data.titlePt,
        amount: parsed.data.amount,
        month: parsed.data.month,
        entryDate: new Date(),
        documentRef: parsed.data.documentRef || null,
        notes: parsed.data.notes || null,
      },
    });

    await prisma.nGO.update({
      where: { id: ngoId },
      data: { financialUpdatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'FINANCE_ENTRY_CREATED',
        targetType: 'FINANCE',
        targetId: ngoId,
        details: `${data.type} (${data.category}) - ${data.titlePt}: R$ ${Number(data.amount).toFixed(2)} [${data.month}]`,
      },
    });

    return entry;
  }

  static async updateEntry(
    entryId: string,
    ngoId: string,
    actor: { id: string; name: string; role: string },
    data: {
      type?: 'REVENUE' | 'EXPENSE';
      category?: string;
      titlePt?: string;
      titleEn?: string;
      amount?: number;
      month?: string;
      documentRef?: string;
      notes?: string;
    }
  ) {
    const existing = await prisma.financialEntry.findUnique({ where: { id: entryId } });
    if (!existing || existing.ngoId !== ngoId) {
      throw new Error('Lançamento contábil não encontrado ou sem permissão.');
    }

    const parsed = financeEntrySchema.safeParse({
      type: data.type ?? existing.type,
      category: data.category ?? existing.category,
      titlePt: data.titlePt ?? existing.titlePt,
      titleEn: data.titleEn ?? existing.titleEn,
      amount: data.amount ?? existing.amount,
      month: data.month ?? existing.month,
      documentRef: data.documentRef ?? existing.documentRef ?? undefined,
      notes: data.notes ?? existing.notes ?? undefined,
    });
    if (!parsed.success) throw new Error('Dados do lançamento financeiro inválidos.');

    const updated = await prisma.financialEntry.update({
      where: { id: entryId },
      data: {
        type: parsed.data.type,
        category: parsed.data.category,
        titlePt: parsed.data.titlePt,
        titleEn: parsed.data.titleEn || parsed.data.titlePt,
        amount: parsed.data.amount,
        month: parsed.data.month,
        documentRef: data.documentRef !== undefined ? data.documentRef : existing.documentRef,
        notes: data.notes !== undefined ? data.notes : existing.notes,
      },
    });

    await prisma.nGO.update({
      where: { id: ngoId },
      data: { financialUpdatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'FINANCE_ENTRY_UPDATED',
        targetType: 'FINANCE',
        targetId: ngoId,
        details: `Lançamento atualizado: ${updated.titlePt} (R$ ${updated.amount.toFixed(2)}) [${updated.month}]`,
      },
    });

    return updated;
  }

  static async deleteEntry(
    entryId: string,
    ngoId: string,
    actor: { id: string; name: string; role: string }
  ) {
    const existing = await prisma.financialEntry.findUnique({ where: { id: entryId } });
    if (!existing || existing.ngoId !== ngoId) {
      throw new Error('Lançamento contábil não encontrado ou sem permissão.');
    }

    await prisma.financialEntry.delete({ where: { id: entryId } });

    await prisma.nGO.update({
      where: { id: ngoId },
      data: { financialUpdatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'FINANCE_ENTRY_DELETED',
        targetType: 'FINANCE',
        targetId: ngoId,
        details: `Lançamento removido: ${existing.titlePt} (R$ ${existing.amount.toFixed(2)}) [${existing.month}]`,
      },
    });

    return { deleted: true };
  }

  static async updateInitialBalance(
    ngoId: string,
    initialBalance: number,
    actor: { id: string; name: string; role: string }
  ) {
    const updated = await prisma.nGO.update({
      where: { id: ngoId },
      data: {
        initialBalance: Number(initialBalance),
        financialUpdatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'FINANCE_BALANCE_UPDATED',
        targetType: 'FINANCE',
        targetId: ngoId,
        details: `Saldo inicial / reserva de caixa ajustado para R$ ${Number(initialBalance).toFixed(2)}`,
      },
    });

    return updated;
  }
}
