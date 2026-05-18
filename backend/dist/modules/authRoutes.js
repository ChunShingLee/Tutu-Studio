import bcrypt from 'bcryptjs';
import { AppError } from '../lib/http.js';
import { serializeUser } from '../lib/serializers.js';
import { findAdminByEmail, getAdminProfileById, getDemoUser, touchAdminLastLogin } from '../services/authService.js';
import { adminLoginSchema } from './schemas.js';
const TOKEN_TTL = '8h';
export async function registerAuthRoutes(app) {
    app.post('/api/admin/auth/login', async (request) => {
        const body = adminLoginSchema.parse(request.body);
        const email = body.email.trim().toLowerCase();
        const admin = await findAdminByEmail(email);
        if (!admin || admin.status !== 'ACTIVE' || !bcrypt.compareSync(body.password, admin.passwordHash)) {
            throw new AppError(401, '账号或密码错误');
        }
        await touchAdminLastLogin(admin.id);
        const profile = {
            id: admin.id,
            email: admin.email,
            nickname: admin.nickname,
            role: admin.role,
            permissions: [...admin.permissions],
            status: admin.status
        };
        return {
            token: app.jwt.sign({ id: profile.id }, { expiresIn: TOKEN_TTL }),
            admin: profile
        };
    });
    app.get('/api/admin/auth/me', { preHandler: [requireAdmin] }, async (request) => request.admin);
    app.post('/api/auth/dev-login', async () => {
        const user = await getDemoUser();
        return {
            token: app.jwt.sign({ id: user.id, email: user.email, role: 'USER' }, { expiresIn: TOKEN_TTL }),
            user: serializeUser(user)
        };
    });
}
export async function requireAdmin(request, reply) {
    try {
        const decoded = await request.jwtVerify();
        if (!decoded.id) {
            return reply.code(401).send({ message: '请先登录后台管理系统' });
        }
        const admin = await getAdminProfileById(decoded.id);
        if (!admin || admin.status !== 'ACTIVE') {
            return reply.code(401).send({ message: '请先登录后台管理系统' });
        }
        request.admin = admin;
    }
    catch {
        return reply.code(401).send({ message: '请先登录后台管理系统' });
    }
}
export function requirePermission(permission) {
    return async function permissionGuard(request, reply) {
        await requireAdmin(request, reply);
        if (reply.sent)
            return;
        if (!request.admin)
            return reply.code(401).send({ message: '请先登录后台管理系统' });
        if (request.admin.role === 'ADMIN')
            return;
        if (!request.admin.permissions.includes(permission)) {
            return reply.code(403).send({ message: `缺少权限：${permission}` });
        }
    };
}
