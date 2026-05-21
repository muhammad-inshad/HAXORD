

import { ProductController } from "../controllers/product/product.controller";
import { CartRepo } from "../repositories/cart/cart.repository";
import { OrderRepo } from "../repositories/order/order.repository";
import { ProdectRepo } from "../repositories/Product/product.repository";
import { UserRepository } from "../repositories/user/user.repository";
import { ProductService } from "../services/product/product.service";


export const adminContiner=()=>{
   
      const prodecRepo= new ProdectRepo()
      const cartRepo=new CartRepo()
      const orderRepo=new OrderRepo()
      const productservice= new ProductService(prodecRepo,cartRepo,orderRepo)
      const productcontroller=new ProductController(productservice)

      return {
        productcontroller,
        productservice,
        prodecRepo
      }
       
}