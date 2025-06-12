import express from 'express';
import { Request, Response } from 'express';
import verifyToken from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';

const router = express.Router();

router.get('/admin-only', verifyToken, isAdmin, (req:Request, res:Response) => {
  res.send('Welcome Admin!');
});

export default router;
