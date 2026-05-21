// mapper/order.mapper.ts

import { CreateOrderDto, OrderResponseDto } from "../dtos/OrderDto";
import { IOrder } from "../models/order.model";

export class OrderMapper {
  
  static toEntity(dto: CreateOrderDto): Partial<IOrder> {
    return {
      userId: dto.userId as any,

      productId: dto.productId as any,

      productName: dto.productName,

      productImage: dto.productImage,

      price: dto.price,

      size: dto.size,

      color: dto.color,

      quantity: dto.quantity,

      totalPrice: dto.totalPrice,

      orderStatus: dto.orderStatus || "placed",

      orderedDate: dto.orderedDate || new Date(),

      deliveryDate:
        dto.deliveryDate ||
        (() => {
          const date = new Date();

          date.setDate(date.getDate() + 5);

          return date;
        })(),
    };
  }

  static toResponse(order: IOrder): OrderResponseDto {
    return {
      id: order._id.toString(),

      userId: order.userId.toString(),

      productId: order.productId.toString(),

      productName: order.productName,

      productImage: order.productImage,

      price: order.price,

      size: order.size,

      color: order.color,

      quantity: order.quantity,

      totalPrice: order.totalPrice,

      orderStatus: order.orderStatus,

      orderedDate: order.orderedDate,

      deliveryDate: order.deliveryDate,

      createdAt: order.createdAt,

      updatedAt: order.updatedAt,
    };
  }
}