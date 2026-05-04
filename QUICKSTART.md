# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally or via Docker
- Redis (optional, for production caching)

## Development Setup

### 1. Install Dependencies
```powershell
# Server
cd server
npm install

# Client
cd client
npm install
```

### 2. Create Environment Files

**server/.env**
```
MONGO_URI=mongodb://localhost:27017/fleet
JWT_SECRET=your-super-secret-key-change-me
REDIS_URL=redis://localhost:6379
PORT=4000
NODE_ENV=development
```

**client/.env** (optional, client proxies to server)
```
VITE_API_URL=http://localhost:4000
```

### 3. Start Services

**Option A: Manual Development (3 terminals)**

Terminal 1 - Server:
```powershell
cd server
npm run dev
# Server runs on http://localhost:4000
```

Terminal 2 - Client:
```powershell
cd client
npm run dev
# Client runs on http://localhost:5173
```

Terminal 3 - Simulator (optional):
```powershell
cd server
npm run sim
# Sends random telemetry data to MongoDB every few seconds
```

**Option B: Docker Compose (Recommended for production-like setup)**
```powershell
docker-compose up --build
# Server: http://localhost:4000
# Client: http://localhost:5173
```

### 4. Access the Application
1. Open http://localhost:5173 in your browser
2. Register a new user or use test credentials
3. Navigate to the Drones page to start managing
4. Click on a drone to see real-time telemetry

## Key Features to Try

### Dark Mode
- Look for theme toggle button in the header
- Preference is saved automatically

### Drone Management
- **Create:** Click "Add Drone" button
- **Edit:** Click on a drone to view details and edit
- **Delete:** Use the delete button with confirmation
- **Monitor:** Real-time telemetry on the detail page

### Real-time Monitoring
- Run the simulator: `npm run sim`
- Watch telemetry data update in real-time
- Multiple telemetry entries show in scrollable list
- Battery status color-coded (green/yellow/red)

### API Testing
Use Postman or VS Code REST Client to test:

```
### Register
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "user@example.com",
  "password": "password123"
}

### Login
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### Create Drone
POST http://localhost:4000/api/drones
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "name": "Drone-001",
  "type": "quadcopter",
  "status": "idle"
}

### Post Telemetry with Sensors
POST http://localhost:4000/api/drones/{droneId}/telemetry
Content-Type: application/json

{
  "location": {
    "lat": 37.7749,
    "lon": -122.4194
  },
  "speed": 25.5,
  "battery": 85,
  "sensors": {
    "temperature": 22.3,
    "humidity": 65,
    "altitude": 150
  }
}
```

## Troubleshooting

### Server won't start
- Check MongoDB is running: `mongod`
- Check port 4000 is not in use
- Check environment variables in .env

### Client shows blank page
- Clear browser cache
- Check browser console for errors (F12)
- Ensure server is running on port 4000

### Real-time updates not working
- Check Socket.IO in browser DevTools
- Verify server logs for connection messages
- Ensure firewall allows WebSocket connections

### Tests fail
- MongoDB must be running
- Run: `cd server && npm test`
- Tests create a test database automatically

## Production Deployment

### With Docker
```bash
# Build and run
docker-compose -f docker-compose.yml up --build

# Specific environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

### Manual Build & Run
```powershell
# Server
cd server
npm run build
npm start

# Client (separate process or with nginx)
cd client
npm run build
# Serve dist/ folder with static server
```

## Architecture

```
├── server/                    # Express API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── models/           # Mongoose schemas
│   │   ├── middleware/       # Auth, logging
│   │   ├── cache.ts          # Redis cache
│   │   └── io.ts             # Socket.IO setup
│   └── dist/                 # Compiled JavaScript
│
└── client/                    # React + Vite
    ├── src/
    │   ├── pages/            # Page components
    │   ├── components/       # Reusable components
    │   ├── utils/            # Helpers & axios
    │   ├── theme.tsx         # Dark mode theme
    │   └── auth.tsx          # Auth context
    └── dist/                 # Built files

```

## Performance Tips

1. **Enable Caching:** Redis significantly speeds up drone list queries
2. **Use Pagination:** Always paginate large result sets
3. **Monitor Telemetry:** Use the analytics endpoint to track fleet health
4. **Index Queries:** Database indexes are pre-configured

## Development Commands

```powershell
# Linting & Formatting
npm run lint
npm run format

# Type Checking
tsc --noEmit

# Build for Production
cd server && npm run build
cd client && npm run build

# View Logs
npm start (with logging enabled)
```

## Getting Help

- Check IMPLEMENTATION_SUMMARY.md for feature details
- Review API responses for error messages
- Check server console for detailed logs
- Verify .env files have required variables

---

**Happy Droning! 🚁**
