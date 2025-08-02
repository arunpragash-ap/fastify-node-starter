import { ILike } from "typeorm";
import { AppDataSource } from "../config/database";
import { Option } from "../entities/Option";

export const OptionRepository = AppDataSource.getRepository(Option).extend({
  async findByTypeAndName(type: string, name: string) {
    return this.findOne({ where: { type, name: ILike(name.trim()) } });
  },

  async findAllMinimal() {
    return this.find({
      select: ["id", "type", "name"],
      order: { id: "ASC" },
    });
  },

  async findByType(type: string) {
    return this.find({
      where: { type },
      select: ["id", "type", "name", "remarks", "status"],
      order: { id: "ASC" },
    });
  },
});
