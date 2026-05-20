import User,{IUser} from "../../models/user.model";
import {BaseRepository}from "../baseRepository/base.repository"

export class UserRepository extends BaseRepository<IUser>{
    constructor(){super(User)}
    
}