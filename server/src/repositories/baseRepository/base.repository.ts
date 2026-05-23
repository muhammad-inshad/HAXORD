import {
  Document,
  Model,
  type QueryFilter,
  type UpdateQuery,
} from "mongoose";

import { IBaseRepository } from "./base.repository.interface";

export class BaseRepository<T extends Document>
  implements IBaseRepository<T>
{
  constructor(private model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async find(filter: QueryFilter<T>): Promise<T[]> {
    return await this.model.find(filter);
  }

  async findOne(filter: QueryFilter<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

async findAll(): Promise<T[]> {
  return await this.model.find({}).exec();
}

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

    async deleteMany(
    filter: QueryFilter<T>
  ): Promise<void> {
    await this.model.deleteMany(filter);
  }

  async deleteOne(
  filter: QueryFilter<T>
): Promise<void> {

  await this.model.deleteOne(filter);
}
}