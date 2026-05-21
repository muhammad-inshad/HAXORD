
import { IOrder } from "../../models/order.model";
import { IBaseRepository } from "../baseRepository/base.repository.interface";

export interface IorderRepo
  extends IBaseRepository<IOrder> {

}