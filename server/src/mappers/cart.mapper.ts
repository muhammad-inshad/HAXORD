import { CartResponseDto } from "../dtos/cart.dto";
import { ICart } from "../models/cart.model";

export class CartMapper {

  static toCartResponse(cart: ICart): CartResponseDto {
    return {
      id: cart._id.toString(),

      productId: cart.productId.toString(),

      productName: cart.productName,

      productImage: cart.productImage,

      price: cart.price,

      size: cart.size,

      color: cart.color,

      quantity: cart.quantity,

      orderedDate: cart.orderedDate,
    };
  }
}