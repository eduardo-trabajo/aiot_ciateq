import '../config/env.js';
import { OpenAI } from 'openai';

const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1'
});

export default mistral;