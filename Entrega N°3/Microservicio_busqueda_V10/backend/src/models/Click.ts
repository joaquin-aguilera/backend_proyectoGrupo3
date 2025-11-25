import mongoose, { Schema, Document } from 'mongoose';

export interface IClick extends Document {
  searchId: mongoose.Types.ObjectId;
  productId: string;
  userId?: string;
  clickedAt: Date;
}

const ClickSchema: Schema = new Schema({
  searchId: { type: Schema.Types.ObjectId, required: true, ref: 'Search' },
  productId: { type: String, required: true },
  userId: String,
  clickedAt: { type: Date, required: true, default: Date.now }
});

ClickSchema.index({ productId: 1, clickedAt: 1 });
ClickSchema.index({ searchId: 1 });
ClickSchema.index({ userId: 1, clickedAt: -1 });

export default mongoose.model<IClick>('Click', ClickSchema);