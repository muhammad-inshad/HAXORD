import { IProduct } from "../../models/product.model";

export interface IProductService {
  createProduct(
    productData: Partial<IProduct>
  ): Promise<IProduct>;

  getAllProducts(
    search: string,
    page: number,
    limit: number,
    sortField: string,
    sortOrder: number
  ): Promise<{ products: IProduct[], total: number }>;

  getProductById(id: string): Promise<IProduct | null>;

  updateProduct(
    id: string,
    productData: Partial<IProduct>
  ): Promise<IProduct | null>;

  deleteProduct(id: string): Promise<IProduct | null>;
}