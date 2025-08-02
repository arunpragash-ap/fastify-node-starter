import { FastifyInstance } from "fastify";
import { OptionService } from "../../services/OptionService";
import { authenticate } from "../../middleware/auth";

export default async function optionRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("preHandler", authenticate)
  fastify.post("/", async (request, reply) => {
    try {
      const result = await OptionService.createOrUpdate(request.body as Record<string, unknown>, request.user!.userId);
      return reply.code(200).send(result);
    } catch (err: unknown) {
      const error = err as { message?: string };
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.get("/", async (_, reply) => {
    const result = await OptionService.getAllMinimal();
    return reply.code(200).send(result);
  });

  fastify.get("/:type", async (request, reply) => {
    const { type } = request.params as { type: string };
    const result = await OptionService.getByType(type);
    return reply.code(200).send(result);
  });
}
