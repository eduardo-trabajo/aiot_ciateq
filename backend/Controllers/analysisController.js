// API/Controllers/analysisController.js
import { getLecturaModel } from '../Models/Lectura.js';
import openai from '../AI/openai.js';
import deepseek from '../AI/deepseek.js';
import mistral from '../AI/mistral.js';
import ConsultaIA from '../Models/ConsultaIA.js';

/* ---------------------- Helpers ---------------------- */
function makeDatos(lecturas) {
  // No mutar lecturas originales
  return [...lecturas].reverse().map(d => ({
    tiempo: new Date(d.timestamp).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    temperatura: d.temperature ?? null,
    humedad: d.humidity ?? null
  }));
}

function buildPrompt(lecturas) {
  const datos = makeDatos(lecturas);
  return `
Analiza únicamente estos datos de temperatura y humedad. Identifica tendencias, picos/anomalías y alerta si faltan datos.
No inventes información que no esté en la lista. Sé conciso.

Datos:
${JSON.stringify(datos, null, 2)}
`;
}

function buildContexto(deviceId, datos) {
  return `
Tienes acceso únicamente a los últimos ${datos.length} datos de temperatura y humedad tomados cada 15 minutos del dispositivo ${deviceId}.
No puedes asumir información fuera de esos datos. 
Si la información no es suficiente para una conclusión, menciónalo explícitamente.
Estás especializada solo en datos de temperatura y humedad del sensor; no respondas sobre otros tipos de datos.
Responde lo más conciso posible y traduce las marcas de tiempo a algo legible por humanos.

Aquí los datos:
${JSON.stringify(datos, null, 2)}
`;
}

/* ---------------------- OpenAI ---------------------- */
export const analyzeOpenAI = async (req, res) => {
  try {
    const deviceId = req.app.get('deviceId');
    const Lectura = getLecturaModel(deviceId);
    const { customPrompt = '' } = req.body ?? {};

    const lecturas = await Lectura.find().sort({ timestamp: -1 }).limit(100);
    const datos = makeDatos(lecturas);

    const prompt = customPrompt.trim().length > 0
      ? customPrompt
      : buildPrompt(lecturas);

    const contexto = buildContexto(deviceId, datos);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Eres un experto en análisis de datos de sensores ambientales.' },
        { role: 'user', content: contexto + '\n' + prompt }
      ],
      temperature: 0.3
    });

    const respuesta = completion.choices[0].message.content;

    await ConsultaIA.create({
      deviceId,
      modelo: 'openai',
      prompt: contexto + '\n' + prompt,
      respuesta
    });

    res.json({ result: respuesta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al analizar los datos' });
  }
};

/* ---------------------- DeepSeek (corregido como tu ejemplo) ---------------------- */
export const analyzeDeepseek = async (req, res) => {
  try {
    const deviceId = req.app.get('deviceId');
    const Lectura = getLecturaModel(deviceId);
    const { customPrompt = '' } = req.body ?? {};

    const lecturas = await Lectura.find().sort({ timestamp: -1 }).limit(100);
    const datos = makeDatos(lecturas);

    const prompt = customPrompt.trim().length > 0
      ? customPrompt
      : buildPrompt(lecturas);

    const contexto = buildContexto(deviceId, datos);

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Eres un experto en análisis de datos de sensores ambientales.' },
        { role: 'user', content: contexto + '\n' + prompt }
      ],
      temperature: 0.3
    });

    const respuesta = completion.choices[0].message.content;

    await ConsultaIA.create({
      deviceId,
      modelo: 'deepseek',
      prompt: contexto + '\n' + prompt,
      respuesta
    });

    res.json({ result: respuesta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al analizar los datos con DeepSeek' });
  }
};

/* ---------------------- Mistral ---------------------- */
export const analyzeMistral = async (req, res) => {
  try {
    const deviceId = req.app.get('deviceId');
    const Lectura = getLecturaModel(deviceId);
    const { customPrompt = '' } = req.body ?? {};

    const lecturas = await Lectura.find().sort({ timestamp: -1 }).limit(100);
    const datos = makeDatos(lecturas);

    const prompt = customPrompt.trim().length > 0
      ? customPrompt
      : buildPrompt(lecturas);

    const contexto = buildContexto(deviceId, datos);

    const completion = await mistral.chat.completions.create({
      model: 'mistral-medium',
      messages: [
        { role: 'system', content: 'Eres un experto en análisis de datos de sensores ambientales.' },
        { role: 'user', content: contexto + '\n' + prompt }
      ],
      temperature: 0.3
    });

    const respuesta = completion.choices[0].message.content;

    await ConsultaIA.create({
      deviceId,
      modelo: 'mistral',
      prompt: contexto + '\n' + prompt,
      respuesta
    });

    res.json({ result: respuesta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al analizar los datos con Mistral' });
  }
};

/* ---------------------- Historial ---------------------- */
export const getIAHistory = async (req, res) => {
  try {
    const deviceId = req.app.get('deviceId');
    const historial = await ConsultaIA.find({ deviceId }).sort({ timestamp: -1 });
    res.json(historial);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial IA' });
  }
};
