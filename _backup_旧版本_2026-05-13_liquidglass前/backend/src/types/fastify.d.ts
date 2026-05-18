import 'fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticatedAdmin } from '../lib/auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    admin?: AuthenticatedAdmin;
  }

  interface FastifyInstance {
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
