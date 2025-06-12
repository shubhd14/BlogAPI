import { Router } from 'express';
import { signup, verifyOtp, signin, getProfile } from '../controllers/auth.controller';
import { updateProfile } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';  


const router = Router();

router.post('/signup', signup);
router.post('/verify', verifyOtp);
router.post('/signin', signin);

router.get('/profile', verifyToken ,getProfile);
router.put('/profile', verifyToken, updateProfile);

export default router;
