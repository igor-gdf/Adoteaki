import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'adoteaki_salt').digest('hex');
}

const MONTHS = [
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados AdoteAki...');

  await prisma.auditLog.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.adoptionInquiry.deleteMany();
  await prisma.financialEntry.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.nGO.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Core Users (Admin, NGO Owners, Supporter)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@adoteaki.org.br',
      name: 'Helena Vasconcelos (Auditora Chefe)',
      passwordHash: hashPassword('admin123'),
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '(11) 99812-4400',
      city: 'São Paulo',
      state: 'SP',
    },
  });

  const spNgoUser = await prisma.user.create({
    data: {
      email: 'contato@pataspaulistas.org.br',
      name: 'Dr. Ricardo Mendes',
      passwordHash: hashPassword('ong123'),
      role: 'NGO',
      status: 'ACTIVE',
      phone: '(11) 3456-7890',
      city: 'São Paulo',
      state: 'SP',
    },
  });

  const prNgoUser = await prisma.user.create({
    data: {
      email: 'gestao@aucanaraucaria.org.br',
      name: 'Camila Kovalchuk',
      passwordHash: hashPassword('ong123'),
      role: 'NGO',
      status: 'ACTIVE',
      phone: '(41) 3288-9012',
      city: 'Curitiba',
      state: 'PR',
    },
  });

  const baNgoUser = await prisma.user.create({
    data: {
      email: 'diretoria@abrigobahia.org.br',
      name: 'Mateus Santana Lima',
      passwordHash: hashPassword('ong123'),
      role: 'NGO',
      status: 'ACTIVE',
      phone: '(71) 3341-5520',
      city: 'Salvador',
      state: 'BA',
    },
  });

  const mgNgoUser = await prisma.user.create({
    data: {
      email: 'coordenacao@serradocoral.org.br',
      name: 'Fernanda Drummond',
      passwordHash: hashPassword('ong123'),
      role: 'NGO',
      status: 'ACTIVE',
      phone: '(31) 3224-1190',
      city: 'Belo Horizonte',
      state: 'MG',
    },
  });

  const supporterUser = await prisma.user.create({
    data: {
      email: 'apoiador@adoteaki.org.br',
      name: 'Lucas Ferreira Alves',
      passwordHash: hashPassword('apoiador123'),
      role: 'SUPPORTER',
      status: 'ACTIVE',
      phone: '(11) 98765-1234',
      city: 'São Paulo',
      state: 'SP',
    },
  });

  // 2. Create 4 Brazilian NGOs (3 Approved & 1 Pending for Admin testing)
  const spNgo = await prisma.nGO.create({
    data: {
      slug: 'instituto-patas-paulistas',
      userId: spNgoUser.id,
      legalName: 'Associação Protetora e Hospitalar Patas Paulistas',
      tradeName: 'Instituto Patas Paulistas',
      cnpj: '11.222.333/0001-81',
      foundationYear: 2015,
      state: 'SP',
      city: 'São Paulo',
      address: 'Rua Borges Lagoa, 1420 - Vila Clementino, São Paulo - SP, 04038-004',
      latitude: -23.5978,
      longitude: -46.6431,
      size: 'LARGE',
      causeTags: 'CAES,GATOS,REABILITACAO_ORTOPEDICA,CASTRACAO,IDOSOS',
      descriptionPt:
        'Fundado em 2015 por médicos veterinários e ativistas urbanos na Zona Sul de São Paulo, o Instituto Patas Paulistas atua no resgate de cães e gatos vítimas de atropelamento e abandono severo. Mantemos um centro cirúrgico próprio de alta eficiência e publicamos balancetes auditados mensalmente.',
      descriptionEn:
        'Founded in 2015 by veterinarians and urban advocates in southern São Paulo, Instituto Patas Paulistas rescues dogs and cats suffering from severe neglect and road trauma. We operate an in-house surgical ward and publish monthly audited financial ledgers.',
      missionPt:
        'Garantir reabilitação clínica integral, castração em massa e adoção responsável com 100% de rastreabilidade contábil para cada centavo doado.',
      missionEn:
        'Provide comprehensive clinical rehabilitation, mass spay/neuter programs, and responsible adoption with 100% accounting traceability for every donated real.',
      email: 'contato@pataspaulistas.org.br',
      phone: '(11) 3456-7890',
      website: 'https://pataspaulistas.org.br',
      instagram: '@pataspaulistas.sp',
      pixKey: '11.222.333/0001-81',
      bankInfo: 'Banco do Brasil (001) • Ag 1248-3 • CC 88412-9',
      status: 'APPROVED',
      verifiedScore: 98,
      initialBalance: 42500.0,
      totalAdoptions: 642,
      financialUpdatedAt: new Date('2026-10-28T14:30:00Z'),
    },
  });

  const prNgo = await prisma.nGO.create({
    data: {
      slug: 'refugio-aucan-araucaria',
      userId: prNgoUser.id,
      legalName: 'Sociedade Civil de Amparo Animal Refúgio das Araucárias',
      tradeName: 'Refúgio Aucan Araucária',
      cnpj: '23.456.789/0001-95',
      foundationYear: 2018,
      state: 'PR',
      city: 'Curitiba',
      address: 'Av. Manoel Ribas, 3890 - Santa Felicidade, Curitiba - PR, 82400-000',
      latitude: -25.4026,
      longitude: -49.3322,
      size: 'MEDIUM',
      causeTags: 'CAES,GRANDE_PORTE,RESGATE_RURAL,VACINACAO',
      descriptionPt:
        'Localizado em uma chácara estruturada em Santa Felicidade, Curitiba, o Refúgio Aucan é especializado em cães de médio e grande porte resgatados de rodovias e áreas rurais da Região Metropolitana. Nossos canis são integrados à natureza com solários coletivos.',
      descriptionEn:
        'Situated on a structured sanctuary property in Santa Felicidade, Curitiba, Refúgio Aucan specializes in medium and large dogs rescued from highways and rural areas. Our kennels feature open-air social sun yards.',
      missionPt:
        'Promover o bem-estar físico e comportamental de animais de médio e grande porte, conectando famílias a companheiros equilibrados e saudáveis.',
      missionEn:
        'Promote physical and behavioral wellness for medium and large dogs, connecting families with balanced and healthy companions.',
      email: 'gestao@aucanaraucaria.org.br',
      phone: '(41) 3288-9012',
      website: 'https://aucanaraucaria.org.br',
      instagram: '@refugioaucan.cwb',
      pixKey: '23.456.789/0001-95',
      bankInfo: 'Itaú (341) • Ag 0412 • CC 33910-4',
      status: 'APPROVED',
      verifiedScore: 95,
      initialBalance: 24800.0,
      totalAdoptions: 389,
      financialUpdatedAt: new Date('2026-10-26T10:15:00Z'),
    },
  });

  const baNgo = await prisma.nGO.create({
    data: {
      slug: 'abrigo-sol-da-bahia',
      userId: baNgoUser.id,
      legalName: 'Fundação Baiana de Proteção Felina e Canina Sol da Bahia',
      tradeName: 'Abrigo Sol da Bahia',
      cnpj: '41.872.650/0001-04',
      foundationYear: 2017,
      state: 'BA',
      city: 'Salvador',
      address: 'Rua Direita de Santo Antônio, 214 - Santo Antônio Além do Carmo, Salvador - BA, 40301-280',
      latitude: -12.9631,
      longitude: -38.5046,
      size: 'MEDIUM',
      causeTags: 'GATOS,CAES,CASTRACAO_COMUNITARIA,EDUCACAO_AMBIENTAL',
      descriptionPt:
        'Atuando no Centro Histórico e comunidades litorâneas de Salvador, o Abrigo Sol da Bahia combina um gatil modelo livre de gaiolas com mutirões quinzenais de castração gratuita e vacinação comunitária.',
      descriptionEn:
        'Operating across the Historic Center and coastal communities of Salvador, Abrigo Sol da Bahia combines a cage-free model cattery with bi-weekly free spay/neuter and community vaccination drives.',
      missionPt:
        'Reduzir o abandono urbano em Salvador por meio da medicina veterinária preventiva, educação comunitária e transparência ativa.',
      missionEn:
        'Reduce urban abandonment in Salvador through preventive veterinary medicine, community education, and active transparency.',
      email: 'diretoria@abrigobahia.org.br',
      phone: '(71) 3341-5520',
      website: 'https://abrigosoldabahia.org.br',
      instagram: '@abrigosoldabahia',
      pixKey: '41.872.650/0001-04',
      bankInfo: 'Caixa Econômica (104) • Ag 0061 • Op 003 • CC 1940-2',
      status: 'APPROVED',
      verifiedScore: 93,
      initialBalance: 16200.0,
      totalAdoptions: 518,
      financialUpdatedAt: new Date('2026-10-25T17:45:00Z'),
    },
  });

  const mgNgo = await prisma.nGO.create({
    data: {
      slug: 'associacao-serra-do-curral',
      userId: mgNgoUser.id,
      legalName: 'Associação Mineira de Defesa da Fauna Doméstica Serra do Curral',
      tradeName: 'Proteção Serra do Curral',
      cnpj: '58.319.420/0001-15',
      foundationYear: 2021,
      state: 'MG',
      city: 'Belo Horizonte',
      address: 'Rua Guaicuí, 510 - Coração de Jesus, Belo Horizonte - MG, 30380-380',
      latitude: -19.9447,
      longitude: -43.9497,
      size: 'SMALL',
      causeTags: 'FILHOTES,GATOS,LAR_TEMPORARIO',
      descriptionPt:
        'Rede estruturada de lares temporários e atendimento clínico parceiro em Belo Horizonte, focada em ninhadas resgatadas em áreas de encosta.',
      descriptionEn:
        'Structured foster home network and partner clinical care in Belo Horizonte, focused on litters rescued from hillside communities.',
      missionPt:
        'Oferecer acolhimento familiar temporário livre de estresse até a adoção definitiva.',
      missionEn:
        'Offer stress-free temporary family fostering until permanent adoption.',
      email: 'coordenacao@serradocoral.org.br',
      phone: '(31) 3224-1190',
      website: 'https://serradocurralpets.org.br',
      instagram: '@serradocurral.bh',
      pixKey: '58.319.420/0001-15',
      bankInfo: 'Sicoob (756) • Ag 4102 • CC 77219-0',
      status: 'PENDING',
      verifiedScore: 84,
      initialBalance: 9400.0,
      totalAdoptions: 112,
      financialUpdatedAt: new Date('2026-10-20T09:00:00Z'),
    },
  });

  // 3. Seed Animals across the NGOs
  const animalsData = [
    // São Paulo (spNgo)
    {
      ngoId: spNgo.id,
      name: 'Bento',
      species: 'DOG',
      breed: 'SRD (Vira-lata Caramelo)',
      ageMonths: 28,
      ageGroup: 'ADULT',
      size: 'MEDIUM',
      gender: 'MALE',
      temperament: 'DOCILE,SOCIABLE,PLAYFUL',
      vaccinated: true,
      neutered: true,
      microchipped: true,
      specialNeeds: false,
      descriptionPt:
        'Bento foi resgatado próximo ao Parque Ibirapuera com uma fratura simples já 100% consolidada. É extremamente afetuoso, adora passeios de guia e convive muito bem com outros cães e crianças.',
      descriptionEn:
        'Bento was rescued near Ibirapuera Park with a simple fracture that has now 100% healed. He is deeply affectionate, loves leash walks, and gets along wonderfully with other dogs and children.',
      photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: true,
    },
    {
      ngoId: spNgo.id,
      name: 'Amora',
      species: 'CAT',
      breed: 'Siamês Mestiça',
      ageMonths: 14,
      ageGroup: 'ADULT',
      size: 'SMALL',
      gender: 'FEMALE',
      temperament: 'CALM,DOCILE,INDEPENDENT',
      vaccinated: true,
      neutered: true,
      microchipped: true,
      specialNeeds: false,
      descriptionPt:
        'Amora tem olhos azuis expressivos e um temperamento sereno. Perfeita para apartamentos telados, gosta de tomar sol na janela e ronrona assim que recebe carinho no queixo.',
      descriptionEn:
        'Amora has expressive blue eyes and a serene temperament. Ideal for screened apartments, she loves sunbathing by the window and purrs as soon as she gets chin scratches.',
      photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: true,
    },
    {
      ngoId: spNgo.id,
      name: 'Joaquim',
      species: 'DOG',
      breed: 'SRD Pelo Curto',
      ageMonths: 96,
      ageGroup: 'SENIOR',
      size: 'MEDIUM',
      gender: 'MALE',
      temperament: 'CALM,DOCILE',
      vaccinated: true,
      neutered: true,
      microchipped: true,
      specialNeeds: true,
      descriptionPt:
        'Joaquim é um senhorzinho de 8 anos muito educado e tranquilo. Faz uso apenas de condroprotetor diário para as articulações e procura um lar silencioso para cochilar no sofá.',
      descriptionEn:
        'Joaquim is a polite, peaceful 8-year-old gentleman. He only takes a daily joint supplement and is looking for a quiet home where he can nap on the sofa.',
      photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: false,
    },
    {
      ngoId: spNgo.id,
      name: 'Cacau',
      species: 'DOG',
      breed: 'Podengo Mestiça',
      ageMonths: 7,
      ageGroup: 'PUPPY',
      size: 'SMALL',
      gender: 'FEMALE',
      temperament: 'PLAYFUL,SOCIABLE,ENERGETIC',
      vaccinated: true,
      neutered: true,
      microchipped: false,
      specialNeeds: false,
      descriptionPt:
        'Filhote já castrada e com ciclo vacinal completo (V10 + Antirrábica). Inteligente, aprende comandos rápido e se adapta bem a rotinas familiares.',
      descriptionEn:
        'Spayed puppy with complete vaccination protocol (V10 + Rabies). Smart, learns commands quickly, and adapts well to family routines.',
      photoUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: false,
    },

    // Curitiba (prNgo)
    {
      ngoId: prNgo.id,
      name: 'Thor da Serra',
      species: 'DOG',
      breed: 'Pastor Mestiço',
      ageMonths: 36,
      ageGroup: 'ADULT',
      size: 'LARGE',
      gender: 'MALE',
      temperament: 'PROTECTIVE,DOCILE,SOCIABLE',
      vaccinated: true,
      neutered: true,
      microchipped: true,
      specialNeeds: false,
      descriptionPt:
        'Resgatado na BR-277 próximo a Curitiba, Thor é um cão porte grande de postura nobre e coração gigante. Adora correr em gramados e é extremamente leal à família.',
      descriptionEn:
        'Rescued along highway BR-277 near Curitiba, Thor is a noble large-breed dog with a giant heart. He loves running on grass and is deeply loyal to his family.',
      photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: true,
    },
    {
      ngoId: prNgo.id,
      name: 'Pinhão',
      species: 'DOG',
      breed: 'Border Collie Mestiço',
      ageMonths: 18,
      ageGroup: 'ADULT',
      size: 'MEDIUM',
      gender: 'MALE',
      temperament: 'ENERGETIC,PLAYFUL,SOCIABLE',
      vaccinated: true,
      neutered: true,
      microchipped: true,
      specialNeeds: false,
      descriptionPt:
        'Pinhão é ágil, brincalhão e adora buscar bolinhas. Ideal para tutores ativos que gostam de caminhadas em parques ou casas com quintal seguro.',
      descriptionEn:
        'Pinhão is agile, playful, and loves fetching balls. Ideal for active guardians who enjoy park walks or homes with a secure yard.',
      photoUrl: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: false,
    },
    {
      ngoId: prNgo.id,
      name: 'Gaia',
      species: 'DOG',
      breed: 'Retriever Mestiça',
      ageMonths: 48,
      ageGroup: 'ADULT',
      size: 'LARGE',
      gender: 'FEMALE',
      temperament: 'CALM,DOCILE,SOCIABLE',
      vaccinated: true,
      neutered: true,
      microchipped: true,
      specialNeeds: false,
      descriptionPt:
        'Gaia tem um olhar meigo e paciência infinita. Excelente companhia para famílias com crianças ou outros animais.',
      descriptionEn:
        'Gaia has a gentle gaze and endless patience. An excellent companion for families with children or other pets.',
      photoUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: false,
    },

    // Salvador (baNgo)
    {
      ngoId: baNgo.id,
      name: 'Dendê',
      species: 'CAT',
      breed: 'Tigrado Laranja Brasileiro',
      ageMonths: 10,
      ageGroup: 'PUPPY',
      size: 'SMALL',
      gender: 'MALE',
      temperament: 'PLAYFUL,SOCIABLE,DOCILE',
      vaccinated: true,
      neutered: true,
      microchipped: true,
      specialNeeds: false,
      descriptionPt:
        'Testado negativo para FIV/FeLV, Dendê foi resgatado no Pelourinho ainda filhote. É super sociável, recebe visitas na porta e adora brincar com varinhas.',
      descriptionEn:
        'Tested negative for FIV/FeLV, Dendê was rescued in Pelourinho as a kitten. He is super sociable, greets visitors at the door, and loves wand toys.',
      photoUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: true,
    },
    {
      ngoId: baNgo.id,
      name: 'Moqueca',
      species: 'CAT',
      breed: 'Tricolor (Calico)',
      ageMonths: 24,
      ageGroup: 'ADULT',
      size: 'SMALL',
      gender: 'FEMALE',
      temperament: 'CALM,DOCILE',
      vaccinated: true,
      neutered: true,
      microchipped: false,
      specialNeeds: false,
      descriptionPt:
        'Moqueca é uma gata tricolor super carinhosa e silenciosa. Usa caixa de areia perfeitamente e convive bem com outros felinos.',
      descriptionEn:
        'Moqueca is a deeply affectionate and quiet calico cat. She uses the litter box impeccably and coexists well with other felines.',
      photoUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: false,
    },
    {
      ngoId: baNgo.id,
      name: 'Jorge Amado',
      species: 'DOG',
      breed: 'SRD Praiano',
      ageMonths: 40,
      ageGroup: 'ADULT',
      size: 'MEDIUM',
      gender: 'MALE',
      temperament: 'CALM,SOCIABLE,DOCILE',
      vaccinated: true,
      neutered: true,
      microchipped: true,
      specialNeeds: false,
      descriptionPt:
        'Jorge foi acolhido na orla da Barra. É um cão sereno, acostumado a passear sem puxar a guia e muito querido por toda a equipe de voluntários.',
      descriptionEn:
        'Jorge was taken in along the Barra waterfront. He is a serene dog, used to walking without pulling on the leash, and beloved by our volunteer team.',
      photoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80',
      status: 'AVAILABLE',
      featured: false,
    },
  ];

  const createdAnimals = [];
  for (const animal of animalsData) {
    const created = await prisma.animal.create({ data: animal });
    createdAnimals.push(created);
  }

  // 4. Generate 12 months of realistic Financial Ledger Entries for each NGO
  const ngoProfiles = [
    {
      ngo: spNgo,
      scale: 1.0,
      prefix: 'SP',
      baseDonations: 28500,
      baseGrants: 12000,
      baseEvents: 6400,
      baseVet: 19200,
      baseFood: 11800,
      baseFacility: 6500,
      baseAdmin: 3900,
    },
    {
      ngo: prNgo,
      scale: 0.65,
      prefix: 'PR',
      baseDonations: 17200,
      baseGrants: 7500,
      baseEvents: 4100,
      baseVet: 11400,
      baseFood: 8600,
      baseFacility: 4200,
      baseAdmin: 2100,
    },
    {
      ngo: baNgo,
      scale: 0.55,
      prefix: 'BA',
      baseDonations: 14800,
      baseGrants: 5800,
      baseEvents: 3600,
      baseVet: 10200,
      baseFood: 6900,
      baseFacility: 3400,
      baseAdmin: 1850,
    },
    {
      ngo: mgNgo,
      scale: 0.35,
      prefix: 'MG',
      baseDonations: 8200,
      baseGrants: 2500,
      baseEvents: 1900,
      baseVet: 5800,
      baseFood: 3900,
      baseFacility: 1600,
      baseAdmin: 950,
    },
  ];

  const seasonalFactors = [1.02, 1.28, 0.91, 0.94, 0.98, 1.04, 1.08, 1.12, 1.05, 1.09, 1.14, 1.19];

  for (const profile of ngoProfiles) {
    for (let idx = 0; idx < MONTHS.length; idx++) {
      const month = MONTHS[idx];
      const factor = seasonalFactors[idx];
      const entryDate = new Date(`${month}-15T12:00:00Z`);

      const entries = [
        // Revenues
        {
          ngoId: profile.ngo.id,
          type: 'REVENUE',
          category: 'DONATIONS',
          titlePt: `Doações Recorrentes PIX & Apoiadores (${month})`,
          titleEn: `Recurring PIX & Supporter Donations (${month})`,
          amount: Math.round(profile.baseDonations * factor),
          month,
          entryDate,
          documentRef: `REC-${profile.prefix}-${month}-01`,
          notes: 'Consolidado de transferências PIX e assinaturas mensais auditadas via extrato bancário.',
        },
        {
          ngoId: profile.ngo.id,
          type: 'REVENUE',
          category: 'GRANTS',
          titlePt: `Repasse Edital Público / Parceria Clínica (${month})`,
          titleEn: `Public Grant & Clinical Partnership (${month})`,
          amount: Math.round(profile.baseGrants * (idx % 2 === 0 ? 1.1 : 0.92)),
          month,
          entryDate,
          documentRef: `CONV-${profile.prefix}-${month}-02`,
          notes: 'Termo de fomento municipal para castração e insumos hospitalares.',
        },
        {
          ngoId: profile.ngo.id,
          type: 'REVENUE',
          category: 'EVENTS',
          titlePt: `Feira de Adoção & Bazar Solidário (${month})`,
          titleEn: `Adoption Fair & Charity Bazaar (${month})`,
          amount: Math.round(profile.baseEvents * factor),
          month,
          entryDate,
          documentRef: `EVT-${profile.prefix}-${month}-03`,
          notes: 'Arrecadação presencial em evento mensal de adoção e venda de produtos institucionais.',
        },
        // Expenses
        {
          ngoId: profile.ngo.id,
          type: 'EXPENSE',
          category: 'VETERINARY',
          titlePt: `Insumos Cirúrgicos, Vacinas V10/V4 e Internações (${month})`,
          titleEn: `Surgical Supplies, Vaccines & Hospitalization (${month})`,
          amount: Math.round(profile.baseVet * (factor * 0.97)),
          month,
          entryDate,
          documentRef: `NF-${profile.prefix}-${month}-101`,
          notes: 'Notas fiscais de distribuidoras veterinárias, anestésicos, exames hematológicos e cirurgias.',
        },
        {
          ngoId: profile.ngo.id,
          type: 'EXPENSE',
          category: 'FOOD',
          titlePt: `Ração Super Premium, Úmidos e Suplementação (${month})`,
          titleEn: `High-Grade Kibble, Wet Food & Supplements (${month})`,
          amount: Math.round(profile.baseFood * (1 + (idx * 0.012))),
          month,
          entryDate,
          documentRef: `NF-${profile.prefix}-${month}-102`,
          notes: 'Lote mensal de ração seca, dietas renais/hepáticas e sachês para animais convalescentes.',
        },
        {
          ngoId: profile.ngo.id,
          type: 'EXPENSE',
          category: 'FACILITY',
          titlePt: `Manutenção de Abrigo, Saneamento e Energia (${month})`,
          titleEn: `Shelter Upkeep, Sanitation & Utilities (${month})`,
          amount: Math.round(profile.baseFacility * (idx % 3 === 0 ? 1.08 : 0.98)),
          month,
          entryDate,
          documentRef: `NF-${profile.prefix}-${month}-103`,
          notes: 'Desinfetantes hospitalares (amônia quaternária), água, energia elétrica e reparos de baias.',
        },
        {
          ngoId: profile.ngo.id,
          type: 'EXPENSE',
          category: 'ADMINISTRATION',
          titlePt: `Contabilidade, Logística de Resgate e Sistema (${month})`,
          titleEn: `Accounting, Rescue Logistics & Administration (${month})`,
          amount: Math.round(profile.baseAdmin),
          month,
          entryDate,
          documentRef: `NF-${profile.prefix}-${month}-104`,
          notes: 'Combustível da van de resgate, honorários contábeis obrigatórios e taxas operacionais.',
        },
      ];

      await prisma.financialEntry.createMany({ data: entries });
    }
  }

  // 5. Seed Adoption Inquiries
  await prisma.adoptionInquiry.create({
    data: {
      animalId: createdAnimals[0].id, // Bento
      ngoId: spNgo.id,
      userId: supporterUser.id,
      applicantName: 'Lucas Ferreira Alves',
      applicantEmail: 'apoiador@adoteaki.org.br',
      applicantPhone: '(11) 98765-1234',
      cityState: 'São Paulo - SP',
      housingType: 'APARTMENT',
      hasOtherPets: false,
      safeScreens: true,
      message:
        'Moro em apartamento amplo próximo ao Parque da Aclimação, todas as janelas e sacada possuem redes de proteção novas. Trabalho em regime remoto e tenho disponibilidade para 3 passeios diários.',
      status: 'INTERVIEW',
      reviewNotes: 'Entrevista por vídeo agendada para quinta-feira às 19h. Perfil excelente.',
    },
  });

  await prisma.adoptionInquiry.create({
    data: {
      animalId: createdAnimals[1].id, // Amora
      ngoId: spNgo.id,
      applicantName: 'Beatriz Nogueira Costa',
      applicantEmail: 'beatriz.nogueira@email.com.br',
      applicantPhone: '(11) 99123-4567',
      cityState: 'São Paulo - SP',
      housingType: 'APARTMENT',
      hasOtherPets: true,
      safeScreens: true,
      message:
        'Tenho uma gatinha castrada de 2 anos super dócil (negativa para FIV/FeLV) e gostaria de adotar a Amora para fazer companhia a ela.',
      status: 'PENDING',
    },
  });

  await prisma.adoptionInquiry.create({
    data: {
      animalId: createdAnimals[4].id, // Thor da Serra
      ngoId: prNgo.id,
      applicantName: 'Eduardo Scherer',
      applicantEmail: 'eduardo.scherer@curitiba.pr.br',
      applicantPhone: '(41) 99811-2233',
      cityState: 'Curitiba - PR',
      housingType: 'HOUSE',
      hasOtherPets: false,
      safeScreens: true,
      message:
        'Temos uma casa com terreno murado de 450m² no bairro Ahú. Sempre tivemos cães de grande porte e queremos oferecer um lar definitivo para o Thor.',
      status: 'APPROVED',
      reviewNotes: 'Vistoria presencial aprovada. Termo de adoção pronto para assinatura.',
    },
  });

  // 6. Seed Favorites for Supporter User
  await prisma.favorite.createMany({
    data: [
      { userId: supporterUser.id, animalId: createdAnimals[0].id },
      { userId: supporterUser.id, animalId: createdAnimals[4].id },
      { userId: supporterUser.id, animalId: createdAnimals[7].id },
    ],
  });

  // 7. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: 'NGO_VERIFIED',
        targetType: 'NGO',
        targetId: spNgo.id,
        details: 'CNPJ 11.222.333/0001-81 validado junto à Receita Federal e balancete 2026 homologado (Score: 98/100).',
      },
      {
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: 'NGO_VERIFIED',
        targetType: 'NGO',
        targetId: prNgo.id,
        details: 'CNPJ 23.456.789/0001-95 validado e alvará sanitário conferido para Refúgio Aucan Araucária.',
      },
      {
        actorId: spNgoUser.id,
        actorName: spNgoUser.name,
        actorRole: 'NGO',
        action: 'FINANCE_LEDGER_UPDATED',
        targetType: 'FINANCE',
        targetId: spNgo.id,
        details: 'Publicação do fechamento contábil de Outubro/2026 com 7 notas fiscais auditáveis.',
      },
      {
        actorId: prNgoUser.id,
        actorName: prNgoUser.name,
        actorRole: 'NGO',
        action: 'INQUIRY_STATUS_UPDATED',
        targetType: 'INQUIRY',
        targetId: prNgo.id,
        details: 'Solicitação de adoção do animal Thor da Serra aprovada após entrevista técnica.',
      },
    ],
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
