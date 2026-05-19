import { UserResponseDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";

export class UserMapper{
    static toResponse(user:IUser):UserResponseDTO{
        return{
            id:user._id.toString(),
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
            isBlocked:user.isBlocked
        }
    }
}