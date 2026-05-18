import { prisma } from '../lib/prisma.js';
import { demoUserId } from '../lib/seedData.js';
export async function findAdminByEmail(email) {
    return prisma.adminUser.findUnique({ where: { email } });
}
export async function getAdminProfileById(id) {
    const admin = await prisma.adminUser.findUnique({ where: { id } });
    if (!admin)
        return null;
    return {
        id: admin.id,
        email: admin.email,
        nickname: admin.nickname,
        role: admin.role,
        permissions: [...admin.permissions],
        status: admin.status
    };
}
export async function touchAdminLastLogin(id) {
    await prisma.adminUser.update({
        where: { id },
        data: { lastLoginAt: new Date() }
    });
}
export async function getDemoUser() {
    const user = await prisma.user.findUnique({ where: { id: demoUserId } });
    if (!user) {
        throw new Error('Demo user not initialized');
    }
    return user;
}
