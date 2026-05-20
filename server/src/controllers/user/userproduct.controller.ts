import { Request, Response } from "express";
import { IProductService } from "../../services/product/product.service.interface";

export class ProductController {
    constructor(private readonly productService: IProductService) {}

    async getProducts(req: Request, res: Response): Promise<void> {
        try {
            const search = req.query.search as string || "";
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const sortField = req.query.sortField as string || "createdAt";
            const sortOrder = parseInt(req.query.sortOrder as string) || -1;
            const productType = req.query.productType as string || undefined;
            const forGender = req.query.for as string || undefined;

            const { data, total } = await this.productService.getProducts(
                search,
                page,
                limit,
                sortField,
                sortOrder,
                productType,
                forGender
            );

            res.status(200).json({
                success: true,
                data,
                total,
                page,
                limit
            });
        } catch (error: any) {
            console.error("Error in getProducts:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch products"
            });
        }
    }
}
