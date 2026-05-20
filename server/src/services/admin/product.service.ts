// services/product/product.service.ts

import { IProduct } from "../../models/product.model";
import { IproductRepo } from "../../repositories/Product/product.repository.interface";
import { IProductService } from "./product.service.interface";



export class ProductService implements IProductService {
  constructor(private productRepo: IproductRepo) {}

  async createProduct(
    productData: Partial<IProduct>
  ): Promise<IProduct> {
    const product = await this.productRepo.create(productData);

    return product;
  }

  async getAllProducts(
    search: string,
    page: number,
    limit: number,
    sortField: string,
    sortOrder: number
  ): Promise<{ products: IProduct[], total: number }> {
    const { data, total } = await this.productRepo.findWithFilters(search, page, limit, sortField, sortOrder);
    return { products: data, total };
  }

  async getProductById(
    id: string
  ): Promise<IProduct | null> {
    return await this.productRepo.findById(id);
  }

  async updateProduct(
    id: string,
    productData: Partial<IProduct>
  ): Promise<IProduct | null> {
    return await this.productRepo.update(id, productData);
  }

  async deleteProduct(
    id: string
  ): Promise<IProduct | null> {
    const product = await this.productRepo.findById(id);
    if (!product) return null;
    return await this.productRepo.update(id, { isActive: !product.isActive });
  }
}