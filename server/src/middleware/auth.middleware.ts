import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
} from "../utils/jwt";
import { AuthUserPayload } from "../types/express";


export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken) as AuthUserPayload;
        req.user = decoded;
        return next();
      } catch (err) {
        console.log("Access token expired");
      }
    }

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decodedRefresh = verifyRefreshToken(refreshToken) as AuthUserPayload;

    const newAccessToken = generateAccessToken({
      id: decodedRefresh.id,
      email: decodedRefresh.email,
      isAdmin: decodedRefresh.isAdmin,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    req.user = decodedRefresh;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};