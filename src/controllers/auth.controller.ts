import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { generateOtp } from "../utils/generateOtp";
import { generateTokens } from "../utils/jwt";
import { sendOTP } from "../utils/sendEmail"; // nodemailer 

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRES_IN = "1h";

// In-memory store for OTP and signup data
type TempUserData = {
  phone: string;
  password: string;
  otp: string;
  otpExpiry: Date;
  role: string;
};
const tempSignupStore = new Map<string, TempUserData>();

// SIGNUP - Send OTP Only (no DB write yet)
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    try {
      await sendOTP(lowerEmail, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      res.status(500).json({ message: "Failed to send OTP email. Please try again." });
      return;
    }

    tempSignupStore.set(lowerEmail, {
      phone,
      password: hashedPassword,
      otp,
      otpExpiry,
      role,
    });

    res.status(200).json({ message: "OTP sent to email. Please verify to complete registration." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// VERIFY OTP and register user
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const lowerEmail = email.toLowerCase();

    const tempData = tempSignupStore.get(lowerEmail);
    if (!tempData) {
      res.status(400).json({ message: "OTP expired or not requested" });
      return;
    }

    if (tempData.otp !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (tempData.otpExpiry < new Date()) {
      tempSignupStore.delete(lowerEmail);
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    const user = new User({
      email: lowerEmail,
      phone: tempData.phone,
      password: tempData.password,
      isVerified: true,
      role: tempData.role,
    });

    await user.save();
    tempSignupStore.delete(lowerEmail);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// SIGNIN
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const userId = String(user._id);
    const userRole = user.role;

    const { accessToken, refreshToken } = generateTokens(userId, userRole);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", accessToken });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET PROFILE
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

// UPDATE PROFILE
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
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
