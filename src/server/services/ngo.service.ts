import { prisma } from '@/server/db/client';
import { NgoRepository, NgoFilterParams } from '@/server/repositories/ngo.repository';
import { formatCnpj, isValidCnpj } from '@/lib/validators/cnpj';
import { hashPassword } from '@/server/auth/session';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export class NgoService {
  static async getLandingPageData() {
    const ngos = await prisma.nGO.findMany({
      where: { status: 'APPROVED' },
      include: {
        animals: {
          where: { status: 'AVAILABLE' },
        },
        financialEntries: true,
      },
    });

    const featuredAnimals = await prisma.animal.findMany({
      where: {
        status: 'AVAILABLE',
        ngo: { status: 'APPROVED' },
      },
      include: {
        ngo: {
          select: {
            id: true,
            slug: true,
            tradeName: true,
            city: true,
            state: true,
            verifiedScore: true,
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 6,
    });

    const totalAdoptions = ngos.reduce((acc, n) => acc + n.totalAdoptions, 0);
    const activeNgos = ngos.length;
    const avgTransparencyScore =
      activeNgos > 0
        ? Math.round((ngos.reduce((acc, n) => acc + n.verifiedScore, 0) / activeNgos) * 10) / 10
        : 96.0;

    const totalAuditedVolume = ngos.reduce((acc, n) => {
      return acc + n.financialEntries.reduce((sum, e) => sum + e.amount, 0);
    }, 0);

    return {
      metrics: {
        totalAdoptions,
        activeNgos,
        avgTransparencyScore,
        availableAnimalsCount: await prisma.animal.count({
          where: { status: 'AVAILABLE', ngo: { status: 'APPROVED' } },
        }),
        totalAuditedVolume,
      },
      featuredAnimals,
      topNgos: ngos.slice(0, 3).map((n) => ({
        id: n.id,
        slug: n.slug,
        tradeName: n.tradeName,
        legalName: n.legalName,
        cnpj: n.cnpj,
        city: n.city,
        state: n.state,
        size: n.size,
        causeTags: n.causeTags,
        verifiedScore: n.verifiedScore,
        availableAnimals: n.animals.length,
        totalAdoptions: n.totalAdoptions,
        descriptionPt: n.descriptionPt,
        descriptionEn: n.descriptionEn,
      })),
    };
  }

  static async listNgos(filters: NgoFilterParams) {
    const ngos = await NgoRepository.findAll(filters);
    return ngos.map((ngo) => {
      const totalRevenue = ngo.financialEntries
        .filter((e) => e.type === 'REVENUE')
        .reduce((s, e) => s + e.amount, 0);
      const totalExpenses = ngo.financialEntries
        .filter((e) => e.type === 'EXPENSE')
        .reduce((s, e) => s + e.amount, 0);

      return {
        id: ngo.id,
        slug: ngo.slug,
        legalName: ngo.legalName,
        tradeName: ngo.tradeName,
        cnpj: ngo.cnpj,
        foundationYear: ngo.foundationYear,
        state: ngo.state,
        city: ngo.city,
        address: ngo.address,
        size: ngo.size,
        causeTags: ngo.causeTags,
        descriptionPt: ngo.descriptionPt,
        descriptionEn: ngo.descriptionEn,
        missionPt: ngo.missionPt,
        missionEn: ngo.missionEn,
        status: ngo.status,
        verifiedScore: ngo.verifiedScore,
        totalAdoptions: ngo.totalAdoptions,
        availableAnimalsCount: ngo.animals.filter((a) => a.status === 'AVAILABLE').length,
        totalRevenue,
        totalExpenses,
        currentBalance: ngo.initialBalance + totalRevenue - totalExpenses,
        financialUpdatedAt: ngo.financialUpdatedAt.toISOString(),
      };
    });
  }

  static async getNgoDetail(idOrSlug: string) {
    return NgoRepository.findByIdOrSlug(idOrSlug);
  }

  static async registerNgo(input: {
    legalName: string;
    tradeName: string;
    cnpj: string;
    foundationYear?: number;
    state: string;
    city: string;
    address: string;
    size: string;
    causeTags: string;
    descriptionPt: string;
    descriptionEn?: string;
    missionPt: string;
    missionEn?: string;
    email: string;
    phone: string;
    website?: string;
    instagram?: string;
    pixKey?: string;
    bankInfo?: string;
    password?: string;
    responsibleName?: string;
    // Initial financial setup
    initialBalance?: number;
    monthlyDonations?: number;
    monthlyGrants?: number;
    monthlyVeterinary?: number;
    monthlyFood?: number;
    monthlyFacility?: number;
    monthlyAdmin?: number;
  }) {
    if (!input.password || input.password.length < 8 || input.password.length > 128) {
      throw new Error('A senha do gestor deve ter entre 8 e 128 caracteres.');
    }

    if (!isValidCnpj(input.cnpj)) {
      throw new Error('CNPJ inválido. Verifique os dígitos verificadores (padrão Receita Federal).');
    }

    const formattedCnpj = formatCnpj(input.cnpj);

    const existingNgo = await prisma.nGO.findUnique({
      where: { cnpj: formattedCnpj },
    });
    if (existingNgo) {
      throw new Error('Já existe uma ONG cadastrada com este CNPJ na plataforma.');
    }

    const baseSlug = slugify(input.tradeName || input.legalName);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const existingSlug = await prisma.nGO.findUnique({ where: { slug: baseSlug } });
    const slug = existingSlug ? `${baseSlug}-${randomSuffix}` : baseSlug;

    // Create or link User account for NGO management
    let user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.responsibleName || input.tradeName,
          passwordHash: hashPassword(input.password || 'ong123'),
          role: 'NGO',
          status: 'ACTIVE',
          phone: input.phone,
          city: input.city,
          state: input.state.toUpperCase(),
        },
      });
    } else if (user.role !== 'NGO') {
      throw new Error('Este e-mail já está vinculado a um perfil incompatível.');
    }

    // State coordinates fallback for interactive map
    const stateCoords: Record<string, [number, number]> = {
      SP: [-23.5505, -46.6333],
      RJ: [-22.9068, -43.1729],
      MG: [-19.9167, -43.9345],
      PR: [-25.4284, -49.2733],
      RS: [-30.0346, -51.2177],
      SC: [-27.5954, -48.548],
      BA: [-12.9714, -38.5014],
      PE: [-8.0476, -34.877],
      CE: [-3.7172, -38.5433],
      DF: [-15.7975, -47.8919],
      GO: [-16.6869, -49.2648],
      PA: [-1.4558, -48.4902],
      AM: [-3.119, -60.0217],
    };
    const [latitude, longitude] = stateCoords[input.state.toUpperCase()] || [-23.5505, -46.6333];

    const currentMonth = new Date().toISOString().slice(0, 7);

    const ngo = await prisma.nGO.create({
      data: {
        slug,
        userId: user.id,
        legalName: input.legalName.trim(),
        tradeName: input.tradeName.trim(),
        cnpj: formattedCnpj,
        foundationYear: Number(input.foundationYear) || 2022,
        state: input.state.toUpperCase(),
        city: input.city.trim(),
        address: input.address.trim(),
        latitude,
        longitude,
        size: input.size || 'MEDIUM',
        causeTags: input.causeTags || 'CAES,GATOS,CASTRACAO',
        descriptionPt: input.descriptionPt.trim(),
        descriptionEn: (input.descriptionEn || input.descriptionPt).trim(),
        missionPt: (input.missionPt || input.descriptionPt).trim(),
        missionEn: (input.missionEn || input.missionPt || input.descriptionPt).trim(),
        email: input.email.toLowerCase().trim(),
        phone: input.phone.trim(),
        website: input.website || null,
        instagram: input.instagram || null,
        pixKey: input.pixKey || formattedCnpj,
        bankInfo: input.bankInfo || null,
        status: 'PENDING',
        verifiedScore: 91,
        initialBalance: Number(input.initialBalance) || 0,
        financialUpdatedAt: new Date(),
      },
    });

    // Populate initial financial entries if provided
    const initialEntries: {
      ngoId: string;
      type: string;
      category: string;
      titlePt: string;
      titleEn: string;
      amount: number;
      month: string;
      documentRef: string;
      notes: string;
    }[] = [];

    const donations = Number(input.monthlyDonations) || 0;
    const grants = Number(input.monthlyGrants) || 0;
    const vet = Number(input.monthlyVeterinary) || 0;
    const food = Number(input.monthlyFood) || 0;
    const facility = Number(input.monthlyFacility) || 0;
    const admin = Number(input.monthlyAdmin) || 0;

    if (donations > 0) {
      initialEntries.push({
        ngoId: ngo.id,
        type: 'REVENUE',
        category: 'DONATIONS',
        titlePt: 'Doações Diretas & PIX (Abertura de Balanço)',
        titleEn: 'Direct & PIX Donations (Initial Balance Setup)',
        amount: donations,
        month: currentMonth,
        documentRef: `INI-REC-01`,
        notes: 'Receita mensal declarada no credenciamento inicial da organização.',
      });
    }
    if (grants > 0) {
      initialEntries.push({
        ngoId: ngo.id,
        type: 'REVENUE',
        category: 'GRANTS',
        titlePt: 'Parcerias, Editais & Eventos (Abertura de Balanço)',
        titleEn: 'Partnerships, Grants & Events (Initial Setup)',
        amount: grants,
        month: currentMonth,
        documentRef: `INI-REC-02`,
        notes: 'Apoio institucional declarado no credenciamento.',
      });
    }
    if (vet > 0) {
      initialEntries.push({
        ngoId: ngo.id,
        type: 'EXPENSE',
        category: 'VETERINARY',
        titlePt: 'Custos Veterinários, Vacinas e Cirurgias',
        titleEn: 'Veterinary Care, Vaccines & Surgeries',
        amount: vet,
        month: currentMonth,
        documentRef: `INI-DESP-01`,
        notes: 'Orçamento operacional destinado à clínica veterinária.',
      });
    }
    if (food > 0) {
      initialEntries.push({
        ngoId: ngo.id,
        type: 'EXPENSE',
        category: 'FOOD',
        titlePt: 'Alimentação, Ração e Suplementos',
        titleEn: 'Animal Food, Kibble & Supplements',
        amount: food,
        month: currentMonth,
        documentRef: `INI-DESP-02`,
        notes: 'Orçamento operacional destinado à nutrição animal.',
      });
    }
    if (facility > 0) {
      initialEntries.push({
        ngoId: ngo.id,
        type: 'EXPENSE',
        category: 'FACILITY',
        titlePt: 'Manutenção de Instalações, Limpeza e Utilidades',
        titleEn: 'Facility Upkeep, Sanitation & Utilities',
        amount: facility,
        month: currentMonth,
        documentRef: `INI-DESP-03`,
        notes: 'Manutenção física e sanitária do abrigo.',
      });
    }
    if (admin > 0) {
      initialEntries.push({
        ngoId: ngo.id,
        type: 'EXPENSE',
        category: 'ADMINISTRATION',
        titlePt: 'Despesas Administrativas, Contábeis e Transporte',
        titleEn: 'Administrative, Accounting & Rescue Logistics',
        amount: admin,
        month: currentMonth,
        documentRef: `INI-DESP-04`,
        notes: 'Custos contábeis e operacionais.',
      });
    }

    if (initialEntries.length > 0) {
      await prisma.financialEntry.createMany({ data: initialEntries });
    }

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorName: user.name,
        actorRole: 'NGO',
        action: 'NGO_REGISTERED',
        targetType: 'NGO',
        targetId: ngo.id,
        details: `Nova ONG credenciada: ${ngo.tradeName} (${ngo.cnpj}) em ${ngo.city}/${ngo.state}.`,
      },
    });

    return { ngo, user };
  }

  static async updateNgoProfile(
    ngoId: string,
    actor: { id: string; name: string; role: string },
    data: Partial<{
      legalName: string;
      tradeName: string;
      state: string;
      city: string;
      address: string;
      size: string;
      causeTags: string;
      descriptionPt: string;
      descriptionEn: string;
      missionPt: string;
      missionEn: string;
      email: string;
      phone: string;
      website: string;
      instagram: string;
      pixKey: string;
      bankInfo: string;
    }>
  ) {
    const updated = await prisma.nGO.update({
      where: { id: ngoId },
      data: {
        ...(data.legalName ? { legalName: data.legalName } : {}),
        ...(data.tradeName ? { tradeName: data.tradeName } : {}),
        ...(data.state ? { state: data.state.toUpperCase() } : {}),
        ...(data.city ? { city: data.city } : {}),
        ...(data.address ? { address: data.address } : {}),
        ...(data.size ? { size: data.size } : {}),
        ...(data.causeTags !== undefined ? { causeTags: data.causeTags } : {}),
        ...(data.descriptionPt ? { descriptionPt: data.descriptionPt } : {}),
        ...(data.descriptionEn ? { descriptionEn: data.descriptionEn } : {}),
        ...(data.missionPt ? { missionPt: data.missionPt } : {}),
        ...(data.missionEn ? { missionEn: data.missionEn } : {}),
        ...(data.email ? { email: data.email } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.website !== undefined ? { website: data.website } : {}),
        ...(data.instagram !== undefined ? { instagram: data.instagram } : {}),
        ...(data.pixKey !== undefined ? { pixKey: data.pixKey } : {}),
        ...(data.bankInfo !== undefined ? { bankInfo: data.bankInfo } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'NGO_PROFILE_UPDATED',
        targetType: 'NGO',
        targetId: ngoId,
        details: `Dados institucionais de ${updated.tradeName} atualizados.`,
      },
    });

    return updated;
  }

  static async createAnimal(
    ngoId: string,
    actor: { id: string; name: string; role: string },
    data: {
      name: string;
      species: string;
      breed: string;
      ageMonths: number;
      ageGroup: string;
      size: string;
      gender: string;
      temperament: string;
      vaccinated: boolean;
      neutered: boolean;
      microchipped: boolean;
      specialNeeds: boolean;
      descriptionPt: string;
      descriptionEn?: string;
      photoUrl?: string;
      status?: string;
    }
  ) {
    const defaultPhotos: Record<string, string> = {
      DOG: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80',
      CAT: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      OTHER: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    };

    const animal = await prisma.animal.create({
      data: {
        ngoId,
        name: data.name.trim(),
        species: data.species,
        breed: data.breed.trim() || 'SRD',
        ageMonths: Number(data.ageMonths) || 12,
        ageGroup: data.ageGroup || 'ADULT',
        size: data.size || 'MEDIUM',
        gender: data.gender || 'MALE',
        temperament: data.temperament || 'DOCILE,SOCIABLE',
        vaccinated: Boolean(data.vaccinated),
        neutered: Boolean(data.neutered),
        microchipped: Boolean(data.microchipped),
        specialNeeds: Boolean(data.specialNeeds),
        descriptionPt: data.descriptionPt.trim(),
        descriptionEn: (data.descriptionEn || data.descriptionPt).trim(),
        photoUrl: data.photoUrl?.trim() || defaultPhotos[data.species] || defaultPhotos.DOG,
        status: data.status || 'AVAILABLE',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'ANIMAL_CREATED',
        targetType: 'ANIMAL',
        targetId: animal.id,
        details: `Animal cadastrado no catálogo: ${animal.name} (${animal.species} - ${animal.breed}).`,
      },
    });

    return animal;
  }

  static async updateAnimal(
    animalId: string,
    ngoId: string,
    actor: { id: string; name: string; role: string },
    data: Partial<{
      name: string;
      species: string;
      breed: string;
      ageMonths: number;
      ageGroup: string;
      size: string;
      gender: string;
      temperament: string;
      vaccinated: boolean;
      neutered: boolean;
      microchipped: boolean;
      specialNeeds: boolean;
      descriptionPt: string;
      descriptionEn: string;
      photoUrl: string;
      status: string;
    }>
  ) {
    const existing = await prisma.animal.findUnique({ where: { id: animalId } });
    if (!existing || (actor.role !== 'ADMIN' && existing.ngoId !== ngoId)) {
      throw new Error('Animal não encontrado ou permissão negada.');
    }

    const updated = await prisma.animal.update({
      where: { id: animalId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.species ? { species: data.species } : {}),
        ...(data.breed ? { breed: data.breed } : {}),
        ...(data.ageMonths !== undefined ? { ageMonths: Number(data.ageMonths) } : {}),
        ...(data.ageGroup ? { ageGroup: data.ageGroup } : {}),
        ...(data.size ? { size: data.size } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        ...(data.temperament ? { temperament: data.temperament } : {}),
        ...(data.vaccinated !== undefined ? { vaccinated: Boolean(data.vaccinated) } : {}),
        ...(data.neutered !== undefined ? { neutered: Boolean(data.neutered) } : {}),
        ...(data.microchipped !== undefined ? { microchipped: Boolean(data.microchipped) } : {}),
        ...(data.specialNeeds !== undefined ? { specialNeeds: Boolean(data.specialNeeds) } : {}),
        ...(data.descriptionPt ? { descriptionPt: data.descriptionPt } : {}),
        ...(data.descriptionEn ? { descriptionEn: data.descriptionEn } : {}),
        ...(data.photoUrl ? { photoUrl: data.photoUrl } : {}),
        ...(data.status ? { status: data.status } : {}),
      },
    });

    if (data.status === 'ADOPTED' && existing.status !== 'ADOPTED') {
      await prisma.nGO.update({
        where: { id: existing.ngoId },
        data: { totalAdoptions: { increment: 1 } },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'ANIMAL_UPDATED',
        targetType: 'ANIMAL',
        targetId: animalId,
        details: `Ficha de ${updated.name} atualizada (Status: ${updated.status}).`,
      },
    });

    return updated;
  }

  static async deleteAnimal(
    animalId: string,
    ngoId: string,
    actor: { id: string; name: string; role: string }
  ) {
    const existing = await prisma.animal.findUnique({ where: { id: animalId } });
    if (!existing || (actor.role !== 'ADMIN' && existing.ngoId !== ngoId)) {
      throw new Error('Animal não encontrado ou permissão negada.');
    }

    await prisma.animal.delete({ where: { id: animalId } });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'ANIMAL_DELETED',
        targetType: 'ANIMAL',
        targetId: animalId,
        details: `Registro do animal ${existing.name} removido do catálogo.`,
      },
    });

    return { deleted: true };
  }

  static async submitAdoptionInquiry(data: {
    animalId: string;
    ngoId: string;
    userId?: string | null;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    cityState: string;
    housingType: string;
    hasOtherPets: boolean;
    safeScreens: boolean;
    message: string;
  }) {
    const animal = await prisma.animal.findUnique({ where: { id: data.animalId } });
    if (!animal) throw new Error('Animal não encontrado.');

    const inquiry = await prisma.adoptionInquiry.create({
      data: {
        animalId: data.animalId,
        ngoId: animal.ngoId,
        userId: data.userId || null,
        applicantName: data.applicantName.trim(),
        applicantEmail: data.applicantEmail.trim(),
        applicantPhone: data.applicantPhone.trim(),
        cityState: data.cityState.trim(),
        housingType: data.housingType || 'APARTMENT',
        hasOtherPets: Boolean(data.hasOtherPets),
        safeScreens: Boolean(data.safeScreens),
        message: data.message.trim(),
        status: 'PENDING',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: data.userId || null,
        actorName: data.applicantName,
        actorRole: 'SUPPORTER',
        action: 'ADOPTION_INQUIRY_SUBMITTED',
        targetType: 'INQUIRY',
        targetId: inquiry.id,
        details: `Interesse de adoção enviado para ${animal.name} por ${data.applicantName} (${data.cityState}).`,
      },
    });

    return inquiry;
  }

  static async updateInquiryStatus(
    inquiryId: string,
    ngoId: string,
    actor: { id: string; name: string; role: string },
    status: string,
    reviewNotes?: string
  ) {
    const existing = await prisma.adoptionInquiry.findUnique({
      where: { id: inquiryId },
      include: { animal: true },
    });

    if (!existing || (actor.role !== 'ADMIN' && existing.ngoId !== ngoId)) {
      throw new Error('Pedido de adoção não encontrado ou sem permissão.');
    }

    const updated = await prisma.adoptionInquiry.update({
      where: { id: inquiryId },
      data: {
        status,
        reviewNotes: reviewNotes !== undefined ? reviewNotes : existing.reviewNotes,
      },
    });

    if (status === 'APPROVED' && existing.animal.status !== 'ADOPTED') {
      await prisma.animal.update({
        where: { id: existing.animalId },
        data: { status: 'ADOPTED' },
      });
      await prisma.nGO.update({
        where: { id: existing.ngoId },
        data: { totalAdoptions: { increment: 1 } },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'INQUIRY_STATUS_UPDATED',
        targetType: 'INQUIRY',
        targetId: inquiryId,
        details: `Pedido de adoção (${existing.animal.name} - ${existing.applicantName}) atualizado para ${status}.`,
      },
    });

    return updated;
  }
}
