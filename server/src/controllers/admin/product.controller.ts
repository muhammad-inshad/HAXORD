// controllers/product/product.controller.ts

import { Request, Response } from "express";
import { IProductService } from "../../services/admin/product.service.interface";


export class ProductController {
  constructor(
    private productService: IProductService
  ) {}

  async createProduct(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const data = { ...req.body };

      // Map uploaded Cloudinary image
      if (req.file) {
        data.images = [req.file.path];
      }

      // Convert numbers
      if (data.price !== undefined) data.price = Number(data.price);
      if (data.stock !== undefined) data.stock = Number(data.stock);

      // Parse arrays
      if (typeof data.sizes === 'string') {
        try {
          data.sizes = JSON.parse(data.sizes);
        } catch {
          data.sizes = data.sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      if (typeof data.colors === 'string') {
        try {
          data.colors = JSON.parse(data.colors);
        } catch {
          data.colors = data.colors.split(',').map((c: string) => c.trim()).filter(Boolean);
        }
      }

      const product = await this.productService.createProduct(
        data
      );

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      console.error("Failed to create product:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create product",
      });
    }
  }

  async getAllProducts(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const sortField = (req.query.sortField as string) || "createdAt";
      const sortOrder = parseInt(req.query.sortOrder as string) || -1;

      const { products, total } =
        await this.productService.getAllProducts(search, page, limit, sortField, sortOrder);

      res.status(200).json({
        success: true,
        products,
        total,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  }

  async getProductById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
     const id = req.params.id as string;

      const product =
        await this.productService.getProductById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
      });
    }
  }

  async updateProduct(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = { ...req.body };

      // Map uploaded Cloudinary image if a new one is selected
      if (req.file) {
        data.images = [req.file.path];
      } else if (data.images) {
        if (typeof data.images === 'string') {
          try {
            data.images = JSON.parse(data.images);
          } catch {
            data.images = data.images.split(',').map((i: string) => i.trim()).filter(Boolean);
          }
        }
      }

      // Convert numbers
      if (data.price !== undefined) data.price = Number(data.price);
      if (data.stock !== undefined) data.stock = Number(data.stock);

      // Parse arrays
      if (typeof data.sizes === 'string') {
        try {
          data.sizes = JSON.parse(data.sizes);
        } catch {
          data.sizes = data.sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      if (typeof data.colors === 'string') {
        try {
          data.colors = JSON.parse(data.colors);
        } catch {
          data.colors = data.colors.split(',').map((c: string) => c.trim()).filter(Boolean);
        }
      }

      const updatedProduct =
        await this.productService.updateProduct(
          id,
          data
        );

      if (!updatedProduct) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        updatedProduct,
      });
    } catch (error) {
      console.error("Failed to update product:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }
  }

  async deleteProduct(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const id = req.params.id as string;

      const deletedProduct =
        await this.productService.deleteProduct(id);

      if (!deletedProduct) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
    }
  }
}