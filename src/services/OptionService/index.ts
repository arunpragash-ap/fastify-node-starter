import { Option } from "../../entities/Option";
import { OptionRepository } from "../../repositories/option.repository";
import { CreateOrUpdateOptionDTO } from "../../types/options";


export class OptionService {
  static async createOrUpdate(data: CreateOrUpdateOptionDTO, userId: string) {
    
    if (!data.id || data.id === 0) {
      // Create flow
      const exists = await OptionRepository.findByTypeAndName(data.type, data.name!);
      if (exists) {
        throw new Error(`Option already exists for type: ${data.type}`);
      }
      const option = OptionRepository.create({...data as Option, createdBy:userId});
      return await OptionRepository.save(option);
    } else {
      // Update flow
      const option = await OptionRepository.findOne({ where: { id: data.id } });
      if (!option) throw new Error("Option not found");

      let updated = false;
      if (data.name !== undefined) {
        option.name = data.name;
        updated = true;
      }
      if (data.remarks !== undefined) {
        option.remarks = data.remarks;
        updated = true;
      }
      if (data.status !== undefined) {
        option.status = data.status;
        updated = true;
      }
      option.updatedBy = userId;
      if (!updated) {
        throw new Error("No fields to update");
      }

      return await OptionRepository.save(option);
    }
  }

  static async getAllMinimal() {
    return await OptionRepository.findAllMinimal();
  }

  static async getByType(type: string) {
    return await OptionRepository.findByType(type);
  }
}
