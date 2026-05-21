import mongoose, {
  Schema,
  Document,
  Types,
} from "mongoose";

export interface IOrder extends Document {

  userId: Types.ObjectId;

  productId: Types.ObjectId;

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

const orderSchema = new Schema<IOrder>(
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
    },

    totalPrice: {
      type: Number,
      required: true,
    },


    orderStatus: {
      type: String,
      enum: [
        "placed",
        "delivered",
      ],
      default: "placed",
    },

    orderedDate: {
      type: Date,
      default: Date.now,
    },

    deliveryDate: {
      type: Date,
      default: () => {
        const date = new Date();

        date.setDate(date.getDate() + 5);

        return date;
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<IOrder>(
  "Order",
  orderSchema
);

export default Order;