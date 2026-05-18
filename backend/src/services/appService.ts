import { Prisma } from '@prisma/client';
import { AppError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { demoUserId } from '../lib/seedData.js';
import { normalizeSettings } from '../lib/settings.js';
import { generateImage, ImageGenerationInput, ImageGenerationOutput } from '../providers/imageProvider.js';
import { writeAuditLog } from './auditService.js';

export async function getCurrentUser() {
  const user = await prisma.user.findUnique({ where: { id: demoUserId } });
  if (!user) {
    throw new Error('Current user not found');
  }
  return user;
}

export async function listPublicTemplates() {
  const [categories, templates] = await Promise.all([
    prisma.templateCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.template.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return { categories, templates };
}

export async function listUserAssets(userId = demoUserId) {
  return prisma.asset.findMany({
    where: { userId },
    include: { job: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function listUserJobs(userId = demoUserId) {
  return prisma.generationJob.findMany({
    where: { userId },
    include: { template: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createGenerationJob(input: ImageGenerationInput & { templateId?: string | null }, userId = demoUserId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, '用户不存在');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(403, '当前账号已被暂停，无法提交生成任务。');
  }

  if (user.quotaRemaining === 0) {
    throw new AppError(403, '今日额度已用尽，请升级套餐或等待明日恢复。');
  }

  const settings = normalizeSettings(await prisma.systemSetting.findMany());
  const enhancedPrompt = buildPrompt(input);

  const job = await prisma.generationJob.create({
    data: {
      userId,
      templateId: input.templateId ?? null,
      prompt: input.prompt,
      enhancedPrompt,
      style: input.style,
      aspectRatio: input.aspectRatio,
      status: 'QUEUED',
      provider: settings.imageProvider,
      mode: toJobMode(input.mode ?? 'textToImage'),
      referenceImageUrl: input.referenceImageUrl ?? null,
      editInstruction: input.editInstruction ?? null,
      editArea: input.editArea ?? null,
      editStrength: input.editStrength ?? null
    },
    include: { template: true }
  });

  void processGenerationJob(job.id);
  return job;
}

export async function getGenerationJobById(id: string, userId = demoUserId) {
  return prisma.generationJob.findFirst({
    where: { id, userId },
    include: { template: true }
  });
}

export async function retryGenerationJob(jobId: string, actorAdminId?: string) {
  const job = await prisma.generationJob.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new AppError(404, 'job not found');
  }

  await prisma.generationJob.update({
    where: { id: jobId },
    data: {
      status: 'QUEUED',
      errorMessage: null,
      imageUrl: null,
      completedAt: null
    }
  });

  await writeAuditLog({
    actorAdminId,
    action: 'job.retry',
    entity: 'generationJob',
    entityId: jobId,
    metadata: { previousStatus: job.status } satisfies Prisma.InputJsonValue
  });

  void processGenerationJob(jobId);
}

export async function cancelGenerationJob(jobId: string, actorAdminId?: string) {
  const job = await prisma.generationJob.update({
    where: { id: jobId },
    data: {
      status: 'CANCELED',
      errorMessage: '任务已由管理员取消。',
      completedAt: new Date()
    }
  });

  await writeAuditLog({
    actorAdminId,
    action: 'job.cancel',
    entity: 'generationJob',
    entityId: jobId,
    metadata: { status: job.status } satisfies Prisma.InputJsonValue
  });

  return job;
}

async function processGenerationJob(jobId: string) {
  const job = await prisma.generationJob.findUnique({
    where: { id: jobId },
    include: { template: true, user: true }
  });

  if (!job || job.status === 'CANCELED') {
    return;
  }

  await prisma.generationJob.update({
    where: { id: jobId },
    data: {
      status: 'RUNNING',
      startedAt: new Date()
    }
  });

  try {
    const settings = normalizeSettings(await prisma.systemSetting.findMany());
    const output = settings.featureFlags.mockGeneration
      ? buildMockOutput(jobId, settings.publicAssetBaseUrl)
      : await generateImage({
          prompt: job.prompt,
          style: job.style,
          aspectRatio: job.aspectRatio,
          referenceImageUrl: job.referenceImageUrl,
          mode: fromJobMode(job.mode),
          editInstruction: job.editInstruction,
          editArea: job.editArea,
          editStrength: job.editStrength
        });

    await prisma.$transaction(async tx => {
      await tx.generationJob.update({
        where: { id: jobId },
        data: {
          status: 'SUCCEEDED',
          providerJobId: output.providerJobId ?? null,
          imageUrl: output.imageUrl,
          completedAt: new Date()
        }
      });

      await tx.asset.upsert({
        where: { jobId },
        create: {
          userId: job.userId,
          jobId,
          title: resolveAssetTitle(job.template?.title, job.mode),
          imageUrl: output.imageUrl,
          prompt: job.prompt,
          tags: job.template?.title ? [job.template.title] : [],
          sourceImageUrl: job.referenceImageUrl,
          mode: job.mode,
          reviewStatus: 'PENDING'
        },
        update: {
          imageUrl: output.imageUrl,
          prompt: job.prompt,
          sourceImageUrl: job.referenceImageUrl,
          mode: job.mode
        }
      });

      if (job.user.quotaRemaining > 0) {
        await tx.user.update({
          where: { id: job.userId },
          data: {
            quotaRemaining: {
              decrement: 1
            }
          }
        });
      }
    });
  } catch (error) {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'unknown error',
        completedAt: new Date()
      }
    });
  }
}

function resolveAssetTitle(templateTitle: string | undefined, mode: 'TEXT_TO_IMAGE' | 'IMAGE_TO_IMAGE' | 'LOCAL_EDIT'): string {
  const baseTitle = templateTitle ?? 'AI 生成作品';
  switch (mode) {
    case 'IMAGE_TO_IMAGE':
      return `${baseTitle} · 图生图`;
    case 'LOCAL_EDIT':
      return `${baseTitle} · 局部修改`;
    default:
      return baseTitle;
  }
}

function buildPrompt(input: ImageGenerationInput) {
  const segments = [input.prompt, `风格：${input.style}`, `画幅比例：${input.aspectRatio}`];

  if (input.mode && input.mode !== 'textToImage') {
    segments.push(`任务模式：${input.mode === 'imageToImage' ? '图生图' : '局部修改'}`);
  }

  if (input.referenceImageUrl || input.referenceImageBase64) {
    segments.push('参考要求：请严格参考输入图片的主体结构、视角、构图与光线关系。');
  }

  if (input.mode === 'localEdit') {
    if (input.editArea) segments.push(`局部修改区域：${input.editArea}`);
    if (input.editStrength) segments.push(`修改强度：${input.editStrength}`);
    if (input.editInstruction) segments.push(`局部修改说明：${input.editInstruction}`);
    segments.push('保留未指定区域的主体、光影、透视和整体画面关系，只在要求区域做修改。');
  }

  return segments.join('\n');
}

function toJobMode(mode: 'textToImage' | 'imageToImage' | 'localEdit') {
  switch (mode) {
    case 'imageToImage':
      return 'IMAGE_TO_IMAGE' as const;
    case 'localEdit':
      return 'LOCAL_EDIT' as const;
    default:
      return 'TEXT_TO_IMAGE' as const;
  }
}

function fromJobMode(mode: 'TEXT_TO_IMAGE' | 'IMAGE_TO_IMAGE' | 'LOCAL_EDIT') {
  switch (mode) {
    case 'IMAGE_TO_IMAGE':
      return 'imageToImage' as const;
    case 'LOCAL_EDIT':
      return 'localEdit' as const;
    default:
      return 'textToImage' as const;
  }
}

function buildMockOutput(jobId: string, publicAssetBaseUrl: string): ImageGenerationOutput {
  return {
    provider: 'mock',
    providerJobId: `mock-${jobId}`,
    imageUrl: `${publicAssetBaseUrl.replace(/\/$/, '')}/${jobId}.png`
  };
}
