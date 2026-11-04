import { z } from 'zod';

export const userRoleSchema = z.enum(['ADMIN', 'NGO', 'SUPPORTER']);
export const userStatusSchema = z.enum(['ACTIVE', 'SUSPENDED']);
export const ngoStatusSchema = z.enum(['APPROVED', 'PENDING', 'SUSPENDED']);

export const authSchema = z.object({
  action: z.enum(['login', 'register']).optional(),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(['NGO', 'SUPPORTER']).optional(),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().length(2).optional(),
});

const revenueCategories = ['DONATIONS', 'GRANTS', 'EVENTS', 'PARTNERSHIPS'] as const;
const expenseCategories = ['VETERINARY', 'FOOD', 'FACILITY', 'ADMINISTRATION', 'RESCUE_OPS'] as const;

const financeEntryFields = z.object({
  ngoId: z.string().min(1).optional(),
  type: z.enum(['REVENUE', 'EXPENSE']),
  category: z.string().min(1),
  titlePt: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().max(200).optional(),
  amount: z.coerce.number().finite().positive(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  documentRef: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const financeEntrySchema = financeEntryFields.superRefine((value, context) => {
  const allowed = value.type === 'REVENUE' ? revenueCategories : expenseCategories;
  if (!allowed.includes(value.category as never)) {
    context.addIssue({ code: 'custom', path: ['category'], message: 'Categoria incompatível com o tipo.' });
  }
});

export const financeUpdateSchema = financeEntryFields.partial().extend({
  id: z.string().min(1),
});

export const initialBalanceSchema = z.object({
  action: z.literal('updateInitialBalance'),
  initialBalance: z.coerce.number().finite().nonnegative(),
  ngoId: z.string().min(1).optional(),
});

export const adminPatchSchema = z.object({
  target: z.enum(['NGO', 'USER']),
  id: z.string().min(1),
  status: z.string().optional(),
  verifiedScore: z.coerce.number().int().min(0).max(100).optional(),
  role: z.string().optional(),
}).superRefine((value, context) => {
  if (value.target === 'NGO' && value.status && !ngoStatusSchema.safeParse(value.status).success) {
    context.addIssue({ code: 'custom', path: ['status'], message: 'Status de ONG inválido.' });
  }
  if (value.target === 'USER' && value.status && !userStatusSchema.safeParse(value.status).success) {
    context.addIssue({ code: 'custom', path: ['status'], message: 'Status de usuário inválido.' });
  }
  if (value.target === 'USER' && value.role && !userRoleSchema.safeParse(value.role).success) {
    context.addIssue({ code: 'custom', path: ['role'], message: 'Perfil de usuário inválido.' });
  }
});
