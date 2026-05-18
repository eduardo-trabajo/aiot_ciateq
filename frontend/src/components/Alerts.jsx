import React, { useEffect, useState } from 'react';
import '../assets/styles/alerts.css';
import Layout from './Layout';
import alertsIcon from '../assets/icons/alerts.svg';
import { api } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      const data = await api.fetchAlerts();
      setAlerts(data);
    };
    loadAlerts();
  }, []);

  return (

    <Layout>
    <div className="alertsTableContainer">
      <h2 className='titleWithIcon '><img src={alertsIcon} alt="Alerts" />Alerts Table</h2>

      <table className="alertsTable">
        <thead>
          <tr>
            <th>Type</th>
            <th>Value</th>
            <th>Threshold</th>
            <th>Unit</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Location</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert._id}>
              <td>{alert.type}</td>
              <td>{alert.value}</td>
              <td>{alert.threshold}</td>
              <td>{alert.unit}</td>
              <td>{alert.severity}</td>
              <td>{alert.status}</td>
              <td>{alert.location || 'N/A'}</td>
              <td>{new Date(alert.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </Layout>
  );
};

export default Alerts;
