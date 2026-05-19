import { AuthController } from "../controllers/auth/auth.controller";
import { UserRepository } from "../repositories/user/user.repository";
import { AuthService } from "../services/auth/auth.service";

export const authContainer = () => {
  const userRepository = new UserRepository();
  
  const authService = new AuthService(userRepository);

const authController = new AuthController(authService);

  return {
    authService,
    authController
  };
};