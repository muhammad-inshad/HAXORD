import { IBaseRepository } from "../baseRepository/base.repository.interface";
import { ICart } from "../../models/cart.model";

export interface ICartRepo extends IBaseRepository<ICart> {

}