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
      const product = await this.productService.createProduct(
        req.body
      );

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
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
      const updatedProduct =
        await this.productService.updateProduct(
          id,
          req.body
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