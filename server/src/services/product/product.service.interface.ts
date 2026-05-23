import { CartResponseDto } from "../../dtos/cart.dto";
import { OrderResponseDto } from "../../dtos/OrderDto";
import { ICartData } from "../../interface/ICartData";
import { IProduct } from "../../models/product.model";
import { IWishlist } from "../../models/wishlist.model";

export interface IProductService {
    getProducts(
        search: string,
        page: number,
        limit: number,
        sortField: string,
        sortOrder: number,
        productType?: string,
        forGender?: string
    ): Promise<{ data: IProduct[], total: number }>;
    createProduct(data: Partial<IProduct>): Promise<IProduct>;
    getProductById(id: string): Promise<IProduct | null>;
    updateProduct(id: string, updates: Partial<IProduct>): Promise<IProduct | null>;
    deleteProduct(id: string): Promise<void>;
    addToCart(data: ICartData, id:string): Promise<void>;
   getCart(id: string): Promise<CartResponseDto[]>;
   reomovecart(
  cartId: string
): Promise<void>;
updatQuntyty(cartId:string,quantity:number):Promise<void>;
checkout(total:number,id:string):Promise<void>;
getOrders():Promise<OrderResponseDto[]>
addAddress(user:string,addressData: any): Promise<void>;
getorderUser(userId:string):Promise<OrderResponseDto[]>
wishlistadd(userId:string,productId:string):Promise<boolean>
getwishlist(userId: string):Promise<IWishlist[]>
wishlistDelete(userId: string,id:String):Promise<boolean>
  }
