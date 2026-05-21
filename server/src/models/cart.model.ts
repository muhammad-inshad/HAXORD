import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICart extends Document {
  userId: Types.ObjectId;

  productId: Types.ObjectId;

  productName: string;

  productImage: string;

  price: number;

  size: string;

  color: string;

  quantity: number;

  orderedDate: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productImage: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    orderedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;