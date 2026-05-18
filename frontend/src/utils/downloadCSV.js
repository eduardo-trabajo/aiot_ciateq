export const downloadCSV = (data, filename) => {
    const csvRows = [];
  
    // Encabezados
    const headers = ['Temperature (°C)', 'Humidity (%)', 'Pressure (hPa)', 'Timestamp'];
    csvRows.push(headers.join(','));
  
    // Datos
    data.forEach(device => {
      const row = [
        device.temperature !== undefined ? device.temperature.toFixed(2) : '',
        device.humidity !== undefined ? device.humidity.toFixed(2) : '',
        device.pressure !== undefined ? device.pressure.toFixed(2) : '',
        device.timestamp ? new Date(device.timestamp).toLocaleString() : ''
      ];
      csvRows.push(row.join(','));
    });
    
  
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  