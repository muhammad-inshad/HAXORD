import { ProdectRepo } from "../repositories/Product/product.repository";
import { ProductService } from "../services/product/product.service";
import { ProductController } from "../controllers/product/product.controller";

const productRepo = new ProdectRepo();
const productService = new ProductService(productRepo);
const productController = new ProductController(productService);

export { productController };
