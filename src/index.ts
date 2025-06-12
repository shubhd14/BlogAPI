import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 3000;

connectDB();
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

