import '../config/env.js';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendAlert = async (toPhone, temperature, humidity, sensor) => {
  const message = `⚠️ Alerta\nSensor: ${sensor}\nTemperatura: ${temperature}°C\nHumedad: ${humidity}%`;
  try {
    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${toPhone}`,
      body: message
    });
    console.log('Mensaje enviado:', response.sid);
  } catch (error) {
    console.error('Error al enviar mensaje:', error.message);
  }
};

export default sendAlert;