export function fromPrismaJobMode(mode) {
    switch (mode) {
        case 'IMAGE_TO_IMAGE':
            return 'imageToImage';
        case 'LOCAL_EDIT':
            return 'localEdit';
        default:
            return 'textToImage';
    }
}
export function toPrismaJobMode(mode) {
    switch (mode) {
        case 'imageToImage':
            return 'IMAGE_TO_IMAGE';
        case 'localEdit':
            return 'LOCAL_EDIT';
        default:
            return 'TEXT_TO_IMAGE';
    }
}
export function serializeUser(user) {
    return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        planCode: user.planCode,
        plan: planCodeToLabel(user.planCode),
        quotaRemaining: user.quotaRemaining,
        dailyQuotaRemaining: user.quotaRemaining,
        status: user.status,
        role: 'USER',
        createdAt: user.createdAt
    };
}
export function serializeAdminUser(admin) {
    return {
        id: admin.id,
        email: admin.email,
        nickname: admin.nickname,
        role: admin.role,
        permissions: [...admin.permissions],
        status: admin.status,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt
    };
}
export function serializeTemplate(template) {
    return {
        id: template.id,
        title: template.title,
        categoryId: template.categoryId,
        categoryName: template.category?.name,
        scene: template.scene,
        promptHint: template.promptHint,
        isPremium: template.isPremium,
        status: template.status,
        tags: [...template.tags],
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
    };
}
export function serializeJob(job) {
    return {
        id: job.id,
        userId: job.userId,
        userNickname: job.user?.nickname,
        templateId: job.templateId,
        templateTitle: job.template?.title,
        prompt: job.prompt,
        enhancedPrompt: job.enhancedPrompt,
        style: job.style,
        aspectRatio: job.aspectRatio,
        status: job.status,
        provider: job.provider,
        providerJobId: job.providerJobId,
        imageUrl: job.imageUrl,
        errorMessage: job.errorMessage,
        referenceImageUrl: job.referenceImageUrl,
        mode: fromPrismaJobMode(job.mode),
        editInstruction: job.editInstruction,
        editArea: job.editArea,
        editStrength: job.editStrength,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt
    };
}
export function serializeAsset(asset) {
    return {
        id: asset.id,
        userId: asset.userId,
        userNickname: asset.user?.nickname,
        jobId: asset.jobId,
        title: asset.title,
        imageUrl: asset.imageUrl,
        prompt: asset.prompt,
        tags: [...asset.tags],
        sourceImageUrl: asset.sourceImageUrl,
        mode: fromPrismaJobMode(asset.mode),
        reviewStatus: asset.reviewStatus,
        reviewNotes: asset.reviewNotes,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt
    };
}
export function serializeAuditLog(log) {
    return {
        id: log.id,
        actorId: log.actorAdminId,
        actorNickname: log.actorAdmin?.nickname,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        targetId: log.entityId,
        metadata: log.metadata,
        createdAt: log.createdAt
    };
}
export function serializePlan(plan) {
    return {
        id: plan.id,
        code: plan.code,
        name: plan.name,
        priceCents: plan.priceCents,
        quotaDaily: plan.quotaDaily,
        active: plan.active,
        features: plan.features,
        sortOrder: plan.sortOrder,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
    };
}
export function serializeSubscription(subscription) {
    return {
        id: subscription.id,
        userId: subscription.userId,
        userNickname: subscription.user?.nickname,
        planId: subscription.planId,
        planName: subscription.plan?.name,
        status: subscription.status,
        startAt: subscription.startAt,
        endAt: subscription.endAt,
        renewalAt: subscription.renewalAt,
        autoRenew: subscription.autoRenew,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt
    };
}
export function serializeOrder(order) {
    return {
        id: order.id,
        orderNo: order.orderNo,
        userId: order.userId,
        userNickname: order.user?.nickname,
        planId: order.planId,
        planName: order.plan?.name,
        amountCents: order.amountCents,
        currency: order.currency,
        status: order.status,
        channel: order.channel,
        paidAt: order.paidAt,
        metadata: order.metadata,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
    };
}
export function serializeReviewItem(input) {
    return input;
}
export function serializeContentReview(review) {
    return {
        id: review.id,
        entityType: review.entityType,
        entityId: review.entityId,
        status: review.status,
        summary: review.summary,
        reviewerAdminId: review.reviewerAdminId,
        reviewerNickname: review.reviewerAdmin?.nickname,
        metadata: review.metadata,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
    };
}
export function serializeCommunityPost(post) {
    return {
        id: post.id,
        userId: post.userId,
        userNickname: post.user?.nickname,
        title: post.title,
        body: post.body,
        imageUrl: post.imageUrl,
        reviewStatus: post.reviewStatus,
        reviewNotes: post.reviewNotes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
    };
}
function planCodeToLabel(planCode) {
    switch (planCode) {
        case 'CREATOR':
            return '创作者版';
        case 'BUSINESS':
            return '商业版';
        default:
            return '免费版';
    }
}
