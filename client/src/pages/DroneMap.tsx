import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from '../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import DroneIcon from '../assets/drone.svg';
import './DroneMap.css';

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

interface DroneMapProps {
  droneId?: string;
  droneName?: string;
  telemetry?: ITelemetry[];
  embedded?: boolean;
}

const DroneMap: React.FC<DroneMapProps> = ({ droneId, droneName: droneNameProp, telemetry: embeddedTelemetry, embedded = false }) => {
  const { id: routeDroneId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const droneIdToUse = droneId || routeDroneId;
  const [droneName, setDroneName] = useState<string>(droneNameProp || 'Drone');
  const [telemetry, setTelemetry] = useState<ITelemetry[]>(embeddedTelemetry ?? []);

  const droneIcon = L.divIcon({
    html: `
      <div class="drone-marker">
        <img src="${DroneIcon}" class="drone-icon" />
        <div class="drone-label">${droneName || 'Drone'}</div>
      </div>
    `,
    className: 'custom-drone-icon',
    iconSize: [90, 90],
    iconAnchor: [45, 45],
  });

  useEffect(() => {
    if (droneNameProp) {
      setDroneName(droneNameProp);
    }
  }, [droneNameProp]);

  useEffect(() => {
    if (embedded) {
      if (Array.isArray(embeddedTelemetry)) {
        setTelemetry(embeddedTelemetry);
      }
      return;
    }

    if (!droneIdToUse) return;

    let socket: any;
    const fetchData = async () => {
      try {
        const droneResp = await axios.get(`/drones/${droneIdToUse}`);
        setDroneName(droneResp?.data?.name);
        const resp = await axios.get(`/drones/${droneIdToUse}/telemetry`);
        const telemetryData = resp?.data;

        if (Array.isArray(telemetryData)) {
          setTelemetry(telemetryData);
        } else {
          console.error('Telemetry data is not an array:', telemetryData);
          setTelemetry([]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    const connectSocket = async () => {
      const { io } = await import('socket.io-client');
      socket = io('http://localhost:4000', {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        socket.emit('subscribe', { droneId: droneIdToUse });
      });
      socket.on('telemetry:update', (msg: any) => {
        if (msg.droneId === droneIdToUse) {
          setTelemetry((prev) => [msg.data, ...prev].slice(0, 100));
        }
      });
    };

    fetchData();
    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [droneIdToUse, embedded, embeddedTelemetry]);

  const positions = Array.isArray(telemetry) ? telemetry.map((data) => [data.location.lat, data.location.lon]) : [];
  const lastPosition = positions.length > 0 ? positions[positions.length - 1] : [32.0853, 34.7818];

  return (
    <div className="drone-map-container">
      <div className="map-header">
        <h1>{droneName || 'Drone'} Flight Path</h1>
      </div>
      <MapContainer center={lastPosition || [32.0853, 34.7818]} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {positions && positions.length > 0 && <Polyline positions={positions} color="#667eea" weight={5} />}
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