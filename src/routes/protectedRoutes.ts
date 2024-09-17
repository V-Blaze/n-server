import { Router } from "express";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();

router.get("/protected", authenticateToken, (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorizedi" });
  }
  res.json({
    message: `Hello ${req.admin.username}, you have access to this protected route.`,
  });
});

export default router;
