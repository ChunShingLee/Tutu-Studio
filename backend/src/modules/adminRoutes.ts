import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { adminPermissions } from '../lib/permissions.js';
import {
  createPlan,
  createTemplate,
  getAdminMetrics,
  getAdminSettings,
  listAdminUsers,
  listAuditLogs,
  listContentQueue,
  listJobs,
  listPaymentOrders,
  listPlans,
  listSubscriptions,
  listTemplates,
  listUsers,
  reviewContentItem,
  runJobAction,
  updateAdminSettings,
  updatePaymentOrder,
  updatePlan,
  updateSubscription,
  updateTemplate,
  updateTemplateStatus,
  updateUser
} from '../services/adminService.js';
import { requirePermission } from './authRoutes.js';
import {
  adminContentReviewSchema,
  adminJobActionSchema,
  adminPaymentOrderUpdateSchema,
  adminPlanCreateSchema,
  adminPlanUpdateSchema,
  adminSettingsUpdateSchema,
  adminSubscriptionUpdateSchema,
  adminTemplateCreateSchema,
  adminTemplateStatusSchema,
  adminTemplateUpdateSchema,
  adminUserUpdateSchema
} from './schemas.js';

const contentEntityTypeSchema = z.enum(['TEMPLATE', 'ASSET', 'COMMUNITY_POST']);

export async function registerAdminRoutes(app: FastifyInstance) {
  app.get('/api/admin/metrics', { preHandler: [requirePermission(adminPermissions.metricsRead)] }, async () => getAdminMetrics());

  app.get('/api/admin/users', { preHandler: [requirePermission(adminPermissions.usersRead)] }, async () => listUsers());

  app.patch('/api/admin/users/:id', { preHandler: [requirePermission(adminPermissions.usersWrite)] }, async (request) => {
    const { id } = request.params as { id: string };
    const body = adminUserUpdateSchema.parse(request.body);
    return updateUser(id, body, request.admin?.id);
  });

  app.get('/api/admin/operators', { preHandler: [requirePermission(adminPermissions.usersRead)] }, async () => listAdminUsers());

  app.get('/api/admin/templates', { preHandler: [requirePermission(adminPermissions.templatesRead)] }, async () => listTemplates());

  app.post('/api/admin/templates', { preHandler: [requirePermission(adminPermissions.templatesWrite)] }, async (request, reply) => {
    const body = adminTemplateCreateSchema.parse(request.body);
    const template = await createTemplate(body, request.admin?.id);
    reply.code(201);
    return template;
  });

  app.patch('/api/admin/templates/:id', { preHandler: [requirePermission(adminPermissions.templatesWrite)] }, async request => {
    const { id } = request.params as { id: string };
    const body = adminTemplateUpdateSchema.parse(request.body);
    return updateTemplate(id, body, request.admin?.id);
  });

  app.patch('/api/admin/templates/:id/status', { preHandler: [requirePermission(adminPermissions.templatesWrite)] }, async request => {
    const { id } = request.params as { id: string };
    const body = adminTemplateStatusSchema.parse(request.body);
    return updateTemplateStatus(id, body.status, request.admin?.id);
  });

  app.get('/api/admin/settings', { preHandler: [requirePermission(adminPermissions.settingsRead)] }, async () => getAdminSettings());

  app.patch('/api/admin/settings', { preHandler: [requirePermission(adminPermissions.settingsWrite)] }, async request => {
    const body = adminSettingsUpdateSchema.parse(request.body);
    return updateAdminSettings(body, request.admin?.id);
  });

  app.get('/api/admin/audit-logs', { preHandler: [requirePermission(adminPermissions.auditsRead)] }, async () => listAuditLogs());

  app.get('/api/admin/jobs', { preHandler: [requirePermission(adminPermissions.jobsRead)] }, async () => listJobs());

  app.post('/api/admin/jobs/:id/actions', { preHandler: [requirePermission(adminPermissions.jobsWrite)] }, async request => {
    const { id } = request.params as { id: string };
    const body = adminJobActionSchema.parse(request.body);
    return runJobAction(id, body.action, request.admin?.id);
  });

  app.get('/api/admin/plans', { preHandler: [requirePermission(adminPermissions.subscriptionsRead)] }, async () => listPlans());

  app.post('/api/admin/plans', { preHandler: [requirePermission(adminPermissions.subscriptionsWrite)] }, async (request, reply) => {
    const body = adminPlanCreateSchema.parse(request.body);
    const plan = await createPlan(body, request.admin?.id);
    reply.code(201);
    return plan;
  });

  app.patch('/api/admin/plans/:id', { preHandler: [requirePermission(adminPermissions.subscriptionsWrite)] }, async request => {
    const { id } = request.params as { id: string };
    const body = adminPlanUpdateSchema.parse(request.body);
    return updatePlan(id, body, request.admin?.id);
  });

  app.get('/api/admin/subscriptions', { preHandler: [requirePermission(adminPermissions.subscriptionsRead)] }, async () => listSubscriptions());

  app.patch('/api/admin/subscriptions/:id', { preHandler: [requirePermission(adminPermissions.subscriptionsWrite)] }, async request => {
    const { id } = request.params as { id: string };
    const body = adminSubscriptionUpdateSchema.parse(request.body);
    return updateSubscription(id, body, request.admin?.id);
  });

  app.get('/api/admin/payment-orders', { preHandler: [requirePermission(adminPermissions.subscriptionsRead)] }, async () => listPaymentOrders());

  app.patch('/api/admin/payment-orders/:id', { preHandler: [requirePermission(adminPermissions.subscriptionsWrite)] }, async request => {
    const { id } = request.params as { id: string };
    const body = adminPaymentOrderUpdateSchema.parse(request.body);
    return updatePaymentOrder(id, body, request.admin?.id);
  });

  app.get('/api/admin/content-items', { preHandler: [requirePermission(adminPermissions.reviewsRead)] }, async () => listContentQueue());

  app.post('/api/admin/content-items/:entityType/:id/review', { preHandler: [requirePermission(adminPermissions.reviewsWrite)] }, async request => {
    const { entityType, id } = request.params as { entityType: string; id: string };
    const parsedEntityType = contentEntityTypeSchema.parse(entityType);
    const body = adminContentReviewSchema.parse(request.body);
    return reviewContentItem(parsedEntityType, id, body, request.admin?.id);
  });
}
