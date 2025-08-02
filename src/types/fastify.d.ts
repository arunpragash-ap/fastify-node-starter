import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      userId: string;
      [key: string]: unknown;
    };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      [key: string]: unknown;
    };
  }
}