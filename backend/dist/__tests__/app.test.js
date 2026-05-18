import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('bcryptjs', () => ({
    default: {
        compareSync: (password) => password === 'TutuAdmin123!' || password === 'TutuOperator123!'
    }
}));
vi.mock('../services/authService.js', () => ({
    findAdminByEmail: vi.fn(async (email) => {
        if (email === 'admin@tutu.local') {
            return {
                id: 'admin-root',
                email,
                nickname: '兔兔管理员',
                role: 'ADMIN',
                permissions: ['metrics:read', 'users:read'],
                status: 'ACTIVE',
                passwordHash: 'hash'
            };
        }
        if (email === 'operator@tutu.local') {
            return {
                id: 'operator-content',
                email,
                nickname: '内容运营',
                role: 'OPERATOR',
                permissions: ['metrics:read'],
                status: 'ACTIVE',
                passwordHash: 'hash'
            };
        }
        return null;
    }),
    getAdminProfileById: vi.fn(async (id) => {
        if (id === 'admin-root') {
            return {
                id,
                email: 'admin@tutu.local',
                nickname: '兔兔管理员',
                role: 'ADMIN',
                permissions: ['metrics:read', 'users:read'],
                status: 'ACTIVE'
            };
        }
        if (id === 'operator-content') {
            return {
                id,
                email: 'operator@tutu.local',
                nickname: '内容运营',
                role: 'OPERATOR',
                permissions: ['metrics:read'],
                status: 'ACTIVE'
            };
        }
        return null;
    }),
    touchAdminLastLogin: vi.fn(async () => undefined),
    getDemoUser: vi.fn(async () => ({
        id: 'local-user',
        email: 'creator@tutu.local',
        nickname: '兔兔创作者',
        planCode: 'FREE',
        quotaRemaining: 5,
        status: 'ACTIVE',
        createdAt: new Date('2026-05-11T00:00:00.000Z')
    }))
}));
vi.mock('../services/adminService.js', () => ({
    getAdminMetrics: vi.fn(async () => ({
        users: 3,
        admins: 2,
        jobsToday: 5,
        assets: 7,
        templates: 17,
        conversionRate: 0.66
    })),
    listUsers: vi.fn(async () => []),
    updateUser: vi.fn(async () => ({})),
    listAdminUsers: vi.fn(async () => []),
    listTemplates: vi.fn(async () => []),
    createTemplate: vi.fn(async () => ({})),
    updateTemplate: vi.fn(async () => ({})),
    updateTemplateStatus: vi.fn(async () => ({})),
    getAdminSettings: vi.fn(async () => ({
        imageProvider: 'mock',
        model: 'gpt-image-1',
        publicAssetBaseUrl: 'http://127.0.0.1:3000/static',
        quotaPolicy: { freeDaily: 5, creatorDaily: 100, businessDaily: -1 },
        featureFlags: { community: true, payments: false, mockGeneration: false }
    })),
    updateAdminSettings: vi.fn(async () => ({})),
    listAuditLogs: vi.fn(async () => []),
    listJobs: vi.fn(async () => []),
    getContentStudioPageData: vi.fn(async () => ({
        stats: { pendingReviews: 0, draftTemplates: 0, inReviewTemplates: 0, premiumRatio: 0 },
        queue: [],
        assets: [],
        posts: [],
        latestTemplates: [],
        categoryBreakdown: []
    })),
    getJobCommandPageData: vi.fn(async () => ({
        stats: { queued: 0, running: 0, failed: 0, successRate: 100 },
        failedJobs: [],
        activeJobs: [],
        latestAssets: [],
        providerMix: [],
        timeline: { successLast24h: 0, failedLast24h: 0, canceledLast24h: 0 }
    })),
    getRevenueOpsPageData: vi.fn(async () => ({
        stats: { activeSubscriptions: 0, pendingOrders: 0, totalPaidCents: 0, conversionRate: 0 },
        planMix: [],
        followUps: [],
        paidOrders: [],
        subscriptions: []
    })),
    runJobAction: vi.fn(async () => ({})),
    listPlans: vi.fn(async () => []),
    createPlan: vi.fn(async () => ({})),
    updatePlan: vi.fn(async () => ({})),
    listSubscriptions: vi.fn(async () => []),
    updateSubscription: vi.fn(async () => ({})),
    listPaymentOrders: vi.fn(async () => []),
    updatePaymentOrder: vi.fn(async () => ({})),
    listContentQueue: vi.fn(async () => ({ queue: [], reviews: [], assets: [], posts: [], templates: [] })),
    reviewContentItem: vi.fn(async () => ({}))
}));
describe('tutu vision backend', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('returns health status', async () => {
        const { buildApp } = await import('../app.js');
        const app = await buildApp({ logger: false, skipBootstrap: true });
        const response = await app.inject({ method: 'GET', url: '/api/health' });
        expect(response.statusCode).toBe(200);
        await app.close();
    });
    it('protects admin metrics without token', async () => {
        const { buildApp } = await import('../app.js');
        const app = await buildApp({ logger: false, skipBootstrap: true });
        const response = await app.inject({ method: 'GET', url: '/api/admin/metrics' });
        expect(response.statusCode).toBe(401);
        await app.close();
    });
    it('logs in admin and reads metrics', async () => {
        const { buildApp } = await import('../app.js');
        const app = await buildApp({ logger: false, skipBootstrap: true });
        const login = await app.inject({
            method: 'POST',
            url: '/api/admin/auth/login',
            payload: { email: 'admin@tutu.local', password: 'TutuAdmin123!' }
        });
        expect(login.statusCode).toBe(200);
        const token = login.json().token;
        const metrics = await app.inject({
            method: 'GET',
            url: '/api/admin/metrics',
            headers: { authorization: `Bearer ${token}` }
        });
        expect(metrics.statusCode).toBe(200);
        expect(metrics.json()).toHaveProperty('templates');
        await app.close();
    });
    it('allows operator to read metrics but blocks user management', async () => {
        const { buildApp } = await import('../app.js');
        const app = await buildApp({ logger: false, skipBootstrap: true });
        const login = await app.inject({
            method: 'POST',
            url: '/api/admin/auth/login',
            payload: { email: 'operator@tutu.local', password: 'TutuOperator123!' }
        });
        expect(login.statusCode).toBe(200);
        const token = login.json().token;
        const metrics = await app.inject({
            method: 'GET',
            url: '/api/admin/metrics',
            headers: { authorization: `Bearer ${token}` }
        });
        const users = await app.inject({
            method: 'GET',
            url: '/api/admin/users',
            headers: { authorization: `Bearer ${token}` }
        });
        expect(metrics.statusCode).toBe(200);
        expect(users.statusCode).toBe(403);
        await app.close();
    });
});
