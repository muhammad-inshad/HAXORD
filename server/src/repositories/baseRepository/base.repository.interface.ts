import { QueryFilter, UpdateQuery } from "mongoose";

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findOne(filter: QueryFilter<T>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
}