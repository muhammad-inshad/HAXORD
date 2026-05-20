import { IProduct } from "../../models/product.model";
import { IproductRepo } from "../../repositories/Product/product.repository.interface";
import { IProductService } from "./product.service.interface";

export class ProductService implements IProductService {
    constructor(private readonly productRepository: IproductRepo) {}

    async getProducts(
        search: string = "",
        page: number = 1,
        limit: number = 50,
        sortField: string = "createdAt",
        sortOrder: number = -1,
        productType?: string,
        forGender?: string
    ): Promise<{ data: IProduct[], total: number }> {
        return this.productRepository.findWithFilters(
            search,
            page,
            limit,
            sortField,
            sortOrder,
            productType,
            forGender
        );
    }
    async createProduct(data: Partial<IProduct>): Promise<IProduct> {
        // Assuming repository has a create method
        return this.productRepository.create(data as IProduct);
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return this.productRepository.findById(id);
    }

    async updateProduct(id: string, updates: Partial<IProduct>): Promise<IProduct | null> {
        return this.productRepository.update(id, updates as any);
    }

    async deleteProduct(id: string): Promise<void> {
        await this.productRepository.delete(id);
    }
}
