# Hardware — Edge Device PCB

Custom carrier board for the **Raspberry Pi Compute Module 5** with an integrated **BME688** environmental sensor.

## PCB Images

### Carrier Board
![Carrier Board](images/carrier_board.png)

### Second PCB Revision
![PCB v2](images/2nd_pcb.png)

## Manufacturing

The `gerbers/` folder contains the production-ready Gerber files packaged as a `.zip`.

**To order PCBs:**
1. Go to any PCB manufacturer (JLCPCB, PCBWay, OSH Park, etc.)
2. Upload `gerbers/gmlalo-comblinkiav1-Gerbers-*.zip`
3. Select your preferred stackup (standard 2-layer FR4 is sufficient)

## Measured Variables

| Variable | Sensor | Unit |
|----------|--------|------|
| Temperature | BME688 | °C |
| Relative Humidity | BME688 | % RH |
| Barometric Pressure | BME688 | hPa |
| IAQ (Indoor Air Quality) | BME688 | index 0–500 |

## Firmware

The edge device publishes a JSON payload to the backend every 15 minutes:

```json
{
  "temperature": 25.30,
  "humidity": 42.10,
  "pressure": 1013.25,
  "iaq": 87.0
}
```

Endpoint: `POST http://<backend-ip>:3001/data`
