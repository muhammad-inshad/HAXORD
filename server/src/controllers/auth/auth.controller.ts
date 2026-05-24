import { Request, Response } from "express";
import { IAuthService } from "../../services/auth/auth.service.interface";

export class AuthController {
  constructor(private authService: IAuthService ) {}

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const result = await this.authService.register(
        name,
        email,
        password
      );


      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: result.user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await this.authService.login(
      email,
      password
    );

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken;

    const result = await this.authService.refreshToken(
      token
    );

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}

async getMe(req: Request, res: Response) {
  try {
    const id = req.user?.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const data = await this.authService.getMe(id);

    res.status(200).json({
      success: true,
      user: data.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
}

async logout(req: Request, res: Response) {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    // Fallback for non-httpOnly accessToken if any
    res.clearCookie("accessToken", { path: "/" });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

}