import mongoose from "mongoose";
import { ICartData } from "../../interface/ICartData";
import { IProduct } from "../../models/product.model";

import { IproductRepo } from "../../repositories/Product/product.repository.interface";
import { IProductService } from "./product.service.interface";
import { CartResponseDto } from "../../dtos/cart.dto";
import { CartMapper } from "../../mappers/cart.mapper";
import { ICartRepo } from "../../repositories/cart/cart.repository.interface";
import { IorderRepo } from "../../repositories/order/order.repository.interface";
import { OrderResponseDto } from "../../dtos/OrderDto";
import { OrderMapper } from "../../mappers/OrderMapper";

import { IUserRepository } from "../../repositories/user/user.repository.interface";

export class ProductService implements IProductService {
    constructor(private readonly productRepository: IproductRepo,private readonly cartRepo:ICartRepo,private readonly orderRepo:IorderRepo,private readonly userRepo:IUserRepository) {}

    async getProducts(
        search: string = "",
        page: number = 1,
        limit: number = 50,
        sortField: string = "createdAt",
        sortOrder: number = -1,
        productType?: string,
        forGender?: string
    ): Promise<{ data: IProduct[], total: number }> {
        return this.productRepository.findWithFilters(
            search,
            page,
            limit,
            sortField,
            sortOrder,
            productType,
            forGender
        );
    }
    async createProduct(data: Partial<IProduct>): Promise<IProduct> {
        // Assuming repository has a create method
        return this.productRepository.create(data as IProduct);
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return this.productRepository.findById(id);
    }

    async updateProduct(id: string, updates: Partial<IProduct>): Promise<IProduct | null> {
        return this.productRepository.update(id, updates as any);
    }

    async deleteProduct(id: string): Promise<void> {
        await this.productRepository.delete(id);
    }
async addToCart(data: ICartData, id: string): Promise<void> {

  // find product
  const product = await this.productRepository.findOne({
    _id: data.productId,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock < data.quantity) {
    throw new Error("Insufficient stock");
  }

  await this.cartRepo.create({
    userId: new mongoose.Types.ObjectId(id),

    productId: new mongoose.Types.ObjectId(data.productId),

    productName: product.productName,

    productImage: product.images[0],

    price: product.price,

    size: data.size,

    color: data.color,

    quantity: data.quantity,

    orderedDate: new Date(),
  });
}
async getCart(id: string): Promise<CartResponseDto[]> {

  const cart = await this.cartRepo.find({
    userId: id,
  });

  return cart.map((item) =>
    CartMapper.toCartResponse(item)
  );
}

async reomovecart(
  cartId: string
): Promise<void> {

  const product = await this.cartRepo.delete(
    cartId
  );

  if (!product) {
    throw new Error("Cart item not found");
  }
}

async updatQuntyty(
  cartId: string,
  quantity: number
): Promise<void> {

  const cart = await this.cartRepo.findOne({
    _id: cartId,
  });

  if (!cart) {
    throw new Error("Cart item not found");
  }

  const product = await this.productRepository.findOne({
    _id: cart.productId,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (quantity > product.stock) {
    throw new Error("Insufficient stock");
  }

  await this.cartRepo.update(cartId, {
    quantity: quantity,
  });
}
async checkout(total: number, id: string): Promise<void> {

  const cartItems = await this.cartRepo.find({
    userId: id,
  });

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  for (const item of cartItems) {

    const product = await this.productRepository.findById(
      item.productId.toString()
    );

    if (!product) {
      throw new Error(
        `Product ${item.productName} no longer exists.`
      );
    }

    if (!product.isActive) {
      throw new Error(
        `Product ${item.productName} is currently unavailable.`
      );
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${item.productName}. Only ${product.stock} left.`
      );
    }

    // reduce stock
    await this.productRepository.update(
      item.productId.toString(),
      {
        stock: product.stock - item.quantity,
      }
    );

    // create order
    await this.orderRepo.create({

      userId: item.userId,

      productId: item.productId,

      productName: item.productName,

      productImage: item.productImage,

      price: item.price,

      size: item.size,

      color: item.color,

      quantity: item.quantity,

      totalPrice: item.price * item.quantity,

      orderStatus: "placed",

      orderedDate: new Date(),

      deliveryDate: (() => {
        const date = new Date();

        date.setDate(date.getDate() + 5);

        return date;
      })(),
    });
  }

  await this.cartRepo.deleteMany({
    userId: id,
  });
}

async getOrders(): Promise<OrderResponseDto[]> {

  const result = await this.orderRepo.findAll();
  
  return result.map((order) =>
    OrderMapper.toResponse(order)
  );
}

async addAddress(userId: string, addressData: any): Promise<any> {

  const user = await this.userRepo.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.address.push({
    fullName: addressData.fullName,
    phone: addressData.phone,
    houseName: addressData.houseName,
    city: addressData.city,
    state: addressData.state,
    pincode: addressData.pincode,
    country: addressData.country,
  });

  await user.save();

  return user;
}

}
