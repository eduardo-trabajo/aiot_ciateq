import {getLecturaModel} from '../Models/Lectura.js';


export const postData = async (req, res) => {
  const temperature = req.body.temperature;
  const humidity = req.body.humidity;
  const pressure = req.body.pressure;

  const deviceId = req.app.get('deviceId'); // se obtiene del backend, no del request

  if (
    typeof temperature !== 'number' ||
    typeof humidity !== 'number' ||
    typeof pressure !== 'number'
  ) {
    return res.status(400).json({ error: 'Campos inválidos' });
  }

  try {
    const Lectura = getLecturaModel(deviceId);
    const nuevaLectura = new Lectura({ temperature, humidity, pressure });
    await nuevaLectura.save();

    // Emitir evento Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('newData', {
        deviceId,
        temperature,
        humidity,
        pressure,
        timestamp: nuevaLectura.timestamp,
      });
      console.log('📣 Evento newData emitido vía socket');
    }

    res.status(201).json({ message: `Datos guardados en ${deviceId}` });
  } catch (err) {
    console.error('❌ Error en postData:', err);
    res.status(500).json({ error: 'Error guardando datos' });
  }
};

export const getData = async (req, res) => {
  try {
    const deviceId = req.app.get('deviceId');
    const Lectura = getLecturaModel(deviceId);

    const lecturas = await Lectura.find().sort({ timestamp: -1 });
    res.json(lecturas);
  } catch (err) {
    console.error('❌ Error en getData:', err);
    res.status(500).json({ error: 'Error al consultar lecturas' });
  }
};