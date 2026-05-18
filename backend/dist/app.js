import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { registerAdminPanel } from './admin/panel.js';
import { config } from './config.js';
import { AppError } from './lib/http.js';
import { bootstrapDatabase } from './lib/bootstrap.js';
import { registerAdminRoutes } from './modules/adminRoutes.js';
import { registerAppRoutes } from './modules/appRoutes.js';
import { registerAuthRoutes, requireAdmin } from './modules/authRoutes.js';
export async function buildApp(options) {
    const app = Fastify({ logger: options?.logger ?? true });
    if (!options?.skipBootstrap) {
        await bootstrapDatabase();
    }
    await app.register(cors, { origin: true });
    await app.register(jwt, { secret: config.jwtSecret });
    app.decorate('requireAdmin', requireAdmin);
    await registerAuthRoutes(app);
    await registerAppRoutes(app);
    await registerAdminRoutes(app);
    await registerAdminPanel(app);
    app.addHook('onSend', async (request, reply, payload) => {
        if (request.url.startsWith('/admin')) {
            reply.header('Cache-Control', 'no-store, no-cache, must-revalidate');
            reply.header('Pragma', 'no-cache');
            reply.header('Expires', '0');
        }
        return payload;
    });
    app.setErrorHandler((error, request, reply) => {
        request.log.error(error);
        if (error instanceof ZodError) {
            return reply.code(400).send({
                message: '请求参数校验失败',
                issues: error.issues
            });
        }
        if (error instanceof AppError) {
            return reply.code(error.statusCode).send({ message: error.message });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return reply.code(404).send({ message: '资源不存在' });
            }
            if (error.code === 'P2002') {
                return reply.code(409).send({ message: '数据已存在或违反唯一约束' });
            }
        }
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return reply.code(500).send({ message });
    });
    return app;
}
