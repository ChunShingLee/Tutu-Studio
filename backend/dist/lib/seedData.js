import { config } from '../config.js';
import { allAdminPermissions, operatorPermissions } from './permissions.js';
export const demoUserId = 'local-user';
export const seedUsers = [
    {
        id: demoUserId,
        email: 'creator@tutu.local',
        nickname: '兔兔创作者',
        passwordHash: 'dev-user',
        planCode: 'FREE',
        quotaRemaining: 5,
        status: 'ACTIVE'
    },
    {
        id: 'studio-user',
        email: 'studio@tutu.local',
        nickname: '品牌工作室',
        passwordHash: 'studio-user',
        planCode: 'CREATOR',
        quotaRemaining: 72,
        status: 'ACTIVE'
    },
    {
        id: 'business-user',
        email: 'ops@tutu.local',
        nickname: '电商品牌运营',
        passwordHash: 'business-user',
        planCode: 'BUSINESS',
        quotaRemaining: 999,
        status: 'ACTIVE'
    }
];
export const seedAdminUsers = [
    {
        id: 'admin-root',
        email: config.adminEmail,
        nickname: '兔兔管理员',
        role: 'ADMIN',
        permissions: allAdminPermissions,
        status: 'ACTIVE'
    },
    {
        id: 'operator-content',
        email: config.adminOperatorEmail,
        nickname: '内容运营',
        role: 'OPERATOR',
        permissions: [...operatorPermissions],
        status: 'ACTIVE'
    }
];
export const seedCategories = [
    { id: 'ecommerce', name: '电商场景', sortOrder: 1 },
    { id: 'social', name: '社媒场景', sortOrder: 2 },
    { id: 'branding', name: '品牌设计', sortOrder: 3 },
    { id: 'portrait', name: '写真人像', sortOrder: 4 },
    { id: 'office', name: '办公提案', sortOrder: 5 },
    { id: 'illustration', name: '插画内容', sortOrder: 6 }
];
export const seedTemplates = [
    {
        id: 'product-main',
        title: '商品主图',
        categoryId: 'ecommerce',
        scene: '电商主图 / Banner',
        promptHint: '生成一张高转化电商商品主图，主体清晰，背景高级，适合平台投放',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['电商', '主图']
    },
    {
        id: 'detail-poster',
        title: '详情页海报',
        categoryId: 'ecommerce',
        scene: '商品详情 / 卖点表达',
        promptHint: '为商品生成一张详情页卖点海报，突出质感、参数与使用场景',
        isPremium: true,
        status: 'PUBLISHED',
        tags: ['详情页', '卖点']
    },
    {
        id: 'beauty-single',
        title: '美妆单品图',
        categoryId: 'ecommerce',
        scene: '护肤美妆 / 单品精修',
        promptHint: '生成一张美妆护肤单品视觉，瓶身清晰，光泽细腻，适合详情页和投放封面',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['美妆', '单品']
    },
    {
        id: 'food-menu',
        title: '餐饮上新海报',
        categoryId: 'ecommerce',
        scene: '餐饮新品 / 菜单宣传',
        promptHint: '生成一张餐饮上新海报，突出食物质感与食欲氛围，适合门店和社媒发布',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['餐饮', '海报']
    },
    {
        id: 'redbook-cover',
        title: '小红书封面',
        categoryId: 'social',
        scene: '种草内容 / 封面',
        promptHint: '生成一张小红书爆款封面，留出标题区域，画面年轻明亮',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['小红书', '封面']
    },
    {
        id: 'festival',
        title: '节日促销图',
        categoryId: 'social',
        scene: '节日营销 / 活动海报',
        promptHint: '生成一张节日促销海报，氛围热烈，品牌感强，可放促销文字',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['节日', '营销']
    },
    {
        id: 'social-nine-grid',
        title: '朋友圈九宫格',
        categoryId: 'social',
        scene: '节日传播 / 九宫格',
        promptHint: '生成一组适合社媒发布的九宫格视觉，风格统一，留出品牌和标题空间',
        isPremium: true,
        status: 'PUBLISHED',
        tags: ['社媒', '九宫格']
    },
    {
        id: 'live-cover',
        title: '直播预告封面',
        categoryId: 'social',
        scene: '直播宣传 / 倒计时',
        promptHint: '生成一张直播预告封面，突出人物、时间信息和活动利益点，适合社媒宣发',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['直播', '封面']
    },
    {
        id: 'logo',
        title: '品牌 Logo',
        categoryId: 'branding',
        scene: '品牌识别 / Logo',
        promptHint: '设计一个简洁、有记忆点、适合商业品牌使用的 Logo 视觉方案',
        isPremium: true,
        status: 'IN_REVIEW',
        tags: ['品牌', 'Logo']
    },
    {
        id: 'brand-poster',
        title: '品牌 KV 海报',
        categoryId: 'branding',
        scene: '品牌主视觉 / Campaign',
        promptHint: '生成一张品牌级主视觉海报，构图高级，氛围统一，适合品牌 campaign 使用',
        isPremium: true,
        status: 'PUBLISHED',
        tags: ['品牌', 'KV']
    },
    {
        id: 'packaging-proposal',
        title: '包装提案图',
        categoryId: 'branding',
        scene: '包装设计 / 提案展示',
        promptHint: '生成一张包装设计提案展示图，突出包装结构、材质和陈列氛围',
        isPremium: true,
        status: 'DRAFT',
        tags: ['包装', '提案']
    },
    {
        id: 'portrait-photo',
        title: 'AI 写真',
        categoryId: 'portrait',
        scene: '人物写真 / 商务形象',
        promptHint: '生成一张商业感强的人像写真，面部清晰，光影自然，适合头像或宣传物料',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['写真', '人像']
    },
    {
        id: 'kids-poster',
        title: '招生海报',
        categoryId: 'portrait',
        scene: '教育培训 / 招生活动',
        promptHint: '生成一张亲和力强的招生宣传海报，人物自然，配色轻快，适合教育机构使用',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['教育', '海报']
    },
    {
        id: 'ppt-illustration',
        title: 'PPT 配图',
        categoryId: 'office',
        scene: '办公汇报 / 概念图',
        promptHint: '生成一张商务汇报可用的概念配图，简洁高级，适合 PPT',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['PPT', '办公']
    },
    {
        id: 'report-cover',
        title: '方案封面',
        categoryId: 'office',
        scene: '提案汇报 / 封面页',
        promptHint: '生成一张适合商业方案或项目汇报的封面视觉，简洁高级并保留标题留白',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['封面', '提案']
    },
    {
        id: 'storybook-scene',
        title: '童话插画场景',
        categoryId: 'illustration',
        scene: '童话故事 / 场景插画',
        promptHint: '生成一张温暖梦幻的童话插画场景，光感柔和，适合内容封面或故事配图',
        isPremium: false,
        status: 'PUBLISHED',
        tags: ['插画', '童话']
    },
    {
        id: 'ip-character',
        title: 'IP 角色海报',
        categoryId: 'illustration',
        scene: '品牌 IP / 角色演绎',
        promptHint: '生成一张品牌 IP 角色海报，角色鲜明，动作自然，适合节庆和活动传播',
        isPremium: true,
        status: 'ARCHIVED',
        tags: ['IP', '角色']
    }
];
export const seedPlans = [
    {
        id: 'plan-free',
        code: 'FREE',
        name: '免费版',
        priceCents: 0,
        quotaDaily: 5,
        active: true,
        sortOrder: 1,
        features: ['基础模板', '每日 5 次生成']
    },
    {
        id: 'plan-creator',
        code: 'CREATOR',
        name: '创作者版',
        priceCents: 2990,
        quotaDaily: 100,
        active: true,
        sortOrder: 2,
        features: ['会员模板', '高优先级队列', '每日 100 次生成']
    },
    {
        id: 'plan-business',
        code: 'BUSINESS',
        name: '商业版',
        priceCents: 9990,
        quotaDaily: -1,
        active: true,
        sortOrder: 3,
        features: ['不限量额度', '团队运营支持', '审核加急']
    }
];
export const seedSystemSettings = [
    {
        key: 'modelConfig',
        value: {
            imageProvider: config.imageProvider,
            model: config.openaiImageModel,
            publicAssetBaseUrl: config.publicAssetBaseUrl
        }
    },
    {
        key: 'quotaPolicy',
        value: { freeDaily: 5, creatorDaily: 100, businessDaily: -1 }
    },
    {
        key: 'featureFlags',
        value: { community: true, payments: false, mockGeneration: false }
    }
];
export const seedSubscriptions = [
    {
        id: 'subscription-studio',
        userId: 'studio-user',
        planId: 'plan-creator',
        status: 'ACTIVE',
        startAt: '2026-05-01T00:00:00.000Z',
        renewalAt: '2026-06-01T00:00:00.000Z',
        autoRenew: true
    },
    {
        id: 'subscription-business',
        userId: 'business-user',
        planId: 'plan-business',
        status: 'ACTIVE',
        startAt: '2026-04-15T00:00:00.000Z',
        renewalAt: '2026-05-15T00:00:00.000Z',
        autoRenew: true
    }
];
export const seedOrders = [
    {
        id: 'order-creator-202605',
        orderNo: 'TUTU-20260501-0001',
        userId: 'studio-user',
        planId: 'plan-creator',
        amountCents: 2990,
        currency: 'CNY',
        status: 'PAID',
        channel: 'wechat_pay',
        paidAt: '2026-05-01T08:30:00.000Z',
        metadata: { invoiceRequested: false }
    },
    {
        id: 'order-business-202605',
        orderNo: 'TUTU-20260502-0002',
        userId: 'business-user',
        planId: 'plan-business',
        amountCents: 9990,
        currency: 'CNY',
        status: 'PENDING',
        channel: 'alipay',
        paidAt: null,
        metadata: { salesOwner: '兔兔管理员' }
    }
];
export const seedJobs = [
    {
        id: 'job-demo-success',
        userId: demoUserId,
        templateId: 'product-main',
        prompt: '生成一张春季护肤品电商主图，主体为玻璃瓶精华液，背景高级，突出补水感',
        enhancedPrompt: '生成一张春季护肤品电商主图，主体为玻璃瓶精华液，背景高级，突出补水感\n风格：商业摄影\n画幅比例：1:1',
        style: '商业摄影',
        aspectRatio: '1:1',
        status: 'SUCCEEDED',
        provider: config.imageProvider,
        providerJobId: 'provider-demo-success',
        imageUrl: `${config.publicAssetBaseUrl}/demo-success.png`,
        errorMessage: null,
        mode: 'TEXT_TO_IMAGE',
        createdAt: '2026-05-09T09:00:00.000Z',
        updatedAt: '2026-05-09T09:00:32.000Z',
        startedAt: '2026-05-09T09:00:01.000Z',
        completedAt: '2026-05-09T09:00:32.000Z'
    },
    {
        id: 'job-demo-failed',
        userId: 'studio-user',
        templateId: 'logo',
        prompt: '设计一个极简科技品牌 Logo，适合 SaaS 产品官网和 App 图标',
        enhancedPrompt: '设计一个极简科技品牌 Logo，适合 SaaS 产品官网和 App 图标\n风格：极简扁平\n画幅比例：1:1',
        style: '极简扁平',
        aspectRatio: '1:1',
        status: 'FAILED',
        provider: config.imageProvider,
        providerJobId: null,
        imageUrl: null,
        errorMessage: '上游模型服务响应超时，请稍后重试。',
        mode: 'TEXT_TO_IMAGE',
        createdAt: '2026-05-10T11:12:00.000Z',
        updatedAt: '2026-05-10T11:12:18.000Z',
        startedAt: '2026-05-10T11:12:02.000Z',
        completedAt: '2026-05-10T11:12:18.000Z'
    }
];
export const seedAssets = [
    {
        id: 'asset-demo-success',
        userId: demoUserId,
        jobId: 'job-demo-success',
        title: '商品主图成片',
        imageUrl: `${config.publicAssetBaseUrl}/demo-success.png`,
        prompt: '生成一张春季护肤品电商主图，主体为玻璃瓶精华液，背景高级，突出补水感',
        tags: ['电商', '主图', '护肤'],
        sourceImageUrl: null,
        mode: 'TEXT_TO_IMAGE',
        reviewStatus: 'APPROVED',
        reviewNotes: '画面可直接进入素材库'
    }
];
export const seedCommunityPosts = [
    {
        id: 'community-post-1',
        userId: demoUserId,
        title: '春季新品主图尝试',
        body: '第一次用兔兔视觉做美妆主图，整体质感不错，想再加强一点高光层次。',
        imageUrl: `${config.publicAssetBaseUrl}/demo-success.png`,
        reviewStatus: 'PENDING',
        reviewNotes: null
    },
    {
        id: 'community-post-2',
        userId: 'studio-user',
        title: '教育行业招生海报复盘',
        body: '这个模板留白挺好用，换不同校区文案都很稳，转化反馈也不错。',
        imageUrl: null,
        reviewStatus: 'APPROVED',
        reviewNotes: '内容合规'
    }
];
