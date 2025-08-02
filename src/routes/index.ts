
import { FastifyInstance } from 'fastify';
import authRoutes from './authRoutes';
import usersRoutes from './users';
import mfaRoutes from './mfa/index';
import optionRoutes from './optionRoutes/option.routes';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    return { route: 'index' };
  });

fastify.register(authRoutes, { prefix: "/auth" });
fastify.register(usersRoutes, { prefix: "/users" });
fastify.register(mfaRoutes, { prefix: "/auth/mfa" });
fastify.register(optionRoutes, { prefix: "/options" });
}
