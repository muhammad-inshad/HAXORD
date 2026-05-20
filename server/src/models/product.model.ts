// models/product.model.ts

import mongoose, { Schema, Document } from "mongoose";
export interface IProduct extends Document {
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

const productSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productType: {
      type: String,
      enum: ["shirt", "tshirt", "pant", "hat", "hoodie"],
      required: true,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
    },

    for: {
      type: String,
      enum: ["men", "women"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    sizes: [
      {
        type: String,
      },
    ],

    colors: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>(
  "Product",
  productSchema
);

export default Product;