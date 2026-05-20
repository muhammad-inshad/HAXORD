import { IProduct } from "../../models/product.model";
import { IBaseRepository } from "../baseRepository/base.repository.interface";

export interface IproductRepo extends IBaseRepository<IProduct> {
  findWithFilters(search: string, page: number, limit: number, sortField: string, sortOrder: number, productType?: string, forGender?: string): Promise<{ data: IProduct[], total: number }>;
  create(data: Partial<IProduct>): Promise<IProduct>;
  findById(id: string): Promise<IProduct | null>;
  update(id: string, data: Partial<IProduct>): Promise<IProduct | null>;
  delete(id: string): Promise<IProduct | null>;
}
