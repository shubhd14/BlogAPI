import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import userRoutes from "./routes/user.routes";
import adminRoutes from './routes/admin.routes';



dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/user", userRoutes);
app.use('/api', adminRoutes);


const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;