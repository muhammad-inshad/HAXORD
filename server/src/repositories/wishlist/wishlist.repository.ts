import mongoose from "mongoose";
import WishlistModel, {
  IWishlist,
} from "../../models/wishlist.model";

import { BaseRepository } from "../baseRepository/base.repository";

export class WishlistRepository
  extends BaseRepository<IWishlist> {

  constructor() {
    super(WishlistModel);
  }

  async findByUserId(userId: string): Promise<IWishlist[]> {
    return await WishlistModel.find({ userId: new mongoose.Types.ObjectId(userId) }).populate('productId');
  }

  async deleteByUserAndProduct(userId: string, productId: string): Promise<void> {
    await WishlistModel.deleteOne({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
    });
  }
}