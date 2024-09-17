import { Router } from "express";
import validateAuthToken from "../middlewares/validateAuthToken";
import authenticateToken from "../middlewares/authenticateToken";
import {
  addAdminAddress,
  getAdminAddress,
  updateAdminAddress,
} from "../controllers/adminAddressController";
import {
  addReferral,
  deleteReferral,
  getPayReferral,
  getReferral,
  getself,
  payReferral,
} from "../controllers/referralController";

const router = Router();

router.post("/referral", validateAuthToken, addReferral);
router.get("/g-referral", validateAuthToken, getReferral);
router.get("/get-referral", validateAuthToken, getself);
router.delete("/referral/:id", validateAuthToken, deleteReferral);
router.post("/referral/pay", validateAuthToken, payReferral);
router.get("/referral/pay", validateAuthToken, getPayReferral);
router.get("/referral/pay", validateAuthToken, getPayReferral);
// for admin
router.get("/all-referral", authenticateToken, getAdminAddress);

export default router;
