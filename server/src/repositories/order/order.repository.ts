import Order, { IOrder } from "../../models/order.model"
import {BaseRepository}from "../baseRepository/base.repository"

export class OrderRepo extends BaseRepository<IOrder>{
    constructor(){super(Order)}
    
}