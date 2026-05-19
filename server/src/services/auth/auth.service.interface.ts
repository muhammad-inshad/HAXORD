import { UserResponseDTO } from "../../dtos/user.dto";

export interface IAuthService {
  register(
    name: string,
    email: string,
    password: string
  ): Promise<{
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;

  login(
  email: string,
  password: string
): Promise<{
  user: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
}>;

refreshToken(
  token: string
): Promise<{
  accessToken: string;
}>;

}