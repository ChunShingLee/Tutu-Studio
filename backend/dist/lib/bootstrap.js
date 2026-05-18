import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { prisma } from './prisma.js';
import { seedAdminUsers, seedAssets, seedCategories, seedCommunityPosts, seedJobs, seedOrders, seedPlans, seedSubscriptions, seedSystemSettings, seedTemplates, seedUsers } from './seedData.js';
let bootstrapped = false;
export async function bootstrapDatabase() {
    if (bootstrapped)
        return;
    await prisma.$connect();
    for (const category of seedCategories) {
        await prisma.templateCategory.upsert({
            where: { id: category.id },
            create: category,
            update: {
                name: category.name,
                sortOrder: category.sortOrder
            }
        });
    }
    for (const plan of seedPlans) {
        await prisma.subscriptionPlan.upsert({
            where: { id: plan.id },
            create: {
                ...plan,
                features: plan.features
            },
            update: {
                code: plan.code,
                name: plan.name,
                priceCents: plan.priceCents,
                quotaDaily: plan.quotaDaily,
                active: plan.active,
                sortOrder: plan.sortOrder,
                features: plan.features
            }
        });
    }
    for (const user of seedUsers) {
        await prisma.user.upsert({
            where: { id: user.id },
            create: user,
            update: {
                email: user.email,
                nickname: user.nickname,
                planCode: user.planCode,
                quotaRemaining: user.quotaRemaining,
                status: user.status
            }
        });
    }
    for (const adminUser of seedAdminUsers) {
        const password = adminUser.id === 'admin-root' ? config.adminPassword : config.adminOperatorPassword;
        await prisma.adminUser.upsert({
            where: { id: adminUser.id },
            create: {
                ...adminUser,
                permissions: [...adminUser.permissions],
                passwordHash: bcrypt.hashSync(password, 10)
            },
            update: {
                email: adminUser.email,
                nickname: adminUser.nickname,
                role: adminUser.role,
                permissions: [...adminUser.permissions],
                status: adminUser.status,
                passwordHash: bcrypt.hashSync(password, 10)
            }
        });
    }
    for (const template of seedTemplates) {
        await prisma.template.upsert({
            where: { id: template.id },
            create: {
                ...template,
                tags: [...template.tags],
                createdByAdminId: 'admin-root',
                updatedByAdminId: 'admin-root'
            },
            update: {
                title: template.title,
                scene: template.scene,
                promptHint: template.promptHint,
                isPremium: template.isPremium,
                status: template.status,
                categoryId: template.categoryId,
                tags: [...template.tags],
                updatedByAdminId: 'admin-root'
            }
        });
    }
    for (const setting of seedSystemSettings) {
        await prisma.systemSetting.upsert({
            where: { key: setting.key },
            create: {
                key: setting.key,
                value: setting.value
            },
            update: {
                value: setting.value
            }
        });
    }
    for (const subscription of seedSubscriptions) {
        await prisma.subscription.upsert({
            where: { id: subscription.id },
            create: {
                ...subscription,
                startAt: new Date(subscription.startAt),
                renewalAt: subscription.renewalAt ? new Date(subscription.renewalAt) : null
            },
            update: {
                userId: subscription.userId,
                planId: subscription.planId,
                status: subscription.status,
                startAt: new Date(subscription.startAt),
                renewalAt: subscription.renewalAt ? new Date(subscription.renewalAt) : null,
                autoRenew: subscription.autoRenew
            }
        });
    }
    for (const order of seedOrders) {
        await prisma.paymentOrder.upsert({
            where: { id: order.id },
            create: {
                ...order,
                paidAt: order.paidAt ? new Date(order.paidAt) : null,
                metadata: order.metadata
            },
            update: {
                orderNo: order.orderNo,
                userId: order.userId,
                planId: order.planId,
                amountCents: order.amountCents,
                currency: order.currency,
                status: order.status,
                channel: order.channel,
                paidAt: order.paidAt ? new Date(order.paidAt) : null,
                metadata: order.metadata
            }
        });
    }
    for (const job of seedJobs) {
        await prisma.generationJob.upsert({
            where: { id: job.id },
            create: {
                ...job,
                createdAt: new Date(job.createdAt),
                updatedAt: new Date(job.updatedAt),
                startedAt: job.startedAt ? new Date(job.startedAt) : null,
                completedAt: job.completedAt ? new Date(job.completedAt) : null
            },
            update: {
                userId: job.userId,
                templateId: job.templateId,
                prompt: job.prompt,
                enhancedPrompt: job.enhancedPrompt,
                style: job.style,
                aspectRatio: job.aspectRatio,
                status: job.status,
                provider: job.provider,
                providerJobId: job.providerJobId,
                imageUrl: job.imageUrl,
                errorMessage: job.errorMessage,
                mode: job.mode,
                startedAt: job.startedAt ? new Date(job.startedAt) : null,
                completedAt: job.completedAt ? new Date(job.completedAt) : null
            }
        });
    }
    for (const asset of seedAssets) {
        await prisma.asset.upsert({
            where: { id: asset.id },
            create: {
                ...asset,
                tags: [...asset.tags],
                sourceImageUrl: asset.sourceImageUrl ?? undefined,
                reviewNotes: asset.reviewNotes ?? undefined
            },
            update: {
                userId: asset.userId,
                jobId: asset.jobId,
                title: asset.title,
                imageUrl: asset.imageUrl,
                prompt: asset.prompt,
                tags: [...asset.tags],
                sourceImageUrl: asset.sourceImageUrl,
                mode: asset.mode,
                reviewStatus: asset.reviewStatus,
                reviewNotes: asset.reviewNotes
            }
        });
    }
    for (const post of seedCommunityPosts) {
        await prisma.communityPost.upsert({
            where: { id: post.id },
            create: {
                ...post,
                reviewNotes: post.reviewNotes ?? undefined
            },
            update: {
                userId: post.userId,
                title: post.title,
                body: post.body,
                imageUrl: post.imageUrl,
                reviewStatus: post.reviewStatus,
                reviewNotes: post.reviewNotes
            }
        });
    }
    await prisma.contentReview.upsert({
        where: { id: 'review-template-logo' },
        create: {
            id: 'review-template-logo',
            entityType: 'TEMPLATE',
            entityId: 'logo',
            status: 'CHANGES_REQUESTED',
            summary: '建议补充品牌识别约束，避免生成结果过于分散。',
            reviewerAdminId: 'operator-content',
            templateId: 'logo'
        },
        update: {
            status: 'CHANGES_REQUESTED',
            summary: '建议补充品牌识别约束，避免生成结果过于分散。',
            reviewerAdminId: 'operator-content'
        }
    });
    await prisma.contentReview.upsert({
        where: { id: 'review-asset-demo' },
        create: {
            id: 'review-asset-demo',
            entityType: 'ASSET',
            entityId: 'asset-demo-success',
            status: 'APPROVED',
            summary: '成片画质和电商构图通过。',
            reviewerAdminId: 'admin-root',
            assetId: 'asset-demo-success'
        },
        update: {
            status: 'APPROVED',
            summary: '成片画质和电商构图通过。',
            reviewerAdminId: 'admin-root'
        }
    });
    await prisma.contentReview.upsert({
        where: { id: 'review-community-post-1' },
        create: {
            id: 'review-community-post-1',
            entityType: 'COMMUNITY_POST',
            entityId: 'community-post-1',
            status: 'PENDING',
            summary: '待审核社区内容',
            communityPostId: 'community-post-1'
        },
        update: {
            status: 'PENDING',
            summary: '待审核社区内容'
        }
    });
    const auditCount = await prisma.auditLog.count();
    if (auditCount === 0) {
        await prisma.auditLog.create({
            data: {
                actorAdminId: 'admin-root',
                action: 'system.bootstrap',
                entity: 'system',
                entityId: 'bootstrap',
                metadata: {
                    categories: seedCategories.length,
                    templates: seedTemplates.length,
                    plans: seedPlans.length
                }
            }
        });
    }
    bootstrapped = true;
}
