  import express from 'express';
  import dotenv from 'dotenv';
  import connectDB from './config/db';
  import authRoutes from './routes/auth.routes';
  import userRoutes from "./routes/user.routes";
  import adminRoutes from './routes/admin.routes';
  import cookieParser from 'cookie-parser';
  import postRoutes from './routes/post.routes';
  import commentRoutes from './routes/comment.routes';




  dotenv.config();
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  app.use("/api/user", userRoutes);
app.use('/api/admin', adminRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/comments', commentRoutes);



  const PORT = process.env.PORT || 3000;

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });

  export default app;