import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './DroneMap.css';

const droneIcon = L.icon({
  iconUrl: '/assets/drone.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface ITelemetry {
  droneId: string;
  timestamp: Date;
  location: {
    lat: number;
    lon: number;
  };
  speed: number;
  battery: number;
}

interface DroneMapProps {}

const DroneMap: React.FC<DroneMapProps> = () => {
  const { id: droneId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [droneName, setDroneName] = useState<string>('');
  const [telemetry, setTelemetry] = useState<ITelemetry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const droneResp = await axios.get(`/drones/${droneId}`);
        setDroneName(droneResp?.data?.name);
        const resp = await axios.get(`/drones/${droneId}/telemetry`);
        setTelemetry(resp?.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    if (droneId) {
      fetchData();

      // Real-time updates
      import('socket.io-client').then(({ io }) => {
        const socket = io('http://localhost:4000');
        socket.emit('subscribe', { droneId });
        socket.on('telemetry:update', (msg: any) => {
          if (msg.droneId === droneId) {
            setTelemetry((prev) => [msg.data, ...prev].slice(0, 100));
          }
        });
        return () => {
          socket.disconnect();
        };
      });
    }
  }, [droneId]);

  const positions = telemetry && telemetry.length && telemetry.map(data => [data.location.lat, data.location.lon]);
  const lastPosition = positions && positions.length &&positions[positions.length - 1];

  return (
    <div className="drone-map-container">
      <div className="map-header">
        <button onClick={() => navigate(`/drones/${droneId}`)} className="back-button">
          ← Back to Telemetry
        </button>
        <h1>{droneName} Flight Path</h1>
      </div>
      <MapContainer center={lastPosition || [32.0853, 34.7818]} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {positions && positions.length > 0 && <Polyline positions={positions} color="blue" />}
        {lastPosition && (
          <Marker position={lastPosition} icon={droneIcon}>
            <Popup>
              <div>
                <h2>{droneName}</h2>
                <p>Battery: {telemetry[telemetry.length - 1]?.battery}%</p>
                <p>Speed: {telemetry[telemetry.length - 1]?.speed} m/s</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default DroneMap;