import bcrypt from 'bcryptjs';
import { config } from '../config.js';
export const seedUser = {
    id: 'local-user',
    email: 'creator@tutu.local',
    nickname: '兔兔创作者',
    plan: '免费版',
    dailyQuotaRemaining: 5,
    role: 'ADMIN'
};
export const categories = [
    { id: 'ecommerce', name: '电商场景' },
    { id: 'social', name: '社媒场景' },
    { id: 'branding', name: '品牌设计' },
    { id: 'portrait', name: '写真人像' },
    { id: 'office', name: '办公提案' },
    { id: 'illustration', name: '插画内容' }
];
export const templates = [
    { id: 'product-main', title: '商品主图', categoryId: 'ecommerce', scene: '电商主图 / Banner', promptHint: '生成一张高转化电商商品主图，主体清晰，背景高级，适合平台投放', isPremium: false },
    { id: 'detail-poster', title: '详情页海报', categoryId: 'ecommerce', scene: '商品详情 / 卖点表达', promptHint: '为商品生成一张详情页卖点海报，突出质感、参数与使用场景', isPremium: true },
    { id: 'beauty-single', title: '美妆单品图', categoryId: 'ecommerce', scene: '护肤美妆 / 单品精修', promptHint: '生成一张美妆护肤单品视觉，瓶身清晰，光泽细腻，适合详情页和投放封面', isPremium: false },
    { id: 'food-menu', title: '餐饮上新海报', categoryId: 'ecommerce', scene: '餐饮新品 / 菜单宣传', promptHint: '生成一张餐饮上新海报，突出食物质感与食欲氛围，适合门店和社媒发布', isPremium: false },
    { id: 'redbook-cover', title: '小红书封面', categoryId: 'social', scene: '种草内容 / 封面', promptHint: '生成一张小红书爆款封面，留出标题区域，画面年轻明亮', isPremium: false },
    { id: 'festival', title: '节日促销图', categoryId: 'social', scene: '节日营销 / 活动海报', promptHint: '生成一张节日促销海报，氛围热烈，品牌感强，可放促销文字', isPremium: false },
    { id: 'social-nine-grid', title: '朋友圈九宫格', categoryId: 'social', scene: '节日传播 / 九宫格', promptHint: '生成一组适合社媒发布的九宫格视觉，风格统一，留出品牌和标题空间', isPremium: true },
    { id: 'live-cover', title: '直播预告封面', categoryId: 'social', scene: '直播宣传 / 倒计时', promptHint: '生成一张直播预告封面，突出人物、时间信息和活动利益点，适合社媒宣发', isPremium: false },
    { id: 'logo', title: '品牌 Logo', categoryId: 'branding', scene: '品牌识别 / Logo', promptHint: '设计一个简洁、有记忆点、适合商业品牌使用的 Logo 视觉方案', isPremium: true },
    { id: 'brand-poster', title: '品牌 KV 海报', categoryId: 'branding', scene: '品牌主视觉 / Campaign', promptHint: '生成一张品牌级主视觉海报，构图高级，氛围统一，适合品牌 campaign 使用', isPremium: true },
    { id: 'packaging-proposal', title: '包装提案图', categoryId: 'branding', scene: '包装设计 / 提案展示', promptHint: '生成一张包装设计提案展示图，突出包装结构、材质和陈列氛围', isPremium: true },
    { id: 'portrait-photo', title: 'AI 写真', categoryId: 'portrait', scene: '人物写真 / 商务形象', promptHint: '生成一张商业感强的人像写真，面部清晰，光影自然，适合头像或宣传物料', isPremium: false },
    { id: 'kids-poster', title: '招生海报', categoryId: 'portrait', scene: '教育培训 / 招生活动', promptHint: '生成一张亲和力强的招生宣传海报，人物自然，配色轻快，适合教育机构使用', isPremium: false },
    { id: 'ppt-illustration', title: 'PPT 配图', categoryId: 'office', scene: '办公汇报 / 概念图', promptHint: '生成一张商务汇报可用的概念配图，简洁高级，适合 PPT', isPremium: false },
    { id: 'report-cover', title: '方案封面', categoryId: 'office', scene: '提案汇报 / 封面页', promptHint: '生成一张适合商业方案或项目汇报的封面视觉，简洁高级并保留标题留白', isPremium: false },
    { id: 'storybook-scene', title: '童话插画场景', categoryId: 'illustration', scene: '童话故事 / 场景插画', promptHint: '生成一张温暖梦幻的童话插画场景，光感柔和，适合内容封面或故事配图', isPremium: false },
    { id: 'ip-character', title: 'IP 角色海报', categoryId: 'illustration', scene: '品牌 IP / 角色演绎', promptHint: '生成一张品牌 IP 角色海报，角色鲜明，动作自然，适合节庆和活动传播', isPremium: true }
];
export const assets = [];
export const jobs = [];
export const adminUsers = [
    {
        id: 'admin-root',
        email: config.adminEmail,
        nickname: '兔兔管理员',
        role: 'ADMIN',
        permissions: ['users:read', 'templates:read', 'templates:write', 'settings:read', 'metrics:read'],
        status: 'active',
        passwordHash: bcrypt.hashSync(config.adminPassword, 10),
        createdAt: new Date().toISOString()
    },
    {
        id: 'operator-content',
        email: config.adminOperatorEmail,
        nickname: '内容运营',
        role: 'OPERATOR',
        permissions: ['templates:read', 'templates:write', 'metrics:read'],
        status: 'active',
        passwordHash: bcrypt.hashSync(config.adminOperatorPassword, 10),
        createdAt: new Date().toISOString()
    }
];
export const systemSettings = {
    imageProvider: config.imageProvider,
    model: config.openaiImageModel,
    quotaPolicy: { freeDaily: 5, creatorDaily: 100, businessDaily: -1 },
    featureFlags: { community: true, payments: false, mockGeneration: false }
};
export const auditLogs = [];
