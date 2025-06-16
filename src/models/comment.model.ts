import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  postId: Types.ObjectId;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Comment = model<IComment>("Comment", commentSchema);
export default Comment;
