import { Request, Response } from "express";
import Post from "../models/post.model";

export const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { title, content } = req.body;
    const post = new Post({ title, content, author: req.user._id });

    await post.save();

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().populate("author", "email phone role");
    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "email phone role");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({ post });
  } catch (error) {
    console.error("Get Post Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const { title, content } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();
    res.status(200).json({ message: "Post updated", post });
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
