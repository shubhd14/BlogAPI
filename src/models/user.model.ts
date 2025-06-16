import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
  email: string;
  phone: string;
  password: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
    role: 'user' | 'admin'; 

}


const userSchema: Schema<IUser> = new mongoose.Schema({
  name: { type: String }, 
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
   role: {
    type: String,
    enum: ['user', 'admin'], 
    default: 'user',
  },

});


const User = mongoose.model<IUser>('User', userSchema);
export default User;
