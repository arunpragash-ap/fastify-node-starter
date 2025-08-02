import { FastifyInstance } from "fastify";
import { OptionService } from "../../services/OptionService";
import { authenticate } from "../../middleware/auth";

export default async function optionRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate)
  fastify.post("/", async (request, reply) => {
    console.log(`\n\n\n\n ${JSON.stringify(request.user)}\n\n\n`);
    try {
      const result = await OptionService.createOrUpdate(request.body as any, request.user.userId);
      return reply.code(200).send(result);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message });
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
