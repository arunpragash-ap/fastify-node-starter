import { FastifyRequest, FastifyReply } from 'fastify';

export const validateRequest = (_schema: unknown) => async (_request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
  // TODO: Implement request validation using Zod
  return;
};
