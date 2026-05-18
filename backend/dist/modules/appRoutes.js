import { serializeAsset, serializeJob, serializeTemplate, serializeUser } from '../lib/serializers.js';
import { createGenerationJob, getCurrentUser, getGenerationJobById, listPublicTemplates, listUserAssets, listUserJobs } from '../services/appService.js';
import { generationSchema } from './schemas.js';
export async function registerAppRoutes(app) {
    app.get('/api/health', async () => ({ ok: true, service: 'tutu-vision-backend' }));
    app.get('/api/me', async () => {
        const user = await getCurrentUser();
        return serializeUser(user);
    });
    app.get('/api/templates', async () => {
        const data = await listPublicTemplates();
        return {
            categories: data.categories,
            templates: data.templates.map(serializeTemplate)
        };
    });
    app.get('/api/assets', async () => {
        const assets = await listUserAssets();
        return assets.map(serializeAsset);
    });
    app.get('/api/generation-jobs', async () => {
        const jobs = await listUserJobs();
        return jobs.map(serializeJob);
    });
    app.post('/api/generation-jobs', async (request, reply) => {
        const body = generationSchema.parse(request.body);
        const job = await createGenerationJob(body);
        reply.code(202);
        return serializeJob(job);
    });
    app.get('/api/generation-jobs/:id', async (request, reply) => {
        const { id } = request.params;
        const job = await getGenerationJobById(id);
        if (!job)
            return reply.code(404).send({ message: 'job not found' });
        return serializeJob(job);
    });
}
