import bcrypt from 'bcryptjs';
import AdminJS from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import { Database, Resource, getModelByName } from '@adminjs/prisma';
import { config } from '../config.js';
import { adminPermissions } from '../lib/permissions.js';
import { prisma } from '../lib/prisma.js';
import { findAdminByEmail, touchAdminLastLogin } from '../services/authService.js';
import { getContentStudioPageData, getJobCommandPageData, getAdminMetrics, getRevenueOpsPageData, listAuditLogs, listContentQueue, listJobs, reviewContentItem, reviewTemplatesBulk, runJobAction, updatePaymentOrder, updateTemplateStatus, updateUser } from '../services/adminService.js';
import { componentLoader, contentStudioComponentId, dashboardComponentId, jobCommandComponentId, revenueOpsComponentId } from './components.js';
AdminJS.registerAdapter({ Database, Resource });
const adminRootPath = '/admin';
export async function registerAdminPanel(app) {
    const admin = new AdminJS({
        rootPath: adminRootPath,
        componentLoader,
        dashboard: {
            component: dashboardComponentId,
            handler: buildDashboardData
        },
        pages: {
            contentStudio: {
                component: contentStudioComponentId,
                icon: 'Layout',
                handler: async (request, _response, context) => {
                    if (request.method === 'post' && request.payload?.action === 'bulkReviewTemplates') {
                        const ids = Array.isArray(request.payload?.ids) ? request.payload.ids : [];
                        const status = request.payload?.status;
                        const summary = request.payload?.summary;
                        if (!status) {
                            return {
                                ...(await getContentStudioPageData()),
                                notice: {
                                    message: '缺少批量审核状态',
                                    type: 'error'
                                }
                            };
                        }
                        const result = await reviewTemplatesBulk(ids, { status, summary }, context.currentAdmin?.id);
                        return {
                            ...(await getContentStudioPageData()),
                            notice: {
                                message: `已完成 ${result.reviewedCount} 个模板的批量审核`,
                                type: 'success'
                            }
                        };
                    }
                    return getContentStudioPageData();
                }
            },
            jobCommand: {
                component: jobCommandComponentId,
                icon: 'Activity',
                handler: async (request, _response, context) => {
                    if (request.method === 'post' && request.payload?.action === 'retryJobs') {
                        const ids = Array.isArray(request.payload?.ids) ? request.payload.ids : [];
                        await Promise.all(ids.map((id) => runJobAction(id, 'retry', context.currentAdmin?.id)));
                        return {
                            ...(await getJobCommandPageData()),
                            notice: {
                                message: `已重试 ${ids.length} 个任务`,
                                type: 'success'
                            }
                        };
                    }
                    if (request.method === 'post' && request.payload?.action === 'cancelJobs') {
                        const ids = Array.isArray(request.payload?.ids) ? request.payload.ids : [];
                        await Promise.all(ids.map((id) => runJobAction(id, 'cancel', context.currentAdmin?.id)));
                        return {
                            ...(await getJobCommandPageData()),
                            notice: {
                                message: `已取消 ${ids.length} 个任务`,
                                type: 'success'
                            }
                        };
                    }
                    return getJobCommandPageData();
                }
            },
            revenueOps: {
                component: revenueOpsComponentId,
                icon: 'CreditCard',
                handler: getRevenueOpsPageData
            }
        },
        branding: {
            companyName: '兔兔视觉运营后台',
            withMadeWithLove: false,
            theme: {
                colors: {
                    primary100: '#FF6B35',
                    primary80: '#FF8357',
                    accent: '#6C5CE7',
                    sidebar: '#FFFDFB',
                    container: '#FFFFFF',
                    bg: '#F8F9F9',
                    hoverBg: '#FFF4EF',
                    filterBg: '#FFF8F3',
                    success: '#007D7F',
                    warning: '#A14F17',
                    info: '#3040D6'
                }
            }
        },
        locale: {
            language: 'zh-CN',
            translations: {
                'zh-CN': {
                    labels: {
                        navigation: '资源导航',
                        pages: '运营工作台',
                        User: '创作者用户',
                        AdminUser: '后台账号',
                        TemplateCategory: '模板分类',
                        Template: '模板',
                        GenerationJob: '生成任务',
                        Asset: '素材资产',
                        CommunityPost: '社区内容',
                        SubscriptionPlan: '订阅套餐',
                        Subscription: '订阅关系',
                        PaymentOrder: '支付订单',
                        ContentReview: '审核记录',
                        SystemSetting: '系统配置',
                        AuditLog: '审计日志'
                    },
                    pages: {
                        contentStudio: '内容中台',
                        jobCommand: '任务指挥台',
                        revenueOps: '商业化中台'
                    },
                    buttons: {
                        save: '保存',
                        delete: '删除',
                        filter: '筛选',
                        applyChanges: '应用修改',
                        resetFilter: '重置筛选',
                        login: '登录'
                    },
                    messages: {
                        successfullyUpdated: '更新成功',
                        successfullyCreated: '创建成功',
                        successfullyDeleted: '删除成功'
                    },
                    resources: buildResourceTranslations()
                }
            }
        },
        resources: buildResources()
    });
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
        await admin.watch();
    }
    await AdminJSFastify.buildAuthenticatedRouter(admin, {
        cookieName: 'tutu-adminjs',
        cookiePassword: config.adminCookieSecret,
        authenticate: async (email, password) => authenticateAdmin(email, password)
    }, app, {
        cookie: {
            secure: false,
            httpOnly: true
        }
    });
}
async function buildDashboardData() {
    const [metrics, jobs, contentQueue, auditLogs, revenue] = await Promise.all([
        getAdminMetrics(),
        listJobs(),
        listContentQueue(),
        listAuditLogs(),
        getRevenueOpsPageData()
    ]);
    const spotlights = [
        {
            id: 'review-queue',
            title: '待审核内容',
            subtitle: '内容中台',
            body: `当前共有 ${contentQueue.queue.length} 个待处理审核项，建议优先清理模板和社区内容。`,
            badge: `${contentQueue.queue.length} 项`,
            tone: contentQueue.queue.length > 0 ? 'warning' : 'success'
        },
        {
            id: 'failed-jobs',
            title: '异常任务',
            subtitle: '任务指挥台',
            body: `最近任务里有 ${jobs.filter(job => job.status === 'FAILED').length} 个失败项，需要决定重试还是取消。`,
            badge: `${jobs.filter(job => job.status === 'FAILED').length} 个失败`,
            tone: jobs.some(job => job.status === 'FAILED') ? 'error' : 'success'
        },
        {
            id: 'pending-orders',
            title: '待支付订单',
            subtitle: '商业化中台',
            body: `当前还有 ${revenue.stats.pendingOrders} 个待支付订单，建议尽快跟进收款。`,
            badge: `${revenue.stats.pendingOrders} 单`,
            tone: revenue.stats.pendingOrders > 0 ? 'warning' : 'success'
        }
    ];
    return {
        metrics,
        recentJobs: jobs.slice(0, 6).map(job => ({
            id: job.id,
            prompt: job.prompt,
            userId: job.userId,
            userNickname: job.userNickname,
            templateTitle: job.templateTitle,
            statusLabel: statusLabel(job.status),
            tone: statusTone(job.status),
            createdAtLabel: formatDate(job.createdAt)
        })),
        reviewQueue: (contentQueue.queue || []).slice(0, 6).map(item => ({
            entityType: item.entityType,
            entityId: item.entityId,
            entityTypeLabel: entityTypeLabel(item.entityType),
            title: item.title,
            summary: item.summary,
            subtitle: item.subtitle,
            statusLabel: statusLabel(item.status),
            tone: statusTone(item.status),
            updatedAtLabel: formatDate(item.updatedAt)
        })),
        auditLogs: auditLogs.slice(0, 6).map(log => ({
            id: log.id,
            actionLabel: log.action,
            actorNickname: log.actorNickname || log.actorId,
            entityLabel: `${log.entity || 'system'} / ${log.entityId || log.targetId || '-'}`,
            createdAtLabel: formatDate(log.createdAt)
        })),
        spotlights
    };
}
function buildResources() {
    return [
        {
            resource: { model: getModelByName('User'), client: prisma },
            options: {
                titleProperty: 'nickname',
                navigation: { name: '用户与会员', icon: 'Users' },
                sort: { sortBy: 'createdAt', direction: 'desc' },
                listProperties: ['nickname', 'email', 'planCode', 'quotaRemaining', 'status', 'createdAt'],
                filterProperties: ['email', 'nickname', 'planCode', 'status'],
                editProperties: ['nickname', 'planCode', 'quotaRemaining', 'status'],
                showProperties: ['id', 'nickname', 'email', 'planCode', 'quotaRemaining', 'status', 'createdAt', 'updatedAt'],
                properties: {
                    passwordHash: { isVisible: false }
                },
                actions: {
                    new: hiddenAction(),
                    delete: hiddenAction(),
                    bulkDelete: hiddenAction(),
                    list: guardedAction(adminPermissions.usersRead),
                    show: guardedAction(adminPermissions.usersRead),
                    edit: guardedAction(adminPermissions.usersWrite),
                    suspendUser: makeUserStatusAction('suspendUser', '暂停账号', 'Pause', 'info', '确认暂停这个创作者账号？', 'SUSPENDED'),
                    activateUser: makeUserStatusAction('activateUser', '恢复账号', 'Play', 'success', '确认恢复这个创作者账号？', 'ACTIVE')
                }
            }
        },
        {
            resource: { model: getModelByName('AdminUser'), client: prisma },
            options: {
                titleProperty: 'nickname',
                navigation: { name: '系统与权限', icon: 'Shield' },
                listProperties: ['nickname', 'email', 'role', 'permissions', 'status', 'lastLoginAt'],
                filterProperties: ['email', 'nickname', 'role', 'status'],
                editProperties: ['nickname', 'permissions', 'status'],
                showProperties: ['id', 'nickname', 'email', 'role', 'permissions', 'status', 'lastLoginAt', 'createdAt', 'updatedAt'],
                properties: {
                    passwordHash: { isVisible: false }
                },
                actions: {
                    new: hiddenAction(),
                    delete: hiddenAction(),
                    bulkDelete: hiddenAction(),
                    list: guardedAction(adminPermissions.usersRead),
                    show: guardedAction(adminPermissions.usersRead),
                    edit: guardedAction(adminPermissions.usersWrite)
                }
            }
        },
        {
            resource: { model: getModelByName('TemplateCategory'), client: prisma },
            options: {
                titleProperty: 'name',
                navigation: { name: '内容运营', icon: 'Layout' },
                listProperties: ['id', 'name', 'sortOrder'],
                editProperties: ['id', 'name', 'sortOrder'],
                filterProperties: ['id', 'name'],
                actions: categoryActions()
            }
        },
        {
            resource: { model: getModelByName('Template'), client: prisma },
            options: {
                titleProperty: 'title',
                navigation: { name: '内容运营', icon: 'Layout' },
                sort: { sortBy: 'updatedAt', direction: 'desc' },
                listProperties: ['title', 'category', 'scene', 'status', 'isPremium', 'updatedAt'],
                filterProperties: ['title', 'category', 'scene', 'status', 'isPremium'],
                editProperties: ['title', 'category', 'scene', 'promptHint', 'isPremium', 'status', 'tags'],
                showProperties: ['id', 'title', 'category', 'scene', 'promptHint', 'isPremium', 'status', 'tags', 'createdAt', 'updatedAt'],
                actions: {
                    list: guardedAction(adminPermissions.templatesRead),
                    show: guardedAction(adminPermissions.templatesRead),
                    new: guardedAction(adminPermissions.templatesWrite),
                    edit: guardedAction(adminPermissions.templatesWrite),
                    delete: hiddenAction(),
                    bulkDelete: hiddenAction(),
                    publishTemplate: makeTemplateStatusAction('publishTemplate', '发布模板', 'CheckCircle', 'success', '确认发布这个模板？', 'PUBLISHED'),
                    archiveTemplate: makeTemplateStatusAction('archiveTemplate', '归档模板', 'Archive', 'danger', '确认归档这个模板？', 'ARCHIVED'),
                    sendToReview: makeTemplateStatusAction('sendToReview', '送审', 'Send', 'primary', '确认把这个模板送去审核？', 'IN_REVIEW')
                }
            }
        },
        {
            resource: { model: getModelByName('ContentReview'), client: prisma },
            options: {
                titleProperty: 'entityId',
                navigation: { name: '内容运营', icon: 'Shield' },
                listProperties: ['entityType', 'entityId', 'status', 'reviewerAdmin', 'updatedAt'],
                filterProperties: ['entityType', 'status', 'reviewerAdmin'],
                editProperties: [],
                actions: readOnlyActions(adminPermissions.reviewsRead)
            }
        },
        {
            resource: { model: getModelByName('Asset'), client: prisma },
            options: {
                titleProperty: 'title',
                navigation: { name: '内容运营', icon: 'Image' },
                listProperties: ['title', 'user', 'reviewStatus', 'createdAt'],
                filterProperties: ['title', 'user', 'reviewStatus'],
                editProperties: [],
                actions: {
                    ...readOnlyActions(adminPermissions.reviewsRead),
                    approveAsset: makeContentReviewAction('approveAsset', '通过', 'CheckCircle', 'success', '确认通过这个素材？', 'ASSET', 'APPROVED'),
                    rejectAsset: makeContentReviewAction('rejectAsset', '拒绝', 'XCircle', 'danger', '确认拒绝这个素材？', 'ASSET', 'REJECTED'),
                    requestAssetChanges: makeContentReviewAction('requestAssetChanges', '退回修改', 'RotateCcw', 'info', '确认退回这个素材要求修改？', 'ASSET', 'CHANGES_REQUESTED')
                }
            }
        },
        {
            resource: { model: getModelByName('CommunityPost'), client: prisma },
            options: {
                titleProperty: 'title',
                navigation: { name: '内容运营', icon: 'MessageSquare' },
                listProperties: ['title', 'user', 'reviewStatus', 'updatedAt'],
                filterProperties: ['title', 'user', 'reviewStatus'],
                editProperties: [],
                actions: {
                    ...readOnlyActions(adminPermissions.reviewsRead),
                    approvePost: makeContentReviewAction('approvePost', '通过', 'CheckCircle', 'success', '确认通过这条社区内容？', 'COMMUNITY_POST', 'APPROVED'),
                    rejectPost: makeContentReviewAction('rejectPost', '拒绝', 'XCircle', 'danger', '确认拒绝这条社区内容？', 'COMMUNITY_POST', 'REJECTED'),
                    requestPostChanges: makeContentReviewAction('requestPostChanges', '退回修改', 'RotateCcw', 'info', '确认退回这条社区内容要求修改？', 'COMMUNITY_POST', 'CHANGES_REQUESTED')
                }
            }
        },
        {
            resource: { model: getModelByName('GenerationJob'), client: prisma },
            options: {
                titleProperty: 'id',
                navigation: { name: '生产运营', icon: 'Activity' },
                sort: { sortBy: 'createdAt', direction: 'desc' },
                listProperties: ['id', 'user', 'template', 'status', 'provider', 'createdAt'],
                filterProperties: ['user', 'template', 'status', 'provider'],
                editProperties: [],
                actions: {
                    ...readOnlyActions(adminPermissions.jobsRead),
                    retryJob: makeJobAction('retryJob', '重试任务', 'RefreshCcw', 'success', '确认重新入队这个任务？', 'retry'),
                    cancelJob: makeJobAction('cancelJob', '取消任务', 'XCircle', 'danger', '确认取消这个任务？', 'cancel')
                }
            }
        },
        {
            resource: { model: getModelByName('SubscriptionPlan'), client: prisma },
            options: {
                titleProperty: 'name',
                navigation: { name: '商业化', icon: 'CreditCard' },
                listProperties: ['code', 'name', 'priceCents', 'quotaDaily', 'active', 'sortOrder'],
                filterProperties: ['code', 'name', 'active'],
                editProperties: ['code', 'name', 'priceCents', 'quotaDaily', 'active', 'sortOrder', 'features'],
                actions: commerceCrudActions()
            }
        },
        {
            resource: { model: getModelByName('Subscription'), client: prisma },
            options: {
                titleProperty: 'id',
                navigation: { name: '商业化', icon: 'CreditCard' },
                listProperties: ['user', 'plan', 'status', 'renewalAt', 'autoRenew'],
                filterProperties: ['user', 'plan', 'status'],
                editProperties: ['plan', 'status', 'renewalAt', 'endAt', 'autoRenew'],
                actions: commerceCrudActions()
            }
        },
        {
            resource: { model: getModelByName('PaymentOrder'), client: prisma },
            options: {
                titleProperty: 'orderNo',
                navigation: { name: '商业化', icon: 'CreditCard' },
                listProperties: ['orderNo', 'user', 'plan', 'amountCents', 'status', 'paidAt'],
                filterProperties: ['orderNo', 'user', 'plan', 'status', 'channel'],
                editProperties: ['status', 'channel', 'paidAt'],
                actions: {
                    ...commerceCrudActions(),
                    markPaid: makePaymentOrderAction('markPaid', '标记已支付', 'CheckCircle', 'success', '确认将订单标记为已支付？', 'PAID'),
                    markRefunded: makePaymentOrderAction('markRefunded', '标记已退款', 'RotateCcw', 'info', '确认将订单标记为已退款？', 'REFUNDED')
                }
            }
        },
        {
            resource: { model: getModelByName('SystemSetting'), client: prisma },
            options: {
                titleProperty: 'key',
                navigation: { name: '系统与权限', icon: 'Settings' },
                listProperties: ['key', 'updatedAt'],
                filterProperties: ['key'],
                editProperties: ['value'],
                showProperties: ['key', 'value', 'updatedAt'],
                actions: {
                    ...readOnlyActions(adminPermissions.settingsRead),
                    new: hiddenAction(),
                    edit: guardedAction(adminPermissions.settingsWrite)
                }
            }
        },
        {
            resource: { model: getModelByName('AuditLog'), client: prisma },
            options: {
                titleProperty: 'action',
                navigation: { name: '系统与权限', icon: 'FileText' },
                listProperties: ['createdAt', 'action', 'entity', 'entityId', 'actorAdmin'],
                filterProperties: ['action', 'entity', 'actorAdmin'],
                editProperties: [],
                actions: readOnlyActions(adminPermissions.auditsRead)
            }
        }
    ];
}
function buildResourceTranslations() {
    return {
        User: {
            labels: { User: '创作者用户' },
            properties: {
                nickname: '昵称',
                email: '邮箱',
                planCode: '套餐',
                quotaRemaining: '剩余额度',
                status: '状态',
                createdAt: '创建时间',
                updatedAt: '更新时间'
            }
        },
        AdminUser: {
            labels: { AdminUser: '后台账号' },
            properties: {
                nickname: '昵称',
                email: '邮箱',
                role: '角色',
                permissions: '权限',
                status: '状态',
                lastLoginAt: '最近登录',
                createdAt: '创建时间'
            }
        },
        TemplateCategory: {
            labels: { TemplateCategory: '模板分类' },
            properties: {
                id: '分类编码',
                name: '分类名称',
                sortOrder: '排序值'
            }
        },
        Template: {
            labels: { Template: '模板' },
            properties: {
                title: '模板标题',
                category: '所属分类',
                scene: '适用场景',
                promptHint: '推荐 Prompt',
                isPremium: '会员模板',
                status: '状态',
                tags: '标签',
                updatedAt: '最近更新'
            }
        },
        GenerationJob: {
            labels: { GenerationJob: '生成任务' },
            properties: {
                user: '用户',
                template: '模板',
                status: '状态',
                provider: '提供方',
                prompt: 'Prompt',
                createdAt: '创建时间'
            }
        },
        Asset: {
            labels: { Asset: '素材资产' },
            properties: {
                title: '素材标题',
                user: '用户',
                reviewStatus: '审核状态',
                createdAt: '创建时间'
            }
        },
        CommunityPost: {
            labels: { CommunityPost: '社区内容' },
            properties: {
                title: '标题',
                user: '用户',
                reviewStatus: '审核状态',
                updatedAt: '更新时间'
            }
        },
        SubscriptionPlan: {
            labels: { SubscriptionPlan: '订阅套餐' },
            properties: {
                code: '套餐编码',
                name: '套餐名称',
                priceCents: '价格（分）',
                quotaDaily: '日额度',
                active: '启用状态',
                sortOrder: '排序值'
            }
        },
        Subscription: {
            labels: { Subscription: '订阅关系' },
            properties: {
                user: '用户',
                plan: '套餐',
                status: '状态',
                renewalAt: '续费时间',
                endAt: '结束时间',
                autoRenew: '自动续费'
            }
        },
        PaymentOrder: {
            labels: { PaymentOrder: '支付订单' },
            properties: {
                orderNo: '订单号',
                user: '用户',
                plan: '套餐',
                amountCents: '金额（分）',
                status: '状态',
                paidAt: '支付时间',
                channel: '支付渠道'
            }
        },
        ContentReview: {
            labels: { ContentReview: '审核记录' },
            properties: {
                entityType: '对象类型',
                entityId: '对象 ID',
                status: '审核状态',
                reviewerAdmin: '审核人',
                updatedAt: '更新时间'
            }
        },
        SystemSetting: {
            labels: { SystemSetting: '系统配置' },
            properties: {
                key: '配置键',
                value: '配置值',
                updatedAt: '更新时间'
            }
        },
        AuditLog: {
            labels: { AuditLog: '审计日志' },
            properties: {
                createdAt: '发生时间',
                action: '动作',
                entity: '对象类型',
                entityId: '对象 ID',
                actorAdmin: '操作者'
            }
        }
    };
}
async function authenticateAdmin(email, password) {
    const admin = await findAdminByEmail(email.trim().toLowerCase());
    if (!admin || admin.status !== 'ACTIVE' || !bcrypt.compareSync(password, admin.passwordHash)) {
        return null;
    }
    await touchAdminLastLogin(admin.id);
    return {
        id: admin.id,
        email: admin.email,
        nickname: admin.nickname,
        role: admin.role,
        permissions: [...admin.permissions],
        status: admin.status
    };
}
function guardedAction(permission) {
    return {
        isAccessible: ({ currentAdmin }) => hasPermission(currentAdmin, permission)
    };
}
function hiddenAction() {
    return {
        isAccessible: false,
        isVisible: false
    };
}
function readOnlyActions(readPermission) {
    return {
        new: hiddenAction(),
        edit: hiddenAction(),
        delete: hiddenAction(),
        bulkDelete: hiddenAction(),
        list: guardedAction(readPermission),
        show: guardedAction(readPermission)
    };
}
function categoryActions() {
    return {
        list: guardedAction(adminPermissions.templatesRead),
        show: guardedAction(adminPermissions.templatesRead),
        new: guardedAction(adminPermissions.templatesWrite),
        edit: guardedAction(adminPermissions.templatesWrite),
        delete: hiddenAction(),
        bulkDelete: hiddenAction()
    };
}
function commerceCrudActions() {
    return {
        list: guardedAction(adminPermissions.subscriptionsRead),
        show: guardedAction(adminPermissions.subscriptionsRead),
        new: guardedAction(adminPermissions.subscriptionsWrite),
        edit: guardedAction(adminPermissions.subscriptionsWrite),
        delete: hiddenAction(),
        bulkDelete: hiddenAction()
    };
}
function makeUserStatusAction(name, label, icon, variant, guard, status) {
    return makeRecordAction({
        name,
        label,
        icon,
        variant,
        guard,
        permission: adminPermissions.usersWrite,
        handler: async ({ id, currentAdmin }) => {
            await updateUser(id, { status }, currentAdmin?.id);
            return {
                message: status === 'ACTIVE' ? '账号已恢复' : '账号已暂停',
                type: status === 'ACTIVE' ? 'success' : 'info'
            };
        }
    });
}
function makeTemplateStatusAction(name, label, icon, variant, guard, status) {
    return makeRecordAction({
        name,
        label,
        icon,
        variant,
        guard,
        permission: adminPermissions.templatesWrite,
        handler: async ({ id, currentAdmin }) => {
            await updateTemplateStatus(id, status, currentAdmin?.id);
            return {
                message: `模板状态已更新为 ${statusLabel(status)}`,
                type: 'success'
            };
        }
    });
}
function makeJobAction(name, label, icon, variant, guard, action) {
    return makeRecordAction({
        name,
        label,
        icon,
        variant,
        guard,
        permission: adminPermissions.jobsWrite,
        handler: async ({ id, currentAdmin }) => {
            await runJobAction(id, action, currentAdmin?.id);
            return {
                message: action === 'retry' ? '任务已重新入队' : '任务已取消',
                type: action === 'retry' ? 'success' : 'info'
            };
        }
    });
}
function makePaymentOrderAction(name, label, icon, variant, guard, status) {
    return makeRecordAction({
        name,
        label,
        icon,
        variant,
        guard,
        permission: adminPermissions.subscriptionsWrite,
        handler: async ({ id, currentAdmin }) => {
            await updatePaymentOrder(id, {
                status,
                paidAt: status === 'PAID' ? new Date().toISOString() : null
            }, currentAdmin?.id);
            return {
                message: status === 'PAID' ? '订单已标记为已支付' : '订单已标记为已退款',
                type: 'success'
            };
        }
    });
}
function makeContentReviewAction(name, label, icon, variant, guard, entityType, status) {
    return makeRecordAction({
        name,
        label,
        icon,
        variant,
        guard,
        permission: adminPermissions.reviewsWrite,
        handler: async ({ id, currentAdmin }) => {
            await reviewContentItem(entityType, id, { status }, currentAdmin?.id);
            return {
                message: `${entityTypeLabel(entityType)}审核状态已更新为 ${statusLabel(status)}`,
                type: 'success'
            };
        }
    });
}
function makeRecordAction(configAction) {
    return {
        actionType: 'record',
        component: false,
        icon: configAction.icon,
        label: configAction.label,
        variant: configAction.variant,
        guard: configAction.guard,
        isAccessible: ({ currentAdmin }) => hasPermission(currentAdmin, configAction.permission),
        handler: async (request, _response, context) => {
            const recordId = context.record?.id();
            if (!recordId || !context.record) {
                throw new Error('record not found');
            }
            if (request.method === 'get') {
                return {
                    record: context.record.toJSON(context.currentAdmin)
                };
            }
            const notice = await configAction.handler({
                id: recordId,
                currentAdmin: context.currentAdmin
            });
            const refreshed = await context.resource.findOne(recordId, context);
            return {
                record: (refreshed || context.record).toJSON(context.currentAdmin),
                redirectUrl: context.h.recordActionUrl({
                    resourceId: context.resource.id(),
                    recordId,
                    actionName: 'show'
                }),
                notice
            };
        }
    };
}
function hasPermission(currentAdmin, permission) {
    const admin = currentAdmin;
    return Boolean(admin?.role === 'ADMIN' || admin?.permissions?.includes(permission));
}
function statusTone(status) {
    if (['PUBLISHED', 'SUCCEEDED', 'ACTIVE', 'PAID', 'APPROVED'].includes(status))
        return 'success';
    if (['FAILED', 'ARCHIVED', 'SUSPENDED', 'REJECTED', 'REFUNDED', 'CANCELED'].includes(status))
        return 'error';
    return 'info';
}
function statusLabel(status) {
    return {
        DRAFT: '草稿',
        IN_REVIEW: '审核中',
        PUBLISHED: '已发布',
        ARCHIVED: '已归档',
        QUEUED: '排队中',
        RUNNING: '执行中',
        SUCCEEDED: '成功',
        FAILED: '失败',
        CANCELED: '已取消',
        ACTIVE: '启用',
        SUSPENDED: '暂停',
        TRIALING: '试用中',
        PAUSED: '已暂停',
        EXPIRED: '已到期',
        PENDING: '待处理',
        PAID: '已支付',
        REFUNDED: '已退款',
        APPROVED: '已通过',
        REJECTED: '已拒绝',
        CHANGES_REQUESTED: '需修改'
    }[status] || status;
}
function entityTypeLabel(entityType) {
    return {
        ASSET: '素材资产',
        COMMUNITY_POST: '社区内容',
        TEMPLATE: '模板'
    }[entityType] || entityType;
}
function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return String(value);
    return date.toLocaleString('zh-CN');
}
