import { UserMapper } from "../../mappers/user.mapper";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";

export class AuthService {
  constructor(private userRepository: IUserRepository ) {}

  async register(
    name: string,
    email: string,
    password: string
  ) {
    const existingUser =
      await this.userRepository.findOne({email});

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken({
      id: user._id,
    });

    const refreshToken = generateRefreshToken({
      id: user._id,
    });

    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
  const user = await this.userRepository.findOne({email});

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await comparePassword(
    password,
    user.password
  );

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken({
    id: user._id,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  return {
    user: UserMapper.toResponse(user),
    accessToken,
    refreshToken,
  };
}

async refreshToken(token: string) {
    try {
      const decoded = verifyRefreshToken(token);

      const accessToken = generateAccessToken({
        id: decoded.id,
      });

      return {
        accessToken,
      };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

async getMe(id: string) {
  try {
    console.log("inshad")
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      user: UserMapper.toResponse(user),
    };
  } catch (error) {
    throw error;
  }
}
}