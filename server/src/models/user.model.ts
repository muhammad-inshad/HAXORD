import mongoose, { Document, Schema } from "mongoose";

interface IAddress {
  fullName: string;
  phone: string;
  houseName: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isBlocked: boolean;
  isAdmin: boolean;
  address: IAddress[];
}

const addressSchema = new Schema<IAddress>({
  fullName: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  houseName: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },

  pincode: {
    type: String,
    required: true,
  },

  country: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    address: [addressSchema],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;