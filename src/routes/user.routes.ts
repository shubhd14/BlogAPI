import express from "express";
import { getProfile } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import catchAsync from "../utils/catchAsync";

const router = express.Router();

router.get("/profile", catchAsync(verifyToken), catchAsync(getProfile)); 

export default router;



