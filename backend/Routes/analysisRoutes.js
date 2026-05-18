import express from 'express';
import {
  analyzeOpenAI,
  analyzeDeepseek,
  analyzeMistral,
  getIAHistory
} from '../Controllers/analysisController.js';

const router = express.Router();

router.post('/analyze_openai', analyzeOpenAI);
router.post('/analyze_deepseek', analyzeDeepseek);
router.post('/analyze_mistral', analyzeMistral);
router.get('/ia/history', getIAHistory);

export default router;