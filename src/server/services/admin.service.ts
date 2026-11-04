import { prisma } from '@/server/db/client';
import { ngoStatusSchema, userRoleSchema, userStatusSchema } from '@/lib/validators/schemas';

export class AdminService {
  static async getGovernanceOverview() {
    const [ngos, users, auditLogs, inquiryCount, animalCount] = await Promise.all([
      prisma.nGO.findMany({
        include: {
          animals: { select: { id: true, status: true } },
          financialEntries: { select: { type: true, amount: true, documentRef: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        include: {
          ngo: { select: { id: true, tradeName: true, cnpj: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.adoptionInquiry.count(),
      prisma.animal.count(),
    ]);

    const ngoReports = ngos.map((ngo) => {
      const totalRevenue = ngo.financialEntries
        .filter((e) => e.type === 'REVENUE')
        .reduce((acc, e) => acc + e.amount, 0);
      const totalExpenses = ngo.financialEntries
        .filter((e) => e.type === 'EXPENSE')
        .reduce((acc, e) => acc + e.amount, 0);
      const documentedEntries = ngo.financialEntries.filter(
        (e) => e.documentRef && e.documentRef.trim().length > 0
      ).length;
      const documentationRate =
        ngo.financialEntries.length > 0
          ? Math.round((documentedEntries / ngo.financialEntries.length) * 100)
          : 100;

      return {
        id: ngo.id,
        slug: ngo.slug,
        legalName: ngo.legalName,
        tradeName: ngo.tradeName,
        cnpj: ngo.cnpj,
        city: ngo.city,
        state: ngo.state,
        status: ngo.status,
        verifiedScore: ngo.verifiedScore,
        initialBalance: ngo.initialBalance,
        totalRevenue,
        totalExpenses,
        currentBalance: ngo.initialBalance + totalRevenue - totalExpenses,
        entriesCount: ngo.financialEntries.length,
        documentationRate,
        animalsCount: ngo.animals.length,
        totalAdoptions: ngo.totalAdoptions,
        financialUpdatedAt: ngo.financialUpdatedAt.toISOString(),
        createdAt: ngo.createdAt.toISOString(),
      };
    });

    return {
      stats: {
        totalNgos: ngos.length,
        approvedNgos: ngos.filter((n) => n.status === 'APPROVED').length,
        pendingNgos: ngos.filter((n) => n.status === 'PENDING').length,
        suspendedNgos: ngos.filter((n) => n.status === 'SUSPENDED').length,
        totalUsers: users.length,
        totalAnimals: animalCount,
        totalInquiries: inquiryCount,
      },
      ngoReports,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        city: u.city,
        state: u.state,
        ngoName: u.ngo?.tradeName || null,
        createdAt: u.createdAt.toISOString(),
      })),
      auditLogs: auditLogs.map((l) => ({
        id: l.id,
        actorName: l.actorName,
        actorRole: l.actorRole,
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        details: l.details,
        createdAt: l.createdAt.toISOString(),
      })),
    };
  }

  static async updateNgoStatus(
    ngoId: string,
    status: string,
    verifiedScore: number | undefined,
    actor: { id: string; name: string; role: string }
  ) {
    if (!ngoStatusSchema.safeParse(status).success) {
      throw new Error('Status de ONG inválido.');
    }
    if (
      verifiedScore !== undefined &&
      (!Number.isInteger(verifiedScore) || verifiedScore < 0 || verifiedScore > 100)
    ) {
      throw new Error('Score de verificação inválido.');
    }

    const ngo = await prisma.nGO.update({
      where: { id: ngoId },
      data: {
        status,
        ...(verifiedScore !== undefined ? { verifiedScore: Number(verifiedScore) } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: `NGO_${status}`,
        targetType: 'NGO',
        targetId: ngo.id,
        details: `Status da ONG ${ngo.tradeName} (${ngo.cnpj}) alterado para ${status} (Score: ${ngo.verifiedScore}/100).`,
      },
    });

    return ngo;
  }

  static async updateUserStatusOrRole(
    userId: string,
    data: { status?: string; role?: string },
    actor: { id: string; name: string; role: string }
  ) {
    if (data.status && !userStatusSchema.safeParse(data.status).success) {
      throw new Error('Status de usuário inválido.');
    }
    if (data.role && !userRoleSchema.safeParse(data.role).success) {
      throw new Error('Perfil de usuário inválido.');
    }
    if (userId === actor.id && (data.status === 'SUSPENDED' || (data.role && data.role !== 'ADMIN'))) {
      throw new Error('Um administrador não pode remover o próprio acesso administrativo.');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.role ? { role: data.role } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'USER_UPDATED',
        targetType: 'USER',
        targetId: user.id,
        details: `Usuário ${user.name} (${user.email}) atualizado: Perfil=${user.role}, Status=${user.status}.`,
      },
    });

    return user;
  }
}
