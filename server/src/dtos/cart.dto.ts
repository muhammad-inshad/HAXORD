export interface CartResponseDto {
  id: string;

  productId: string;

  productName: string;

  productImage: string;

  price: number;

  size: string;

  color: string;

  quantity: number;

  orderedDate: Date;
}