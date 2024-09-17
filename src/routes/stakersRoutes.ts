import { Router } from "express";
import { addNewRef, addStaker, getRef } from "../controllers/stakerController";
import validateAuthToken from "../middlewares/validateAuthToken";
import { createUserG, createUserP } from "../controllers/referralController";

const router = Router();

router.post("/add-staker", validateAuthToken, addStaker);
router.post("/add-new-ref", validateAuthToken, addNewRef);
router.get("/get-ref", validateAuthToken, getRef);
router.post("/user", validateAuthToken, createUserP);
router.get("/user", validateAuthToken, createUserG);

export default router;
