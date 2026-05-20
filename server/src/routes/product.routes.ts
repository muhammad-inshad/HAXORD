import { Router } from "express";
import { productController } from "../di/product.di";

const router = Router();

// Route to get products with filtering, sorting, and pagination
router.get("/", productController.getProducts.bind(productController));

export default router;
