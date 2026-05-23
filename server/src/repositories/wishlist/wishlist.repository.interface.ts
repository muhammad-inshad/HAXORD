import { IBaseRepository } from "../baseRepository/base.repository.interface";
import { IWishlist } from "../../models/wishlist.model";

export interface IWishlistRepository
  extends IBaseRepository<IWishlist> {
  findByUserId(userId: string): Promise<IWishlist[]>;
  deleteByUserAndProduct(userId: string, productId: string): Promise<void>;
}