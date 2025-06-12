import { Request, Response } from "express";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user; // from middleware

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
