import { Router, Request, Response } from 'express';
import {
  signup,
  verifyOtp,
  signin,
  getProfile,
  updateProfile
} from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import jwt, { SignOptions } from 'jsonwebtoken';

const router = Router();

// Auth routes
router.post('/signup', signup);
router.post('/verify', verifyOtp);
router.post('/signin', signin);

// ✅ Refresh token route
router.post('/refresh-token', (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string; role: string };

    const payload = { userId: decoded.userId, role: decoded.role };
    const secret = process.env.JWT_ACCESS_SECRET!;
    
    // Safely assign expiresIn string as SignOptions['expiresIn']
    const expiresIn: SignOptions['expiresIn'] =
      (process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn']) || '15m';

    const accessToken = jwt.sign(payload, secret, { expiresIn });

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

// Profile routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

export default router;
