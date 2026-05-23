import { Request, Response } from "express";
import { IProductService } from "../../services/product/product.service.interface";

export class ProductController {
    constructor(private readonly productService: IProductService) {}

    async getProducts(req: Request, res: Response): Promise<void> {
        try {
            const search = req.query.search as string || "";
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const sortField = req.query.sortField as string || "createdAt";
            const sortOrder = parseInt(req.query.sortOrder as string) || -1;
            const productType = req.query.productType as string || undefined;
           const forGender = req.query.for as string || undefined;   // ← Correct

            const { data, total } = await this.productService.getProducts(
                search,
                page,
                limit,
                sortField,
                sortOrder,
                productType,
                forGender
            );

            res.status(200).json({
                success: true,
                data,
                total,
                page,
                limit
            });
        } catch (error: any) {
            console.error("Error in getProducts:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch products"
            });
        }
    }
    async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            const created = await this.productService.createProduct(data);
            res.status(201).json({ success: true, data: created });
        } catch (error: any) {
            console.error('Error creating product:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
        }
    }

    async getAllProducts(req: Request, res: Response): Promise<void> {

        await this.getProducts(req, res);
    }

    async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;
            const product = await this.productService.getProductById(id);
            if (!product) {
                res.status(404).json({ success: false, message: 'Product not found' });
                return;
            }
            res.status(200).json({ success: true, data: product });
        } catch (error: any) {
            console.error('Error fetching product by ID:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch product' });
        }
    }

    async updateProduct(req: Request, res: Response): Promise<void> {
        try {
              const id = req.params.id as string;
            const updates = req.body;
            const updated = await this.productService.updateProduct(id, updates);
            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            console.error('Error updating product:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to update product' });
        }
    }

    async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
              const id = req.params.id as string;
            await this.productService.deleteProduct(id);
            res.status(200).json({ success: true, message: 'Product deleted' });
        } catch (error: any) {
            console.error('Error deleting product:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete product' });
        }
    }

  async addToCart(req: Request, res: Response) {
    try {
      const data = req.body;
      const id = req.user?.id;

      if (!id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await this.productService.addToCart(data, id);

      return res.status(200).json({
        success: true,
        message: "Product added to cart",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
        error,
      });
    }
  }

async getCart(req: Request, res: Response) {
  try {

    const id = req.user?.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await this.productService.getCart(id);

    return res.status(200).json({
      success: true,
      cart: result,
    });

  } catch (error: any) {

    console.error("Get Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch cart",
    });
  }
}

async reomovecart(req: Request, res: Response) {

  try {


    const cartId = req.params.id as string;


    await this.productService.reomovecart(
     cartId
    );

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });

  } catch (error: any) {

    console.error("Remove Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove cart item",
    });
  }
}

async updatQuntyty(req: Request, res: Response) {

  try {

    const cartId = req.params.id as string;

    const { quantity } = req.body;

    await this.productService.updatQuntyty(
      cartId,
      quantity
    );

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
    });

  } catch (error: any) {

    console.error("Update Quantity Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update quantity",
    });
  }
}

async checkout(req: Request, res: Response){
    try {
        const id = req.user?.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
        const total=req.body.price
        const resul=this.productService.checkout(total,id)
        return res.status(200).json({
          success:true,
                message: "successfull",
        })
    } catch (error) {
            return res.status(500).json({
      success: false,
      message:
       "Failed to update cheackoutt",
    });
    }
}

async getOrders(req: Request, res: Response) {
  try {

    const result = await this.productService.getOrders();

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: result,
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });

  }
}
async addAddress(req: Request, res: Response) {
  try {

     const userId = req.user?.id;
     if(!userId){
      return
     }

    const result = await this.productService.addAddress(userId,req.body);

    return res.status(200).json({
      success: true,
      message: "address added successfully",
      data: result,
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });

  }
}

async getorderUser(req:Request,res:Response){
  try {
     const userId = req.user?.id;
     if(!userId){
      return
     }
      const result = await this.productService.getorderUser(userId);

      return res.status(200).json({
      success: true,
      message: "successfull",
      data: result,
    });
  } catch (error:any) {
      return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });

  }
}

async wishlist(req:Request,res:Response){
  try {
    const { productId } = req.body;
     const userId = req.user?.id;
     if(!userId){
      return
     }
  
      const result = await this.productService.wishlistadd(userId,productId);

return res.status(200).json({
      success: true,
      message: "successfull",
      data: result,
    });
  } catch (error) {
       return res.status(500).json({
      success: false,
      message:  "Something went wrong",
    });
  }
}

async wishlistDelete(req:Request,res:Response){
  try {
const id=  req.params.id as string
if(!id){
  return
}
 const userId = req.user?.id;
     if(!userId){
      return
     }
       const result = await this.productService.wishlistDelete(userId,id);

return res.status(200).json({
      success: true,
      message: "successfull",
      data: result,
    });
  } catch (error) {
          return res.status(500).json({
      success: false,
      message:  "Something went wrong",
    });
  }
}

async getwishlist(req:Request,res:Response){
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await this.productService.getwishlist(userId);

    return res.status(200).json({
      success: true,
      message: "successfull",
      data: result,
    });
  } catch (error) {
            return res.status(500).json({
      success: false,
      message:  "Something went wrong",
    });
  }
}
}