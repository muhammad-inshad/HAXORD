import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { productController } from "../di/product.di";


const userrouter = express.Router();
userrouter.get("/products", productController.getProducts.bind(productController));

export default userrouter;