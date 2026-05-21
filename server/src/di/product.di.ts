import { ProdectRepo } from "../repositories/Product/product.repository";
import { ProductService } from "../services/product/product.service";
import { ProductController } from "../controllers/product/product.controller";
import { CartRepo } from "../repositories/cart/cart.repository";
import { OrderRepo } from "../repositories/order/order.repository";

const productRepo = new ProdectRepo();
const cartRepo=new CartRepo()
const orderRepo=new OrderRepo()
const productService = new ProductService(productRepo,cartRepo,orderRepo);
const productController = new ProductController(productService);

export { productController };
