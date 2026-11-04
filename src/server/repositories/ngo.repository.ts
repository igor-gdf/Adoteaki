import { prisma } from '@/server/db/client';

export interface NgoFilterParams {
  search?: string;
  state?: string;
  city?: string;
  size?: string;
  causeTag?: string;
  includeAllStatuses?: boolean;
}

export class NgoRepository {
  static async findAll(filters: NgoFilterParams = {}) {
    const where: Record<string, unknown> = {};

    if (!filters.includeAllStatuses) {
      where.status = 'APPROVED';
    }

    if (filters.state && filters.state !== 'ALL') {
      where.state = filters.state;
    }

    if (filters.size && filters.size !== 'ALL') {
      where.size = filters.size;
    }

    const ngos = await prisma.nGO.findMany({
      where,
      include: {
        animals: {
          select: {
            id: true,
            status: true,
            species: true,
          },
        },
        financialEntries: {
          select: {
            type: true,
            amount: true,
            month: true,
            category: true,
          },
        },
      },
      orderBy: [{ verifiedScore: 'desc' }, { createdAt: 'desc' }],
    });

    return ngos.filter((ngo) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName =
          ngo.tradeName.toLowerCase().includes(q) ||
          ngo.legalName.toLowerCase().includes(q) ||
          ngo.city.toLowerCase().includes(q) ||
          ngo.cnpj.includes(q);
        if (!matchName) return false;
      }
      if (filters.city) {
        const c = filters.city.toLowerCase();
        if (!ngo.city.toLowerCase().includes(c)) return false;
      }
      if (filters.causeTag && filters.causeTag !== 'ALL') {
        const tags = ngo.causeTags.split(',').map((t) => t.trim().toUpperCase());
        if (!tags.includes(filters.causeTag.toUpperCase())) return false;
      }
      return true;
    });
  }

  static async findByIdOrSlug(identifier: string) {
    return prisma.nGO.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        animals: {
          orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        },
        financialEntries: {
          orderBy: [{ month: 'desc' }, { entryDate: 'desc' }],
        },
      },
    });
  }

  static async findByUserId(userId: string) {
    return prisma.nGO.findUnique({
      where: { userId },
      include: {
        animals: {
          orderBy: { createdAt: 'desc' },
        },
        financialEntries: {
          orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
        },
        inquiries: {
          include: {
            animal: {
              select: { id: true, name: true, species: true, photoUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
