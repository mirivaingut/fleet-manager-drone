import React, { useEffect, useRef, useState } from 'react';
import axios from '../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './DroneDetailPage.css';
import BackIcon from '../assets/back.svg';
import DroneMap from './DroneMap';

interface Telemetry {
  _id: string;
  timestamp: string;
  location: { lat: number; lon: number };
  speed: number;
  battery?: number;
}

const DroneDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [droneName, setDroneName] = useState('');
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const droneNameRef = useRef(droneName);
  const socketRef = useRef<any>(null);
  const lastBatteryAlertRef = useRef<number | null>(null);

  useEffect(() => {
    droneNameRef.current = droneName;
  }, [droneName]);

  useEffect(() => {
    if (!id) return;

    let socket: any;
    const loadTelemetry = async () => {
      try {
        const droneResp = await axios.get(`/drones/${id}`);
        setDroneName(droneResp?.data?.name);
        const resp = await axios.get(`/drones/${id}/telemetry`);
        setTelemetry(resp?.data);
      } catch (error) {
        console.error('Failed to load telemetry:', error);
      } finally {
        setLoading(false);
      }
    };

    const connectSocket = async () => {
      if (socketRef.current) return;
      const { io } = await import('socket.io-client');
      socket = io('http://localhost:4000', {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('subscribe', { droneId: id });
        toast.success('Connected to real-time updates', { toastId: 'socket-connected' });
      });
      socket.on('reconnect', () => {
        toast.info('Reconnected to real-time updates', { toastId: 'socket-reconnected' });
        socket.emit('subscribe', { droneId: id });
      });
      socket.on('telemetry:update', (msg: any) => {
        if (msg.droneId === id) {
          setTelemetry((prev) => [msg.data, ...prev].slice(0, 100));
          if (msg.data.battery && msg.data.battery < 30 && msg.data.battery !== lastBatteryAlertRef.current) {
            lastBatteryAlertRef.current = msg.data.battery;
            toast.warn(`Low battery alert for ${droneNameRef.current}: ${msg.data.battery}%`, { toastId: `battery-${msg.data.battery}` });
          }
        }
      });
    };

    loadTelemetry();
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id]);

  const backToList = () => {
    navigate('/drones');
  };

  const getBatteryClass = (battery?: number) => {
    if (!battery) return '';
    if (battery > 70) return 'telemetry-battery-high';
    if (battery > 30) return 'telemetry-battery-medium';
    return 'telemetry-battery-low';
  };

  return (
    <div className="drone-detail-container">
      <div className="drone-detail-content">
        <div className="drone-detail-header">
          <h1 className="drone-detail-title">Drone Telemetry</h1>
          <p className="drone-detail-subtitle">Real-time monitoring and historical data</p>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-title">
            <button onClick={() => backToList()} className="back-to-list">
              <img src={BackIcon} alt="Back" className='back-icon' />
            </button>
            <button onClick={() => setShowMap(!showMap)} className="toggle-map">
              {showMap ? 'Show Telemetry' : 'Show Map'}
            </button>
            <span className='drone-name'>{droneName}</span>

            &nbsp;- Telemetry Data
          </div>

          {showMap ? (
            <DroneMap droneId={id} droneName={droneName} embedded telemetry={telemetry} />
          ) : loading ? (
            <div className="telemetry-loading">Loading telemetry data...</div>
          ) : telemetry.length === 0 ? (
            <div className="telemetry-empty">
              No telemetry data available yet. Start the simulator to generate data.
            </div>
          ) : (
            <div className="telemetry-table">
              <div className="telemetry-header">
                <div>Time</div>
                <div>Latitude</div>
                <div>Longitude</div>
                <div>Speed (m/s)</div>
                <div>Battery (%)</div>
              </div>
              <div className="telemetry-body">
                {telemetry.map((t, index) => (
                  <div key={index} className="telemetry-row">
                    <div className="telemetry-time">
                      {new Date(t.timestamp).toLocaleString()}
                    </div>
                    <div className="telemetry-coords">{t.location.lat.toFixed(6)}</div>
                    <div className="telemetry-coords">{t.location.lon.toFixed(6)}</div>
                    <div className="telemetry-speed">{t.speed.toFixed(1)}</div>
                    <div className={`telemetry-battery ${getBatteryClass(t.battery)}`}>
                      {t.battery ? `${t.battery}%` : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DroneDetailPage;
