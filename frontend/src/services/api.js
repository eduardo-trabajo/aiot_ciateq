import { config } from "../utils/config";
const BASE_URL = config.apiUrl;


export const api = {
    fetchAlerts: async () => {
        try {
            const res = await fetch(`${BASE_URL}/alerts`);
            if (!res.ok) throw new Error('Failed to fetch alerts');
            return await res.json();
          } catch (error) {
            console.error('[fetchAlerts]', error);
            return [];
          }
    },
    getSensorData: async () => {
        try {
            const res = await fetch(`${BASE_URL}/data`);
            if (!res.ok) throw new Error('Failed to fetch sensor data');
            return await res.json();
          } catch (error) {
            console.error('[getSensorData]', error);
            return [];
          }
    },
    getIaHistory: async () => {
        try {
            const res = await fetch(`${BASE_URL}/ia/history`);
            if (!res.ok) throw new Error('Failed to fetch IA history');
            return await res.json();
          } catch (error) {
            console.error('[getIaHistory]', error);
            return [];
          }
    },
}