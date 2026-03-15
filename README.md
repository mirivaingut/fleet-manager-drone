# Fleet Manager (Drone Edition)

Full-stack example app using React + Node.js/TypeScript.

## Structure
- `/server` – Express-based API, MongoDB via Mongoose, Socket.IO placeholder
- `/client` – Vite-powered React SPA

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB running locally or reachable via `MONGO_URI`

### Run server
```powershell
cd server
npm install
# create .env with MONGO_URI and JWT_SECRET (see .env.example)
npm run dev
```

### Run client
```powershell
cd client
npm install
npm run dev
```

The client is configured to proxy `/api` to `http://localhost:4000` via `vite.config.ts`.

### Using the app
1. Open `http://localhost:5173` in your browser.
2. Register a new user via `POST /api/auth/register` (e.g. using Postman) or add a temporary route.
3. Log in via the login page; after success you are redirected to `/dashboard`.
4. Navigate to `/drones` to see the list of drones (initially empty).
5. Use the form on that page to add a new drone; the token is sent automatically.

### Simulator & telemetry

Run the simulator from the server folder with 
```powershell
cd server
npm run sim
```
it will connect to the database and periodically insert random telemetry for each drone. Every insertion also emits a `telemetry:update` Socket.IO event that the client can listen for (the detail page subscribes automatically).


## Next steps
- Implement protected routes and token storage in client
- Add drone CRUD UI, map integration, and realtime sockets
- Write tests and configure CI

