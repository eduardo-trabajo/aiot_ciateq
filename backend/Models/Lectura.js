// utils/getLecturaModel.js
import mongoose from 'mongoose';

const lecturaSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  pressure: Number,
  timestamp: { type: Date, default: Date.now }
});

/**
 * Retorna un modelo de Mongoose para una colección dinámica por dispositivo.
 * @param {string} deviceId - ID del dispositivo, como "ORBE_001"
 */
export const getLecturaModel = (deviceId) => {
  const collectionName = deviceId.toLowerCase(); // ej: orbe_001

  // Si ya existe un modelo con ese nombre, reúsalo
  return mongoose.models[collectionName] || mongoose.model(collectionName, lecturaSchema, collectionName);
};
