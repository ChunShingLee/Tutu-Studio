import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export async function writeAuditLog(input: {
  actorAdminId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      actorAdminId: input.actorAdminId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      metadata: input.metadata
    }
  });
}
