import { ProdectRepo } from "../repositories/Product/product.repository";
import { ProductService } from "../services/product/product.service";
import { ProductController } from "../controllers/product/product.controller";
import { CartRepo } from "../repositories/cart/cart.repository";
import { OrderRepo } from "../repositories/order/order.repository";
import { UserRepository } from "../repositories/user/user.repository";

const productRepo = new ProdectRepo();
const cartRepo=new CartRepo()
const orderRepo=new OrderRepo()
 const userRepository = new UserRepository();
const productService = new ProductService(productRepo,cartRepo,orderRepo,userRepository);
const productController = new ProductController(productService);

export { productController };
