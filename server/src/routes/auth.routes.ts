import express from "express";
import { authContainer } from "../di/auth.di";
import { AuthController } from "../controllers/auth/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

const { authController } = authContainer();

router.post(
  "/register",
  authController.register.bind(authController)
);
router.post(
  "/login",
  authController.login.bind(authController)
);
router.post(
  "/refresh-token",
  authController.refreshToken.bind(authController)
);

// routes/auth.routes.ts

router.post("/logout", authController.logout.bind(authController));
router.get("/me", authMiddleware, authController.getMe.bind(authController));

export default router;