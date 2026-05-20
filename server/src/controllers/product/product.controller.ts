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
            const forGender = req.query.forGender as string || undefined;

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
    async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            const created = await this.productService.createProduct(data);
            res.status(201).json({ success: true, data: created });
        } catch (error: any) {
            console.error('Error creating product:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
        }
    }

    async getAllProducts(req: Request, res: Response): Promise<void> {
        // Reuse getProducts with defaults
        await this.getProducts(req, res);
    }

    async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;
            const product = await this.productService.getProductById(id);
            if (!product) {
                res.status(404).json({ success: false, message: 'Product not found' });
                return;
            }
            res.status(200).json({ success: true, data: product });
        } catch (error: any) {
            console.error('Error fetching product by ID:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch product' });
        }
    }

    async updateProduct(req: Request, res: Response): Promise<void> {
        try {
              const id = req.params.id as string;
            const updates = req.body;
            const updated = await this.productService.updateProduct(id, updates);
            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            console.error('Error updating product:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to update product' });
        }
    }

    async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
              const id = req.params.id as string;
            await this.productService.deleteProduct(id);
            res.status(200).json({ success: true, message: 'Product deleted' });
        } catch (error: any) {
            console.error('Error deleting product:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete product' });
        }
    }
}
