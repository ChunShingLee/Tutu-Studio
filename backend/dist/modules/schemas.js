import { z } from 'zod';
export const generationSchema = z.object({
    prompt: z.string().min(1).max(2000),
    templateId: z.string().min(1).nullable().optional(),
    style: z.string().min(1).max(120).default('商业摄影'),
    aspectRatio: z.string().min(1).max(20).default('1:1'),
    referenceImageUrl: z.string().url().nullable().optional(),
    referenceImageBase64: z.string().min(1).nullable().optional(),
    mode: z.enum(['textToImage', 'imageToImage', 'localEdit']).default('textToImage'),
    editInstruction: z.string().max(1000).nullable().optional(),
    editArea: z.string().max(120).nullable().optional(),
    editStrength: z.string().max(120).nullable().optional()
}).superRefine((body, ctx) => {
    const needsReference = body.mode === 'imageToImage' || body.mode === 'localEdit';
    if (needsReference && !body.referenceImageUrl && !body.referenceImageBase64) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['referenceImageUrl'],
            message: 'reference image is required for image-to-image and local editing'
        });
    }
    if (body.mode === 'localEdit' && !body.editInstruction?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['editInstruction'],
            message: 'edit instruction is required for local editing'
        });
    }
});
export const adminLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(200)
}).strict();
export const adminTemplateCreateSchema = z.object({
    title: z.string().min(1).max(80),
    categoryId: z.string().min(1).max(50),
    scene: z.string().min(1).max(120),
    promptHint: z.string().min(1).max(1000),
    isPremium: z.boolean().default(false),
    status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    tags: z.array(z.string().min(1).max(24)).max(10).default([])
}).strict();
export const adminTemplateUpdateSchema = z.object({
    title: z.string().min(1).max(80).optional(),
    categoryId: z.string().min(1).max(50).optional(),
    scene: z.string().min(1).max(120).optional(),
    promptHint: z.string().min(1).max(1000).optional(),
    isPremium: z.boolean().optional(),
    status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
    tags: z.array(z.string().min(1).max(24)).max(10).optional()
}).strict();
export const adminTemplateStatusSchema = z.object({
    status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'])
}).strict();
export const adminUserUpdateSchema = z.object({
    nickname: z.string().min(1).max(40).optional(),
    planCode: z.enum(['FREE', 'CREATOR', 'BUSINESS']).optional(),
    quotaRemaining: z.number().int().min(0).max(999999).optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED']).optional()
}).strict();
export const adminSettingsUpdateSchema = z.object({
    imageProvider: z.string().min(1).max(80),
    model: z.string().min(1).max(120),
    publicAssetBaseUrl: z.string().url(),
    quotaPolicy: z.object({
        freeDaily: z.number().int().min(0).max(999999),
        creatorDaily: z.number().int().min(0).max(999999),
        businessDaily: z.number().int().min(-1).max(999999)
    }).strict(),
    featureFlags: z.object({
        community: z.boolean(),
        payments: z.boolean(),
        mockGeneration: z.boolean()
    }).strict()
}).strict();
export const adminJobActionSchema = z.object({
    action: z.enum(['retry', 'cancel'])
}).strict();
export const adminPlanCreateSchema = z.object({
    code: z.string().min(2).max(32).regex(/^[A-Z0-9_]+$/),
    name: z.string().min(1).max(40),
    priceCents: z.number().int().min(0).max(99999999),
    quotaDaily: z.number().int().min(-1).max(999999),
    active: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(999),
    features: z.array(z.string().min(1).max(80)).max(20).default([])
}).strict();
export const adminPlanUpdateSchema = z.object({
    name: z.string().min(1).max(40).optional(),
    priceCents: z.number().int().min(0).max(99999999).optional(),
    quotaDaily: z.number().int().min(-1).max(999999).optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(999).optional(),
    features: z.array(z.string().min(1).max(80)).max(20).optional()
}).strict();
export const adminSubscriptionUpdateSchema = z.object({
    status: z.enum(['TRIALING', 'ACTIVE', 'PAUSED', 'CANCELED', 'EXPIRED']).optional(),
    renewalAt: z.string().datetime().nullable().optional(),
    endAt: z.string().datetime().nullable().optional(),
    autoRenew: z.boolean().optional()
}).strict();
export const adminPaymentOrderUpdateSchema = z.object({
    status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELED']).optional(),
    channel: z.string().min(1).max(40).nullable().optional(),
    paidAt: z.string().datetime().nullable().optional()
}).strict();
export const adminContentReviewSchema = z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED']),
    summary: z.string().max(300).nullable().optional()
}).strict();
