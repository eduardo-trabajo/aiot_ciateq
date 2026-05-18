// app.js
import './config/env.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import alertsRoutes from './Routes/alertsRoutes.js';
import dataRoutes from './Routes/dataRoutes.js';
import analysisRoutes from './Routes/analysisRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();

//Device ID
const deviceId = process.env.DEVICE_ID;
app.set('deviceId', deviceId);


// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI )
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando MongoDB:', err));

// Middlewares
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));
app.use(express.static('public'));
// Rutas
app.use(alertsRoutes);
app.use(dataRoutes);
app.use(analysisRoutes);


// Por esto:
app.get('/{*any}', (req, res) => { // Agrega la barra
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});




export default app;
