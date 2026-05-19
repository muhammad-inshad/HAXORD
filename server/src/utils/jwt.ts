import jwt, { JwtPayload } from "jsonwebtoken";

export const generateAccessToken = (payload: object) => {
  return jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyAccessToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string
  ) as JwtPayload;
};

export const verifyRefreshToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as string
  ) as JwtPayload;
};