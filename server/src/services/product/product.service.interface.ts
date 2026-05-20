import { IProduct } from "../../models/product.model";

export interface IProductService {
    getProducts(
        search: string,
        page: number,
        limit: number,
        sortField: string,
        sortOrder: number,
        productType?: string,
        forGender?: string
    ): Promise<{ data: IProduct[], total: number }>;
    createProduct(data: Partial<IProduct>): Promise<IProduct>;
    getProductById(id: string): Promise<IProduct | null>;
    updateProduct(id: string, updates: Partial<IProduct>): Promise<IProduct | null>;
    deleteProduct(id: string): Promise<void>;
}
