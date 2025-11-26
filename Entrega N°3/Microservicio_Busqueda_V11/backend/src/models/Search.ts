import mongoose, { Schema, Document } from 'mongoose';

export interface ISearch extends Document {
  userId?: string;
  sessionId?: string;
  queryText: string;
  filters?: {
    precio?: string;
    categoria?: string;
    ubicacion?: string;
    condicion?: string;
  };
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page: number;
  pageSize: number;
  requestedAt: Date;
  latencyMs?: number;
  source?: string;
  results: Array<{
    productId: string;
    position: number;
    score?: number;
  }>;
}

const SearchSchema: Schema = new Schema({
  userId: { type: String },
  sessionId: { type: String },
  queryText: { type: String, required: true },
  filters: {
    precio: String,
    categoria: String,
    ubicacion: String,
    condicion: String
  },
  sortBy: String,
  sortDir: { type: String, enum: ['asc', 'desc'] },
  page: { type: Number, required: true, default: 1 },
  pageSize: { type: Number, required: true, default: 20 },
  requestedAt: { type: Date, required: true, default: Date.now },
  latencyMs: Number,
  source: String,
  results: [{
    productId: { type: String, required: true },
    position: { type: Number, required: true },
    score: Number
  }]
});

SearchSchema.index({ userId: 1, requestedAt: -1 });
SearchSchema.index({ requestedAt: -1 });
SearchSchema.index({ 'results.productId': 1, requestedAt: 1 });
SearchSchema.index({ queryText: 'text' });

export default mongoose.model<ISearch>('Search', SearchSchema);