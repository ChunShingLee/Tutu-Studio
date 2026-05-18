import { ContentEntityType, ContentReviewStatus, Prisma, TemplateStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  serializeAdminUser,
  serializeAsset,
  serializeAuditLog,
  serializeCommunityPost,
  serializeContentReview,
  serializeJob,
  serializeOrder,
  serializePlan,
  serializeSubscription,
  serializeTemplate,
  serializeUser
} from '../lib/serializers.js';
import { normalizeSettings, settingsToRows } from '../lib/settings.js';
import { writeAuditLog } from './auditService.js';
import { retryGenerationJob, cancelGenerationJob } from './appService.js';

export async function getAdminMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [users, admins, jobsToday, assets, templates, activeSubscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.adminUser.count({ where: { status: 'ACTIVE' } }),
    prisma.generationJob.count({ where: { createdAt: { gte: today } } }),
    prisma.asset.count(),
    prisma.template.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } })
  ]);

  return {
    users,
    admins,
    jobsToday,
    assets,
    templates,
    conversionRate: users === 0 ? 0 : activeSubscriptions / users
  };
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return users.map(serializeUser);
}

export async function updateUser(
  id: string,
  input: {
    nickname?: string;
    planCode?: 'FREE' | 'CREATOR' | 'BUSINESS';
    quotaRemaining?: number;
    status?: 'ACTIVE' | 'SUSPENDED';
  },
  actorAdminId?: string
) {
  const data: Prisma.UserUpdateInput = {};
  if (typeof input.nickname === 'string') data.nickname = input.nickname;
  if (typeof input.planCode === 'string') data.planCode = input.planCode;
  if (typeof input.quotaRemaining === 'number') data.quotaRemaining = input.quotaRemaining;
  if (typeof input.status === 'string') data.status = input.status;

  const user = await prisma.user.update({
    where: { id },
    data
  });

  await writeAuditLog({
    actorAdminId,
    action: 'user.update',
    entity: 'user',
    entityId: id,
    metadata: input satisfies Prisma.InputJsonValue
  });

  return serializeUser(user);
}

export async function listAdminUsers() {
  const admins = await prisma.adminUser.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' }
  });

  return admins.map(serializeAdminUser);
}

export async function listTemplates() {
  const templates = await prisma.template.findMany({
    include: { category: true },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }]
  });

  return templates.map(serializeTemplate);
}

export async function createTemplate(
  input: {
    title: string;
    categoryId: string;
    scene: string;
    promptHint: string;
    isPremium: boolean;
    status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
    tags: string[];
  },
  actorAdminId?: string
) {
  const template = await prisma.template.create({
    data: {
      title: input.title,
      categoryId: input.categoryId,
      scene: input.scene,
      promptHint: input.promptHint,
      isPremium: input.isPremium,
      status: input.status,
      tags: input.tags,
      createdByAdminId: actorAdminId ?? null,
      updatedByAdminId: actorAdminId ?? null
    },
    include: { category: true }
  });

  await writeAuditLog({
    actorAdminId,
    action: 'template.create',
    entity: 'template',
    entityId: template.id,
    metadata: {
      title: template.title,
      categoryId: template.categoryId,
      status: template.status
    } satisfies Prisma.InputJsonValue
  });

  return serializeTemplate(template);
}

export async function updateTemplate(
  id: string,
  input: {
    title?: string;
    categoryId?: string;
    scene?: string;
    promptHint?: string;
    isPremium?: boolean;
    status?: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
    tags?: string[];
  },
  actorAdminId?: string
) {
  const data: Prisma.TemplateUncheckedUpdateInput = { updatedByAdminId: actorAdminId ?? null };
  if (typeof input.title === 'string') data.title = input.title;
  if (typeof input.categoryId === 'string') data.categoryId = input.categoryId;
  if (typeof input.scene === 'string') data.scene = input.scene;
  if (typeof input.promptHint === 'string') data.promptHint = input.promptHint;
  if (typeof input.isPremium === 'boolean') data.isPremium = input.isPremium;
  if (typeof input.status === 'string') data.status = input.status;
  if (Array.isArray(input.tags)) data.tags = input.tags;

  const template = await prisma.template.update({
    where: { id },
    data,
    include: { category: true }
  });

  await writeAuditLog({
    actorAdminId,
    action: 'template.update',
    entity: 'template',
    entityId: id,
    metadata: input satisfies Prisma.InputJsonValue
  });

  return serializeTemplate(template);
}

export async function updateTemplateStatus(id: string, status: TemplateStatus, actorAdminId?: string) {
  const template = await prisma.template.update({
    where: { id },
    data: {
      status,
      updatedByAdminId: actorAdminId ?? null
    },
    include: { category: true }
  });

  await writeAuditLog({
    actorAdminId,
    action: 'template.status.update',
    entity: 'template',
    entityId: id,
    metadata: { status } satisfies Prisma.InputJsonValue
  });

  return serializeTemplate(template);
}

export async function getAdminSettings() {
  const rows = await prisma.systemSetting.findMany();
  return normalizeSettings(rows);
}

export async function updateAdminSettings(
  input: {
    imageProvider: string;
    model: string;
    publicAssetBaseUrl: string;
    quotaPolicy: {
      freeDaily: number;
      creatorDaily: number;
      businessDaily: number;
    };
    featureFlags: {
      community: boolean;
      payments: boolean;
      mockGeneration: boolean;
    };
  },
  actorAdminId?: string
) {
  const rows = settingsToRows(input);

  await prisma.$transaction(
    rows.map(row =>
      prisma.systemSetting.upsert({
        where: { key: row.key },
        create: {
          key: row.key,
          value: row.value as Prisma.InputJsonValue
        },
        update: {
          value: row.value as Prisma.InputJsonValue
        }
      })
    )
  );

  await writeAuditLog({
    actorAdminId,
    action: 'settings.update',
    entity: 'systemSetting',
    entityId: 'global',
    metadata: input satisfies Prisma.InputJsonValue
  });

  return getAdminSettings();
}

export async function listAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    include: { actorAdmin: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return logs.map(serializeAuditLog);
}

export async function listJobs() {
  const jobs = await prisma.generationJob.findMany({
    include: { user: true, template: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return jobs.map(serializeJob);
}

export async function runJobAction(id: string, action: 'retry' | 'cancel', actorAdminId?: string) {
  if (action === 'retry') {
    await retryGenerationJob(id, actorAdminId);
  } else {
    await cancelGenerationJob(id, actorAdminId);
  }

  const job = await prisma.generationJob.findUnique({
    where: { id },
    include: { user: true, template: true }
  });

  if (!job) {
    throw new Error('job not found');
  }

  return serializeJob(job);
}

export async function listPlans() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
  });

  return plans.map(serializePlan);
}

export async function createPlan(
  input: {
    code: string;
    name: string;
    priceCents: number;
    quotaDaily: number;
    active: boolean;
    sortOrder: number;
    features: string[];
  },
  actorAdminId?: string
) {
  const plan = await prisma.subscriptionPlan.create({
    data: {
      code: input.code,
      name: input.name,
      priceCents: input.priceCents,
      quotaDaily: input.quotaDaily,
      active: input.active,
      sortOrder: input.sortOrder,
      features: input.features as unknown as Prisma.InputJsonValue
    }
  });

  await writeAuditLog({
    actorAdminId,
    action: 'plan.create',
    entity: 'subscriptionPlan',
    entityId: plan.id,
    metadata: input satisfies Prisma.InputJsonValue
  });

  return serializePlan(plan);
}

export async function updatePlan(
  id: string,
  input: {
    name?: string;
    priceCents?: number;
    quotaDaily?: number;
    active?: boolean;
    sortOrder?: number;
    features?: string[];
  },
  actorAdminId?: string
) {
  const data: Prisma.SubscriptionPlanUpdateInput = {};
  if (typeof input.name === 'string') data.name = input.name;
  if (typeof input.priceCents === 'number') data.priceCents = input.priceCents;
  if (typeof input.quotaDaily === 'number') data.quotaDaily = input.quotaDaily;
  if (typeof input.active === 'boolean') data.active = input.active;
  if (typeof input.sortOrder === 'number') data.sortOrder = input.sortOrder;
  if (Array.isArray(input.features)) data.features = input.features as unknown as Prisma.InputJsonValue;

  const plan = await prisma.subscriptionPlan.update({
    where: { id },
    data
  });

  await writeAuditLog({
    actorAdminId,
    action: 'plan.update',
    entity: 'subscriptionPlan',
    entityId: id,
    metadata: input satisfies Prisma.InputJsonValue
  });

  return serializePlan(plan);
}

export async function listSubscriptions() {
  const subscriptions = await prisma.subscription.findMany({
    include: { user: true, plan: true },
    orderBy: { createdAt: 'desc' }
  });

  return subscriptions.map(serializeSubscription);
}

export async function updateSubscription(
  id: string,
  input: {
    status?: 'TRIALING' | 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'EXPIRED';
    renewalAt?: string | null;
    endAt?: string | null;
    autoRenew?: boolean;
  },
  actorAdminId?: string
) {
  const data: Prisma.SubscriptionUpdateInput = {};
  if (typeof input.status === 'string') data.status = input.status;
  if (typeof input.renewalAt === 'string') data.renewalAt = new Date(input.renewalAt);
  if (input.renewalAt === null) data.renewalAt = null;
  if (typeof input.endAt === 'string') data.endAt = new Date(input.endAt);
  if (input.endAt === null) data.endAt = null;
  if (typeof input.autoRenew === 'boolean') data.autoRenew = input.autoRenew;

  const subscription = await prisma.subscription.update({
    where: { id },
    data,
    include: { user: true, plan: true }
  });

  await writeAuditLog({
    actorAdminId,
    action: 'subscription.update',
    entity: 'subscription',
    entityId: id,
    metadata: input satisfies Prisma.InputJsonValue
  });

  return serializeSubscription(subscription);
}

export async function listPaymentOrders() {
  const orders = await prisma.paymentOrder.findMany({
    include: { user: true, plan: true },
    orderBy: { createdAt: 'desc' }
  });

  return orders.map(serializeOrder);
}

export async function updatePaymentOrder(
  id: string,
  input: {
    status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELED';
    channel?: string | null;
    paidAt?: string | null;
  },
  actorAdminId?: string
) {
  const data: Prisma.PaymentOrderUpdateInput = {};
  if (typeof input.status === 'string') data.status = input.status;
  if (typeof input.channel === 'string') data.channel = input.channel;
  if (input.channel === null) data.channel = null;
  if (typeof input.paidAt === 'string') data.paidAt = new Date(input.paidAt);
  if (input.paidAt === null) data.paidAt = null;

  const order = await prisma.paymentOrder.update({
    where: { id },
    data,
    include: { user: true, plan: true }
  });

  await writeAuditLog({
    actorAdminId,
    action: 'payment.update',
    entity: 'paymentOrder',
    entityId: id,
    metadata: input satisfies Prisma.InputJsonValue
  });

  return serializeOrder(order);
}

export async function listContentQueue() {
  const [templates, assets, posts, reviews] = await Promise.all([
    prisma.template.findMany({
      where: {
        status: {
          in: ['DRAFT', 'IN_REVIEW']
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    }),
    prisma.asset.findMany({
      where: {
        reviewStatus: {
          in: ['PENDING', 'CHANGES_REQUESTED']
        }
      },
      include: { user: true },
      orderBy: { updatedAt: 'desc' },
      take: 20
    }),
    prisma.communityPost.findMany({
      where: {
        reviewStatus: {
          in: ['PENDING', 'CHANGES_REQUESTED']
        }
      },
      include: { user: true },
      orderBy: { updatedAt: 'desc' },
      take: 20
    }),
    prisma.contentReview.findMany({
      include: { reviewerAdmin: true },
      orderBy: { updatedAt: 'desc' },
      take: 50
    })
  ]);

  return {
    queue: [
      ...templates.map(template => ({
        entityType: 'TEMPLATE' as const,
        entityId: template.id,
        title: template.title,
        subtitle: template.scene,
        status: template.status,
        summary: latestReviewSummary(reviews, 'TEMPLATE', template.id),
        updatedAt: template.updatedAt
      })),
      ...assets.map(asset => ({
        entityType: 'ASSET' as const,
        entityId: asset.id,
        title: asset.title,
        subtitle: asset.user?.nickname ?? asset.prompt,
        status: asset.reviewStatus,
        summary: asset.reviewNotes ?? latestReviewSummary(reviews, 'ASSET', asset.id),
        updatedAt: asset.updatedAt
      })),
      ...posts.map(post => ({
        entityType: 'COMMUNITY_POST' as const,
        entityId: post.id,
        title: post.title,
        subtitle: post.user?.nickname ?? post.body.slice(0, 40),
        status: post.reviewStatus,
        summary: post.reviewNotes ?? latestReviewSummary(reviews, 'COMMUNITY_POST', post.id),
        updatedAt: post.updatedAt
      }))
    ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    reviews: reviews.map(serializeContentReview),
    posts: posts.map(serializeCommunityPost),
    assets: assets.map(serializeAsset),
    templates: templates.map(template => ({
      id: template.id,
      title: template.title,
      status: template.status,
      updatedAt: template.updatedAt
    }))
  };
}

export async function reviewContentItem(
  entityType: ContentEntityType,
  entityId: string,
  input: {
    status: ContentReviewStatus;
    summary?: string | null;
  },
  actorAdminId?: string
) {
  const review = await prisma.contentReview.create({
    data: {
      entityType,
      entityId,
      status: input.status,
      summary: input.summary ?? null,
      reviewerAdminId: actorAdminId ?? null,
      templateId: entityType === 'TEMPLATE' ? entityId : null,
      assetId: entityType === 'ASSET' ? entityId : null,
      communityPostId: entityType === 'COMMUNITY_POST' ? entityId : null
    },
    include: { reviewerAdmin: true }
  });

  if (entityType === 'TEMPLATE') {
    await prisma.template.update({
      where: { id: entityId },
      data: {
        status: mapReviewStatusToTemplateStatus(input.status)
      }
    });
  }

  if (entityType === 'ASSET') {
    await prisma.asset.update({
      where: { id: entityId },
      data: {
        reviewStatus: input.status,
        reviewNotes: input.summary ?? null
      }
    });
  }

  if (entityType === 'COMMUNITY_POST') {
    await prisma.communityPost.update({
      where: { id: entityId },
      data: {
        reviewStatus: input.status,
        reviewNotes: input.summary ?? null
      }
    });
  }

  await writeAuditLog({
    actorAdminId,
    action: 'content.review',
    entity: entityType,
    entityId,
    metadata: input satisfies Prisma.InputJsonValue
  });

  return serializeContentReview(review);
}

export async function reviewTemplatesBulk(
  ids: string[],
  input: {
    status: ContentReviewStatus;
    summary?: string | null;
  },
  actorAdminId?: string
) {
  if (!ids.length) {
    return { reviewedCount: 0 };
  }

  await prisma.$transaction(async tx => {
    await tx.contentReview.createMany({
      data: ids.map(id => ({
        entityType: 'TEMPLATE',
        entityId: id,
        status: input.status,
        summary: input.summary ?? null,
        reviewerAdminId: actorAdminId ?? null,
        templateId: id
      }))
    });

    await tx.template.updateMany({
      where: { id: { in: ids } },
      data: {
        status: mapReviewStatusToTemplateStatus(input.status),
        updatedByAdminId: actorAdminId ?? null
      }
    });

    await tx.auditLog.create({
      data: {
        actorAdminId: actorAdminId ?? null,
        action: 'template.bulkReview',
        entity: 'template',
        entityId: ids.join(','),
        metadata: {
          ids,
          status: input.status,
          summary: input.summary ?? null
        } as Prisma.InputJsonValue
      }
    });
  });

  return { reviewedCount: ids.length };
}

export async function getContentStudioPageData() {
  const [queueData, totalTemplates, draftTemplates, inReviewTemplates, premiumTemplates, reviewTemplates, latestTemplates, categoryStats] = await Promise.all([
    listContentQueue(),
    prisma.template.count(),
    prisma.template.count({ where: { status: 'DRAFT' } }),
    prisma.template.count({ where: { status: 'IN_REVIEW' } }),
    prisma.template.count({ where: { isPremium: true } }),
    prisma.template.findMany({
      where: {
        status: {
          in: ['DRAFT', 'IN_REVIEW']
        }
      },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
      take: 8
    }),
    prisma.template.findMany({
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
      take: 6
    }),
    prisma.templateCategory.findMany({
      include: {
        templates: {
          select: {
            isPremium: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })
  ]);

  const templatePreviewMap = await loadTemplatePreviewMap([
    ...reviewTemplates.map(item => item.id),
    ...latestTemplates.map(item => item.id)
  ]);
  const assetPreviewMap = new Map(queueData.assets.map(asset => [asset.id, asset.imageUrl]));
  const postPreviewMap = new Map(queueData.posts.map(post => [post.id, post.imageUrl]));

  return {
    stats: {
      pendingReviews: queueData.queue.length,
      draftTemplates,
      inReviewTemplates,
      premiumRatio: totalTemplates === 0 ? 0 : premiumTemplates / totalTemplates
    },
    templateReviewQueue: reviewTemplates.map(template => ({
      ...serializeTemplate(template),
      categoryName: template.category?.name,
      previewImageUrl: templatePreviewMap.get(template.id) ?? null,
      updatedAtLabel: template.updatedAt.toLocaleString('zh-CN')
    })),
    queue: queueData.queue.slice(0, 8).map(item => ({
      ...item,
      previewImageUrl:
        item.entityType === 'TEMPLATE'
          ? templatePreviewMap.get(item.entityId) ?? null
          : item.entityType === 'ASSET'
            ? assetPreviewMap.get(item.entityId) ?? null
            : postPreviewMap.get(item.entityId) ?? null,
      updatedAtLabel: item.updatedAt.toLocaleString('zh-CN')
    })),
    assets: queueData.assets.slice(0, 5).map(asset => ({
      ...asset,
      createdAtLabel: asset.createdAt ? new Date(asset.createdAt).toLocaleString('zh-CN') : '—'
    })),
    posts: queueData.posts.slice(0, 5).map(post => ({
      ...post,
      updatedAtLabel: post.updatedAt ? new Date(post.updatedAt).toLocaleString('zh-CN') : '—'
    })),
    latestTemplates: latestTemplates.map(template => ({
      ...serializeTemplate(template),
      categoryName: template.category?.name,
      previewImageUrl: templatePreviewMap.get(template.id) ?? null,
      updatedAtLabel: template.updatedAt.toLocaleString('zh-CN')
    })),
    categoryBreakdown: categoryStats.map(category => ({
      categoryId: category.id,
      categoryName: category.name,
      count: category.templates.length,
      premiumCount: category.templates.filter(template => template.isPremium).length
    }))
  };
}

export async function getJobCommandPageData() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sinceWeek = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const [queued, running, failed, succeeded, canceled, failedJobs, activeJobs, latestAssets, recentJobs, trendJobs] = await Promise.all([
    prisma.generationJob.count({ where: { status: 'QUEUED' } }),
    prisma.generationJob.count({ where: { status: 'RUNNING' } }),
    prisma.generationJob.count({ where: { status: 'FAILED' } }),
    prisma.generationJob.count({ where: { status: 'SUCCEEDED' } }),
    prisma.generationJob.count({ where: { status: 'CANCELED' } }),
    prisma.generationJob.findMany({
      where: { status: 'FAILED' },
      include: { user: true, template: true },
      orderBy: { updatedAt: 'desc' },
      take: 6
    }),
    prisma.generationJob.findMany({
      where: { status: { in: ['QUEUED', 'RUNNING'] } },
      include: { user: true, template: true },
      orderBy: { createdAt: 'desc' },
      take: 6
    }),
    prisma.asset.findMany({
      include: { user: true, job: true },
      orderBy: { createdAt: 'desc' },
      take: 6
    }),
    prisma.generationJob.findMany({
      include: { user: true, template: true },
      orderBy: { createdAt: 'desc' },
      take: 80
    }),
    prisma.generationJob.findMany({
      where: { createdAt: { gte: sinceWeek } },
      include: { user: true, template: true },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  const providerMap = new Map<string, { count: number; failedCount: number; succeededCount: number }>();
  recentJobs.forEach(job => {
    const entry = providerMap.get(job.provider) ?? { count: 0, failedCount: 0, succeededCount: 0 };
    entry.count += 1;
    if (job.status === 'FAILED') entry.failedCount += 1;
    if (job.status === 'SUCCEEDED') entry.succeededCount += 1;
    providerMap.set(job.provider, entry);
  });

  const reasonGroupMap = new Map<string, {
    reason: string;
    count: number;
    providers: Set<string>;
    samplePrompt: string;
    sampleJobTitle: string;
  }>();

  failedJobs.forEach(job => {
    const reason = normalizeFailureReason(job.errorMessage);
    const entry = reasonGroupMap.get(reason) ?? {
      reason,
      count: 0,
      providers: new Set<string>(),
      samplePrompt: job.prompt,
      sampleJobTitle: job.template?.title ?? '自由生成任务'
    };
    entry.count += 1;
    entry.providers.add(job.provider);
    reasonGroupMap.set(reason, entry);
  });

  const trend = buildDailyTrend(trendJobs, sinceWeek);

  const totalJobs = queued + running + failed + succeeded + canceled;
  return {
    stats: {
      queued,
      running,
      failed,
      successRate: totalJobs === 0 ? 0 : Math.round((succeeded / totalJobs) * 1000) / 10
    },
    failedJobs: failedJobs.map(job => ({
      ...serializeJob(job),
      createdAtLabel: job.createdAt.toLocaleString('zh-CN')
    })),
    activeJobs: activeJobs.map(job => ({
      ...serializeJob(job),
      createdAtLabel: job.createdAt.toLocaleString('zh-CN'),
      startedAtLabel: job.startedAt?.toLocaleString('zh-CN') ?? null
    })),
    latestAssets: latestAssets.map(asset => ({
      ...serializeAsset(asset),
      createdAtLabel: asset.createdAt.toLocaleString('zh-CN')
    })),
    providerMix: [...providerMap.entries()].map(([provider, stats]) => ({
      provider,
      ...stats
    })).sort((a, b) => b.count - a.count),
    failureReasonGroups: [...reasonGroupMap.values()]
      .map(item => ({
        reason: item.reason,
        count: item.count,
        providers: [...item.providers],
        samplePrompt: item.samplePrompt,
        sampleJobTitle: item.sampleJobTitle
      }))
      .sort((a, b) => b.count - a.count),
    trend,
    timeline: {
      successLast24h: recentJobs.filter(job => job.status === 'SUCCEEDED' && job.createdAt >= since).length,
      failedLast24h: recentJobs.filter(job => job.status === 'FAILED' && job.createdAt >= since).length,
      canceledLast24h: recentJobs.filter(job => job.status === 'CANCELED' && job.createdAt >= since).length
    }
  };
}

export async function getRevenueOpsPageData() {
  const [userCount, activeSubscriptions, pendingOrders, totalPaidAgg, plans, subscriptions, paidOrders, pendingFollowOrders, allPaidOrders] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.paymentOrder.count({ where: { status: 'PENDING' } }),
    prisma.paymentOrder.aggregate({
      where: { status: 'PAID' },
      _sum: { amountCents: true }
    }),
    prisma.subscriptionPlan.findMany({
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' }
        },
        paymentOrders: {
          where: { status: 'PAID' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.subscription.findMany({
      include: { user: true, plan: true },
      orderBy: { updatedAt: 'desc' },
      take: 6
    }),
    prisma.paymentOrder.findMany({
      where: { status: 'PAID' },
      include: { user: true, plan: true },
      orderBy: { paidAt: 'desc' },
      take: 6
    }),
    prisma.paymentOrder.findMany({
      where: { status: 'PENDING' },
      include: { user: true, plan: true },
      orderBy: { createdAt: 'desc' },
      take: 4
    }),
    prisma.paymentOrder.findMany({
      where: { status: 'PAID' },
      include: { user: true, plan: true },
      orderBy: { paidAt: 'desc' }
    })
  ]);

  const renewalThreshold = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const renewalCandidates = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      renewalAt: {
        not: null,
        lte: renewalThreshold
      }
    },
    include: { user: true, plan: true },
    orderBy: { renewalAt: 'asc' },
    take: 6
  });

  const renewalFollowUps = renewalCandidates
    .map(item => ({
      id: `renewal-${item.id}`,
      title: item.plan?.name || item.planId,
      subtitle: item.user?.nickname || item.userId,
      note: '订阅即将在 7 天内续费，建议提前关注续费承接。',
      badge: item.renewalAt?.toLocaleDateString('zh-CN') ?? '即将续费',
      tone: 'warning' as const,
      meta: item.autoRenew ? '自动续费开启' : '自动续费关闭'
    }));

  const orderFollowUps = pendingFollowOrders.map(order => ({
    id: `order-${order.id}`,
    title: order.orderNo,
    subtitle: `${order.user?.nickname || order.userId} · ${order.plan?.name || order.planId || '未绑定套餐'}`,
    note: `待收款 ${formatCents(order.amountCents)}，建议尽快确认支付进度。`,
    badge: '待支付',
    tone: 'warning' as const,
    meta: order.createdAt.toLocaleString('zh-CN')
  }));

  const revenueTrend = buildRevenueTrend(allPaidOrders);
  const channelMap = new Map<string, { count: number; paidCents: number }>();
  allPaidOrders.forEach(order => {
    const key = order.channel || 'unknown';
    const entry = channelMap.get(key) ?? { count: 0, paidCents: 0 };
    entry.count += 1;
    entry.paidCents += order.amountCents;
    channelMap.set(key, entry);
  });

  return {
    stats: {
      activeSubscriptions,
      pendingOrders,
      totalPaidCents: totalPaidAgg._sum.amountCents ?? 0,
      conversionRate: userCount === 0 ? 0 : activeSubscriptions / userCount
    },
    planMix: plans.map(plan => ({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      activeSubscriptions: plan.subscriptions.length,
      paidCents: plan.paymentOrders.reduce((sum, order) => sum + order.amountCents, 0)
    })),
    followUps: [...orderFollowUps, ...renewalFollowUps].slice(0, 8),
    revenueTrend,
    channelMix: [...channelMap.entries()].map(([channel, stats]) => ({
      channel,
      count: stats.count,
      paidCents: stats.paidCents
    })).sort((a, b) => b.paidCents - a.paidCents),
    renewalReminders: renewalCandidates.map(item => ({
      id: item.id,
      userId: item.userId,
      userNickname: item.user?.nickname,
      planId: item.planId,
      planName: item.plan?.name,
      autoRenew: item.autoRenew,
      daysLeft: Math.max(0, Math.ceil(((item.renewalAt?.getTime() ?? Date.now()) - Date.now()) / (24 * 60 * 60 * 1000))),
      renewalAtLabel: item.renewalAt?.toLocaleDateString('zh-CN') ?? '未设置续费'
    })),
    paidOrders: paidOrders.map(order => ({
      ...serializeOrder(order),
      paidAtLabel: order.paidAt?.toLocaleString('zh-CN') ?? '—'
    })),
    subscriptions: subscriptions.map(item => ({
      ...serializeSubscription(item),
      renewalAtLabel: item.renewalAt?.toLocaleDateString('zh-CN') ?? '未设置续费'
    }))
  };
}

function latestReviewSummary(
  reviews: Array<{ entityType: ContentEntityType; entityId: string; summary: string | null }>,
  entityType: ContentEntityType,
  entityId: string
) {
  return reviews.find(review => review.entityType === entityType && review.entityId === entityId)?.summary ?? null;
}

function mapReviewStatusToTemplateStatus(status: ContentReviewStatus): TemplateStatus {
  switch (status) {
    case 'APPROVED':
      return 'PUBLISHED';
    case 'REJECTED':
      return 'ARCHIVED';
    case 'CHANGES_REQUESTED':
      return 'IN_REVIEW';
    default:
      return 'IN_REVIEW';
  }
}

function formatCents(value: number) {
  return `¥${(value / 100).toFixed(2)}`;
}

async function loadTemplatePreviewMap(templateIds: string[]) {
  if (!templateIds.length) {
    return new Map<string, string>();
  }

  const jobs = await prisma.generationJob.findMany({
    where: {
      templateId: { in: templateIds },
      status: 'SUCCEEDED',
      imageUrl: { not: null }
    },
    orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      templateId: true,
      imageUrl: true
    }
  });

  const map = new Map<string, string>();
  jobs.forEach(job => {
    if (job.templateId && job.imageUrl && !map.has(job.templateId)) {
      map.set(job.templateId, job.imageUrl);
    }
  });

  return map;
}

function buildDailyTrend(
  jobs: Array<{ createdAt: Date; status: string }>,
  since: Date
) {
  const start = new Date(since);
  start.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      succeeded: 0,
      failed: 0,
      canceled: 0
    };
  });

  jobs.forEach(job => {
    const current = new Date(job.createdAt);
    current.setHours(0, 0, 0, 0);
    const dayIndex = Math.round((current.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const bucket = buckets[dayIndex];
    if (!bucket) return;
    if (job.status === 'SUCCEEDED') bucket.succeeded += 1;
    if (job.status === 'FAILED') bucket.failed += 1;
    if (job.status === 'CANCELED') bucket.canceled += 1;
  });

  return buckets;
}

function buildRevenueTrend(orders: Array<{ paidAt: Date | null; amountCents: number }>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentDays = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - offset));
    return {
      key: date.toISOString().slice(0, 10),
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      currentPaidCents: 0,
      previousPaidCents: 0
    };
  });

  const currentMap = new Map(currentDays.map(day => [day.key, day]));
  const previousMap = new Map(
    currentDays.map((day, index) => {
      const previousDate = new Date(today);
      previousDate.setDate(today.getDate() - 13 + index);
      return [previousDate.toISOString().slice(0, 10), day];
    })
  );

  orders.forEach(order => {
    if (!order.paidAt) return;
    const date = new Date(order.paidAt);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    const currentBucket = currentMap.get(key);
    if (currentBucket) {
      currentBucket.currentPaidCents += order.amountCents;
      return;
    }
    const previousBucket = previousMap.get(key);
    if (previousBucket) {
      previousBucket.previousPaidCents += order.amountCents;
    }
  });

  return currentDays;
}

function normalizeFailureReason(message?: string | null) {
  const text = (message || '').toLowerCase();
  if (!text) return '未知异常';
  if (text.includes('timeout') || text.includes('超时')) return '上游响应超时';
  if (text.includes('quota') || text.includes('rate limit') || text.includes('额度')) return '额度或频率限制';
  if (text.includes('reference image') || text.includes('fetch reference')) return '参考图处理失败';
  if (text.includes('returned no image')) return '模型未返回图片';
  if (text.includes('auth') || text.includes('permission') || text.includes('unauthorized')) return '鉴权或权限问题';
  return message?.split(/[。.!?]/)[0] || '未知异常';
}
