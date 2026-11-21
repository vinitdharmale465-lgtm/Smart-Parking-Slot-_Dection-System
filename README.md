# Path Finder - MERN login for the Smart Parking dashboard

## Setup
1. Copy your dashboard file to `server/protected/dashboard.html`.
2. Server:
   cd server && cp .env.example .env   (edit JWT_SECRET and MONGO_URI)
   npm install && npm run dev
3. Client (new terminal):
   cd client && npm install && npm run dev
4. Open http://localhost:5173 -> Register -> the dashboard appears.

## Production
cd client && npm run build
cd ../server && NODE_ENV=production npm start   (API + React build on one port)

## ESP32 note
The dashboard calls http://<esp32-ip>/status from the browser. Keep the site on http://
(or localhost): an https page cannot call an http ESP32 (mixed content).
The ESP32 must also send CORS headers:
  server.sendHeader("Access-Control-Allow-Origin", "*");
