import express from "express";
import { addComment, getCommentsByPost } from "../controllers/comment.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", verifyToken, addComment);
router.get("/:postId", getCommentsByPost);

export default router;
