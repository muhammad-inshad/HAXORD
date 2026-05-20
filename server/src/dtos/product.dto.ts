// dtos/product.dto.ts

export interface ProductDTO {
  id: string;

  productName: string;

  productType:
    | "shirt"
    | "tshirt"
    | "pant"
    | "hat"
    | "hoodie";

  brandName: string;

  for: "men" | "women";

  description: string;

  price: number;

  stock: number;

  sizes: string[];

  colors: string[];

  images: string[];

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}