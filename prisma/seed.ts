import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { PDF_CASH_FLOW, PDF_MONTHS } from './pdf-cash-flow';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'adoteaki_salt').digest('hex');
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados AdoteAki...');

  await prisma.auditLog.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.adoptionInquiry.deleteMany();
  await prisma.financialEntry.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.nGO.deleteMany();
  await prisma.user.deleteMany();

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@adoteaki.org.br',
      name: 'Administrador',
      passwordHash: hashPassword('admin123'),
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const ngoUser = await prisma.user.create({
    data: {
      email: 'ong@adoteaki.org.br',
      name: 'ONG de Proteção Animal',
      passwordHash: hashPassword('ong12345'),
      role: 'NGO',
      status: 'ACTIVE',
    },
  });

  const ngo = await prisma.nGO.create({
    data: {
      slug: 'ong-de-protecao-animal',
      userId: ngoUser.id,
      legalName: 'ONG de Proteção Animal',
      tradeName: 'ONG de Proteção Animal',
      cnpj: '',
      foundationYear: 2027,
      state: 'NA',
      city: 'Não informado',
      address: 'Não informado',
      size: 'MEDIUM',
      causeTags: 'PROTECAO_ANIMAL',
      descriptionPt: 'ONG de Proteção Animal.',
      descriptionEn: 'Animal Protection NGO.',
      missionPt: 'Proteção e cuidado de animais.',
      missionEn: 'Animal protection and care.',
      email: 'ong@adoteaki.org.br',
      phone: 'Não informado',
      pixKey: null,
      bankInfo: null,
      status: 'APPROVED',
      verifiedScore: 0,
      initialBalance: 0,
      totalAdoptions: 0,
      financialUpdatedAt: new Date('2027-01-01T00:00:00Z'),
    },
  });

  await prisma.financialEntry.createMany({
    data: PDF_CASH_FLOW.flatMap((line) =>
      line.amounts.map((amount, index) => ({
        ngoId: ngo.id,
        type: line.type,
        category: line.category,
        groupPt: line.groupPt,
        groupEn: line.groupEn,
        titlePt: line.titlePt,
        titleEn: line.titleEn,
        amount,
        annualPercentage: line.annualPercentage,
        month: PDF_MONTHS[index],
        entryDate: new Date(`${PDF_MONTHS[index]}-15T12:00:00Z`),
        documentRef: 'Fluxo de caixa P.I.pdf',
        notes: 'Planejamento 2027 pelo método direto, conforme o PDF.',
      })),
    ),
  });

  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: 'ADMIN',
      action: 'NGO_VERIFIED',
      targetType: 'NGO',
      targetId: ngo.id,
      details: 'ONG de Proteção Animal cadastrada com dados do planejamento financeiro de 2027.',
    },
  });

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
