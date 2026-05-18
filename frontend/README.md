# Frontend — AIoT Dashboard

React 19 + Vite single-page application. Connects to the backend via REST and Socket.io for real-time updates.

## Setup

```bash
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # production build → dist/
```

## Configuration

Edit `src/utils/config.js` to point at your backend:

```js
export const config = {
  apiUrl: 'http://localhost:3001',   // change for remote deployments
}
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `EyeAnimation` | AI assistant — text + voice input, multi-provider LLM |
| `/devices` | `Dashboard` | Real-time T / H / P / IAQ cards and charts |
| `/alerts` | `Alerts` | Threshold alert log |
| `/history` | `History` | Paginated sensor data table with CSV export |
| `/prompts` | `Prompts` | AI interaction history |

## LLM Providers

Switch between providers by clicking the colored circle on the AI assistant screen:

| Color | Provider | Model |
|-------|----------|-------|
| Green | OpenAI | GPT-4o |
| Blue | DeepSeek | deepseek-chat |
| Purple/Orange | Mistral | mistral-medium |
