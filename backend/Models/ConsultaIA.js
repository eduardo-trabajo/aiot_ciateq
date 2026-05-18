import mongoose from 'mongoose';

const consultaIASchema = new mongoose.Schema({
  deviceId: String, // <-- nuevo campo
  modelo: String,
  prompt: String,
  respuesta: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('ConsultaIA', consultaIASchema);
