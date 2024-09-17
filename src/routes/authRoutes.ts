import { Router } from "express";
import { register, login, checkAuth, changePassword } from "../controllers/authController";
import {
  registerValidation,
  loginValidation,
} from "../middlewares/authValidators";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();

router.post("/swipe", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/check-auth", authenticateToken, checkAuth);
router.post("/admin/password", authenticateToken, changePassword);

export default router;
