import React, { useEffect, useState } from 'react';
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Card from './Card';
import Layout from './Layout';
import temperature from '../assets/icons/temperature.svg';
import humidity from '../assets/icons/humidity.svg';
import meter from '../assets/icons/meter.svg';
import air from '../assets/icons/air.svg';
import '../assets/styles/dashboard.css';
import ChartT from './ChartT';
import ChartH from './ChartH';
import ChartP from './ChartP';
import ChartA from './ChartA';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { config } from '../utils/config';
const socket = io(config.apiUrl);

Chart.register(...registerables);

const Dashboard = () => {
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getSensorData();
        setSensorData(data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };
  
    fetchData(); // inicial
  
    socket.on('newData', () => {
      console.log(' Recibido nuevo dato via socket');
      fetchData(); // refrescar datos
    });
  
    return () => {
      socket.off('newData'); // limpiar evento al desmontar
    };
  }, []);
  
  
  const latestEntry = sensorData.length > 0 ? sensorData[0] : {};
  
  return (
    <>
    <Layout>
    <div className="dashboardContainer">
      <Card icon={temperature} value={`${latestEntry.temperature?.toFixed(2) || "N/A"} °C`} title="Temperature"/>
      <Card icon={humidity} value={`${latestEntry.humidity?.toFixed(2) || "N/A"} %`} title="Humidity"/>
      <Card icon={meter} value={`${latestEntry.pressure?.toFixed(2) || "N/A"} `} title="Pressure hPa"/>
      <Card icon={air} value={`${latestEntry.iaq?.toFixed(2) || "N/A"}`} title="IAQ"/>
      <div className='background chartContainer'>
        <ChartT data={sensorData} />
      </div>
      <div className='background chartContainer'>
        <ChartH data={sensorData} />
      </div>
      <div className='background chartContainer'>
        <ChartP data={sensorData} />
      </div>
      <div className='background chartContainer'>
        <ChartA data={sensorData} />
      </div>
    </div>
    </Layout>
    </>
  );
}

export default Dashboard;



