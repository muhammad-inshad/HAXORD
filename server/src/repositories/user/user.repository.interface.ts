import { IUser } from "../../models/user.model";
import { IBaseRepository } from "../baseRepository/base.repository.interface";

export interface IUserRepository
  extends IBaseRepository<IUser> {

}