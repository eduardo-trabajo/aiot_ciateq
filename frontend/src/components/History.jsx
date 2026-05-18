import React, { useState, useEffect } from 'react';
import '../assets/styles/devices.css';
import { downloadCSV } from '../utils/downloadCSV';
import excelIcon from '../assets/icons/excel.svg';
import Layout from './Layout';
import historic from '../assets/icons/historic.svg'
import { api } from '../services/api';

const TemperatureHistory = () => {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getSensorData();
        setRecords(data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };
    fetchData();
  }, []);

  const filteredRecords = records.filter(record => {
    const date = new Date(record.timestamp);
    return (!startDate || date >= new Date(startDate)) &&
           (!endDate || date <= new Date(endDate));
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  return (
    <Layout>
      <div className="devicesContainer">
         <h2 className='titleWithIcon'><img src={historic}  />Sensor Data</h2>
        <div className="filterContainer">
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </label>

          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </label>

          <img
            src={excelIcon}
            alt="Download CSV"
            className="excelIcon"
            onClick={() => downloadCSV(filteredRecords, 'temperature_history')}
            style={{ cursor: 'pointer', width: '30px', height: '30px', marginLeft: '20px' }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Temperature (°C)</th>
              <th>Humidity (%)</th>
              <th>Pressure (hPa)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item._id}>
                <td>{item.temperature?.toFixed(2)}</td>
                <td>{item.humidity?.toFixed(2)}</td>
                <td>{item.pressure?.toFixed(2)}</td>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Prev
          </button>

          <span>Page {currentPage} of {totalPages}</span>

          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default TemperatureHistory;
