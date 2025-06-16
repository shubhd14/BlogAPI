import { Request, Response } from "express";
import Comment from "../models/comment.model";

export const addComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { postId, content } = req.body;
    const comment = new Comment({
      content,
      author: req.user._id,
      postId,
    });

    await comment.save();
    res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).populate("author", "email");
    res.status(200).json({ comments });
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
