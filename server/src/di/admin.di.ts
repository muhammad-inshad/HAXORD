

import { ProductController } from "../controllers/product/product.controller";
import { ProdectRepo } from "../repositories/Product/product.repository";
import { UserRepository } from "../repositories/user/user.repository";
import { ProductService } from "../services/product/product.service";


export const adminContiner=()=>{
   
      const prodecRepo= new ProdectRepo()
      const productservice= new ProductService(prodecRepo)
      const productcontroller=new ProductController(productservice)

      return {
        productcontroller,
        productservice,
        prodecRepo
      }
       
}