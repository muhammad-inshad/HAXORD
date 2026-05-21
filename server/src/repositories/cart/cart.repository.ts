import Cart, { ICart } from "../../models/cart.model";

import { BaseRepository } from "../baseRepository/base.repository";

import { ICartRepo } from "./cart.repository.interface";

export class CartRepo
  extends BaseRepository<ICart>
  implements ICartRepo
{
  constructor() {
    super(Cart);
  }

  
}