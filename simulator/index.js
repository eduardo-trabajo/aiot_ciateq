import fetch from 'node-fetch';

// URL de tu API
const API_URL = 'http://localhost:3001/data'; // cambia si es IP o dominio externo

// Generador de datos aleatorios dentro de un rango
function randomInRange(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

// Función que envía datos simulados
const sendSensorData = async () => {
  const data = {
    temperature: randomInRange(26, 27),  // °C
    humidity: randomInRange(40, 41),     // %
    pressure: randomInRange(1000, 1005)  // hPa
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      console.log(`✅ Enviado: ${JSON.stringify(data)} | ${new Date().toLocaleTimeString()}`);
    } else {
      console.error(`❌ Error al enviar: ${response.status}`);
    }
  } catch (err) {
    console.error('🚫 Error de conexión:', err.message);
  }
};

// Ejecutar cada 30 segundos
sendSensorData(); // envío inicial inmediato
setInterval(sendSensorData, 10 * 1000);
