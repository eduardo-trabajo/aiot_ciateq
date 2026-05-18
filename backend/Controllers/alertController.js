import Alerta from '../Models/Alerta.js';
import sendAlert from '../services/whatsappService.js';
import sendAlertEmail from '../services/emailService.js';
import bot from '../services/telegramService.js';

function determineSeverity(value) {
  if (value >= 50) return 'Critical';
  if (value >= 40) return 'High';
  if (value >= 30) return 'Medium';
  return 'Low';
}

export const sendAlertWhats = async (req, res) => {
  const { temperature, humidity, sensor } = req.body;
  try {
    await sendAlert(process.env.ALERT_WHATSAPP_TO, temperature, humidity, sensor);

    const nuevaAlerta = new Alerta({
      type: 'Temperature',
      value: temperature,
      threshold: 35,
      unit: '°C',
      location: sensor || 'Unknown',
      severity: determineSeverity(temperature),
      status: 'Active',
      message: `High temperature detected: ${temperature}°C at sensor ${sensor}`
    });

    await nuevaAlerta.save();
    res.json("Alerta enviada y guardada");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar o guardar la alerta' });
  }
};

export const sendAlertTelegram = async (req, res) => {
  const { temperature, humidity, sensor } = req.body;
  try {
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const message = `⚠️ Alerta\nSensor: ${sensor}\nTemperatura: ${temperature}°C\nHumedad: ${humidity}%`;
    await bot.sendMessage(telegramChatId, message);

    const nuevaAlerta = new Alerta({
      type: 'Temperature',
      value: temperature,
      threshold: 35,
      unit: '°C',
      location: sensor || 'Unknown',
      severity: determineSeverity(temperature),
      status: 'Active',
      message: `High temperature detected: ${temperature}°C at sensor ${sensor}`
    });

    await nuevaAlerta.save();
    res.json("Alerta de Telegram enviada y guardada");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar o guardar la alerta de Telegram' });
  }
};

export const sendAlertEmailController = async (req, res) => {
  const { temperature, humidity, sensor } = req.body;

  if (!temperature || !humidity || !sensor) {
    return res.status(400).json({ error: 'Faltan campos: temperature, humidity o sensor' });
  }

  try {
    const tempSent = await sendAlertEmail(sensor, 'Temperatura', temperature);
    const humSent = await sendAlertEmail(sensor, 'Humedad', humidity);

    const success = tempSent && humSent;

    if (success) {
      res.status(200).json({ message: 'Alertas enviadas por correo' });
    } else {
      res.status(500).json({ error: 'No se pudo enviar una o ambas alertas' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alerta.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar alertas' });
  }
};