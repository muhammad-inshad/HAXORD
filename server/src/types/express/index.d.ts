import { JwtPayload } from "jsonwebtoken";

export interface AuthUserPayload extends JwtPayload {
  id: string;
  email: string;
  isAdmin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export {};