import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!; // ✅ match generateTokens

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({ message: 'Unauthorized. User not found.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verify Error:", error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized. User not authenticated.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden. Admins only.' });
    return;
  }

  next();
};

export default verifyToken;
