import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { productController } from "../di/product.di";


const userrouter = express.Router();

userrouter.use(authMiddleware);
userrouter.get("/products", productController.getProducts.bind(productController));
userrouter.post("/cart", productController.addToCart.bind(productController));
userrouter.get("/cart", productController.getCart.bind(productController));
userrouter.delete("/cart/:id",productController.reomovecart.bind(productController))
userrouter.put("/cart/:id",productController.updatQuntyty.bind(productController))
userrouter.post("/checkout",productController.checkout.bind(productController))
userrouter.post("/address",productController.addAddress.bind(productController))

export default userrouter;