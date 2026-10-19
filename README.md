# AIoT Platform for Industrial Environmental Monitoring

Open-source AIoT edge device for continuous measurement, storage, visualization,
anomaly detection, forecasting and natural-language interpretation of
temperature and relative humidity in industrial settings.

> Associated publication: *"AIoT Platform Architecture for Industrial Environmental Monitoring"*
> Oscar E. Gomez-Morales, Francisco J. Olivera-Guerrero, Leonor A. Cardenas-Robledo
> Centro de Tecnología Avanzada — CIATEQ A.C., Mexico

This is **v2** of the platform. The first version sent raw sensor readings to an
LLM and asked it to interpret them. v2 moves all the intelligence into a
measurable, evaluable **Machine Learning core** (anomaly detection +
forecasting) running on the device itself; the LLM is only a natural-language
layer that reads results the ML service has already calculated.

---

## System Architecture

Everything runs on a single **Raspberry Pi CM5** on a custom carrier board. The
components talk to each other over HTTP / Socket.IO on `localhost` and share one
SQLite database.

```
 ┌──────────────┐  POST /data (60 s)   ┌───────────────────────────────┐
 │  sensor/     │ ───────────────────► │  api/  (Node.js)              │
 │  SHT85 · I2C │                      │  Express 5 · Socket.IO        │
 └──────────────┘                      │  SQLite (better-sqlite3)      │
                                       │                               │
 ┌──────────────┐  POST /ml/update     │  • PIN-protected web UI       │
 │  ml/         │ ───────────────────► │  • Alerts: Telegram · Teams   │
 │  anomaly +   │ ◄─── reads SQLite ── │    (+ WhatsApp · Email)       │
 │  forecast    │      (60 s cycle)    │  • Chat: OpenAI / Claude      │
 └──────────────┘                      │    via read-only tools        │
                                       └──────────────┬────────────────┘
 ┌──────────────┐                                     │
 │  display/    │ ◄──────── reads SQLite ─────────────┤ data/blackorbs.db
 │  SSD1306     │                                     │
 │  OLED ring   │                      Browser ◄──────┘ REST + Socket.IO
 └──────────────┘
```

| Component | Language | Role |
|---|---|---|
| [`api/`](api) | Node.js | Ingestion, persistence, ML state, alerts, LLM chat, static web UI |
| [`ml/`](ml) | Python | Hybrid anomaly detector + forecaster, publishes device "mood" |
| [`sensor/`](sensor) | Python | Reads the SHT85 over I2C and posts readings |
| [`display/`](display) | Python | Draws the current mood as a ring on the OLED |
| [`hardware/`](hardware) | — | Carrier board renders and Gerber files |
| [`deploy/systemd/`](deploy/systemd) | — | Service units used in production |

### Machine Learning core (`ml/`)

Runs every `ML_CICLO_SEGUNDOS` (default 60 s) over the latest 2000 readings:

- **Anomaly detection — two stages.**
  - *< 200 readings:* z-score of the latest reading against a rolling window of
    the previous 50 (`attention` ≥ 2σ, `critical` ≥ 3.5σ).
  - *≥ 200 readings:* multivariate **Isolation Forest** (200 trees), retrained
    every cycle. Severity thresholds come from the data's own score
    distribution (`critical` ≤ p5, `attention` ≤ p15), not from hand-set limits.
- **Forecasting.** Persistence while history is short; **Holt's exponential
  smoothing with damped trend** (statsmodels) once enough points exist. The
  horizon is set in minutes (`ML_HORIZONTE_MINUTOS`, default 60) and converted
  to steps from the real sampling interval. Confidence is reported as `low`
  until there are at least `max(30, 2 × steps)` points.
- **Mood.** The worst of the anomaly severity and the severity of the
  forecasted values (only when forecast confidence is high) becomes the device
  mood: `happy` · `attention` · `critical` (plus `thinking` while the chat is
  answering). The API is the single source of truth for it.

### Alerts

When the mood **transitions** to `attention` or `critical`, the API logs the
event in `alertas` and notifies Telegram and Microsoft Teams. Channels without
credentials are skipped. Manual WhatsApp (Twilio), Telegram and email alerts
are also exposed as endpoints.

### Natural-language chat

`POST /chat` with `provider: "openai"` (GPT-4o) or `"claude"`. The model never
computes anomalies or forecasts itself; it can only call four read-only tools
over data already in SQLite:

| Tool | Returns |
|---|---|
| `get_estado_actual` | Current ML state: mood, anomaly score/variable, normality %, forecast |
| `get_ultima_lectura` | Latest sensor reading |
| `get_historial_lecturas` | Readings from the last N minutes |
| `get_alertas_recientes` | Most recent alerts |

Every exchange is stored in `consultas_ia`.

### Web UI

Served by the API from `api/public/` and protected by a PIN login
(`APP_PIN`, 12 h session, rate-limited attempts):

- **`/`** — device panel: animated mood ring, live readings, ML state,
  forecast, and chat with optional text-to-speech replies.
- **`/graficas.html`** — temperature/humidity charts and recent alerts.

---

## Repository Structure

```
aiot_ciateq/
├── api/
│   ├── AI/             OpenAI and Anthropic clients
│   ├── Controllers/    data, ML state, alerts, chat, auth
│   ├── Routes/
│   ├── Services/       Telegram, Teams, WhatsApp, email notifiers
│   ├── db/             SQLite connection + schema.sql
│   ├── middleware/     PIN session gate
│   ├── public/         index.html, graficas.html, login.html
│   └── .env.example
├── ml/                 service.py, anomaly.py, forecast.py
├── sensor/             read_loop.py, calibration.json
├── display/            ring_display.py
├── deploy/systemd/     blackorbs-v2-{api,ml,sensor,display}.service
├── hardware/           PCB images and Gerbers
└── data/               SQLite database (created at runtime, git-ignored)
```

---

## Quick Start

### Prerequisites

- Raspberry Pi (developed on a CM5) with I2C enabled
- SHT85 sensor and SSD1306 OLED on the I2C bus (default bus `6`)
- Node.js ≥ 18, Python ≥ 3.11
- An API key for OpenAI and/or Anthropic (only needed for chat)

### 1 — API

```bash
cd api
npm install
cp .env.example .env      # set APP_PIN, SESSION_SECRET and the keys you use
npm start                 # http://<device>:3001
```

The SQLite file and schema are created automatically on first start.

### 2 — Python services

Each Python component has its own virtualenv created in its own folder (this
is what the systemd units expect):

```bash
for svc in ml sensor display; do
  (cd $svc && python3 -m venv . && bin/pip install -r requirements.txt)
done

cd ml && bin/python service.py           # ML cycle
cd sensor && bin/python read_loop.py     # sensor loop
cd display && bin/python ring_display.py # OLED
```

### 3 — Run as services (production)

```bash
sudo cp deploy/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now blackorbs-v2-api blackorbs-v2-ml blackorbs-v2-sensor blackorbs-v2-display
```

The units assume the repository lives at `/home/blackorbs/blackorbs-v2` and
runs as user `blackorbs`; edit `User=`, `WorkingDirectory=` and `ExecStart=` if
yours differs. All units use `Restart=always`.

---

## Configuration

### API (`api/.env`)

| Variable | Description |
|---|---|
| `APP_PIN` | PIN for the web UI login |
| `SESSION_SECRET` | Secret used to sign session cookies |
| `PORT` | HTTP port (default `3001`) |
| `DEVICE_ID` | Device identifier (default `ORBE_001`) |
| `SQLITE_PATH` | Database path (default `data/blackorbs.db`) |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | LLM providers for the chat |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Telegram alerts |
| `TEAMS_WEBHOOK_URL` | Microsoft Teams incoming webhook |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` / `ALERT_WHATSAPP_TO` | WhatsApp alerts |
| `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_TO` | Gmail SMTP alerts |

### Python services (environment variables)

| Variable | Default | Used by |
|---|---|---|
| `DEVICE_ID` | `ORBE_001` | ml, display |
| `SQLITE_PATH` | `data/blackorbs.db` | ml, display |
| `ML_API_URL` | `http://localhost:3001` | ml |
| `ML_CICLO_SEGUNDOS` | `60` | ml |
| `ML_HORIZONTE_MINUTOS` | `60` | ml |
| `SENSOR_I2C_BUS` / `SENSOR_I2C_ADDR` | `6` / `0x44` | sensor |
| `SENSOR_API_URL` | `http://localhost:3001/data` | sensor |
| `SENSOR_INTERVALO_SEGUNDOS` | `60` | sensor |
| `DISPLAY_I2C_BUS` / `DISPLAY_I2C_ADDR` | `6` / `0x3C` | display |
| `DISPLAY_REFRESCO_SEGUNDOS` | `60` | display |

Sensor offsets live in `sensor/calibration.json` and are re-read every cycle,
so calibration can be adjusted without restarting the service.

> **Self-heating note.** A continuously animated display raised the sensor
> reading by ~1–2 °C through sustained CPU load. The display therefore draws a
> single static frame per minute and sleeps in between.

---

## API Reference

All routes require an authenticated session, except `POST /data` and
`POST /ml/update` from loopback (used by the local Python services).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | `{pin}` → starts a session |
| `POST` | `/logout` | Ends the session |
| `POST` | `/data` | `{temperature, humidity, pressure?}` — ingest a reading |
| `GET` | `/data?limit=500` | Latest readings, newest first |
| `POST` | `/ml/update` | ML service publishes the current state |
| `GET` | `/ml/state` | Current ML state |
| `GET` | `/alerts?limit=200` | Alert log |
| `POST` | `/sendAlertsWhats` · `/sendAlertsTelegram` · `/sendAlertsEmail` | Manual alerts `{temperature, humidity, sensor}` |
| `POST` | `/chat` | `{message, provider: "openai" \| "claude"}` |
| `GET` | `/chat/history?limit=50` | Past chat exchanges |

**Socket.IO events:** `newData` (new reading), `mlUpdate` (new ML state),
`chatMood` (`thinking` while the LLM answers).

### Database

Schema in [`api/db/schema.sql`](api/db/schema.sql):

| Table | Content |
|---|---|
| `lecturas` | Sensor readings |
| `alertas` | Alerts (ML transitions and manual) |
| `consultas_ia` | Chat prompts and answers |
| `ml_estado` | Current ML state per device (one row) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Hardware | Raspberry Pi CM5 · Sensirion SHT85 · SSD1306 OLED · custom carrier PCB |
| Backend | Node.js · Express 5 · Socket.IO · SQLite (better-sqlite3) · express-session |
| ML | Python · pandas · scikit-learn (Isolation Forest) · statsmodels (Holt) |
| LLM | OpenAI GPT-4o · Anthropic Claude (tool use) |
| Alerts | Telegram Bot API · Microsoft Teams webhook · Twilio WhatsApp · Nodemailer |
| Frontend | Static HTML/JS served by the API · Socket.IO client · Web Speech API |

---

## License

MIT — see [LICENSE](LICENSE).

---

*Built at CIATEQ A.C. — Centro de Tecnología Avanzada, Mexico.*
