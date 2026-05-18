import { prisma } from '../lib/prisma.js';
export async function writeAuditLog(input) {
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
