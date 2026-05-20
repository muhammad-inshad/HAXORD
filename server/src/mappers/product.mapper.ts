import { ProductDTO } from "../dtos/product.dto";

import { IProduct } from "../models/product.model";

export class ProductMapper {
  static toDTO(product: IProduct): ProductDTO {
    return {
      id: product._id.toString(),

      productName: product.productName,

      productType: product.productType,

      brandName: product.brandName,

      for: product.for,

      description: product.description,

      price: product.price,

      stock: product.stock,

      sizes: product.sizes,

      colors: product.colors,

      images: product.images,

      isActive: product.isActive,

      createdAt: product.createdAt,

      updatedAt: product.updatedAt,
    };
  }

  static toDTOList(products: IProduct[]): ProductDTO[] {
    return products.map((product) =>
      this.toDTO(product)
    );
  }
}