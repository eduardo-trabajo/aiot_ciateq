import mongoose from 'mongoose';

const alertaSchema = new mongoose.Schema({
  deviceId: String, 
  type: String,
  value: Number,
  threshold: Number,
  unit: String,
  location: String,
  timestamp: { type: Date, default: Date.now },
  severity: String,
  status: String,
  message: String
});

export default mongoose.model('Alerta', alertaSchema);
