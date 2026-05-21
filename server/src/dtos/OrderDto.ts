// dto/order.dto.ts

export interface CreateOrderDto {
  userId: string;

  productId: string;

  productName: string;

  productImage: string;

  price: number;

  size: string;

  color: string;

  quantity: number;

  totalPrice: number;

  orderStatus?: "placed" | "delivered";

  orderedDate?: Date;

  deliveryDate?: Date;
}

export interface OrderResponseDto {
  id: string;

  userId: string;

  productId: string;

  productName: string;

  productImage: string;

  price: number;

  size: string;

  color: string;

  quantity: number;

  totalPrice: number;

  orderStatus: "placed" | "delivered";

  orderedDate: Date;

  deliveryDate: Date;

  createdAt: Date;

  updatedAt: Date;
}