import { Router } from "express";
import validateAuthToken from "../middlewares/validateAuthToken";
import authenticateToken from "../middlewares/authenticateToken";
import {
  addAdminAddress,
  getAdminAddress,
  updateAdminAddress,
} from "../controllers/adminAddressController";
import { getAllRefs, getPayReferral } from "../controllers/referralController";

const router = Router();

router.post("/admin-address", addAdminAddress);
router.get("/admin-address", validateAuthToken, getAdminAddress);
router.put("/update-admin-address", updateAdminAddress);
router.get("/admin/level2", authenticateToken, getPayReferral);
router.get("/admin/get-all-referral", authenticateToken, getAllRefs);

export default router;
