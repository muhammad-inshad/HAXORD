import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {adminContiner} from "../di/admin.di"


const adminrouter = express.Router();


adminrouter.use(authMiddleware);

const admin = adminContiner();
adminrouter.post("/products", admin.productcontroller.createProduct.bind(admin.productcontroller));
adminrouter.get("/products", admin.productcontroller.getAllProducts.bind(admin.productcontroller));
adminrouter.get("/products/:id", admin.productcontroller.getProductById.bind(admin.productcontroller));
adminrouter.put("/products/:id", admin.productcontroller.updateProduct.bind(admin.productcontroller));
adminrouter.delete("/products/:id", admin.productcontroller.deleteProduct.bind(admin.productcontroller));

export default adminrouter;