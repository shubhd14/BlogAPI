import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import User from "../models/user.model";
import { generateOtp } from "../utils/generateOtp";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRES_IN = "1h";

//  Jwt token generator
const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// SIGNUP
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, password, role = "user" } = req.body;
    const lowerEmail = email.toLowerCase();

    const existing = await User.findOne({ email: lowerEmail });
    if (existing) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      email: lowerEmail,
      phone,
      password,
      otp,
      otpExpiry,
      isVerified: false,
      role,
    });

    await user.save();
    console.log(`OTP for ${lowerEmail}: ${otp}`);
    res.status(201).json({ message: "User registered, OTP sent" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// VERIFY OTP
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const lowerEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ SIGNIN
export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ message: "Please verify your OTP first" });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = generateToken((user._id as string), user.role);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ GET PROFILE
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ UPDATE PROFILE
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, phone, password } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (password) updateData.password = password;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};