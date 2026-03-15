import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useParams } from 'react-router-dom';
import './DroneDetailPage.css';
import BackIcon from '../assets/back.svg';

interface Telemetry {
  _id: string;
  timestamp: string;
  location: { lat: number; lon: number };
  speed: number;
  battery?: number;
}

const DroneDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [droneName, setDroneName] = useState('');
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

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

    loadTelemetry();

    // socket for realtime
    import('socket.io-client').then(({ io }) => {
      const socket = io('http://localhost:4000');
      socket.emit('subscribe', { droneId: id });
      socket.on('telemetry:update', (msg: any) => {
        if (msg.droneId === id) {
          setTelemetry((prev) => [msg.data, ...prev].slice(0, 100));
        }
      });
      return () => {
        socket.disconnect();
      };
    });
  }, [id]);

  const backToList = () => {
    window.history.back();
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
            <span className='drone-name'>{droneName}</span>

            &nbsp;- Telemetry Data
          </div>

          {loading ? (
            <div className="telemetry-loading">Loading telemetry data...</div>
          ) : telemetry.length === 0 ? (
            <div className="telemetry-empty">
              No telemetry data available yet. Start the simulator to generate data.
            </div>
          ) : (
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Speed (m/s)</th>
                  <th>Battery (%)</th>
                </tr>
              </thead>
              <tbody>
                {telemetry.map((t) => (
                  <tr key={t._id}>
                    <td className="telemetry-time">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                    <td className="telemetry-coords">{t.location.lat.toFixed(6)}</td>
                    <td className="telemetry-coords">{t.location.lon.toFixed(6)}</td>
                    <td className="telemetry-speed">{t.speed.toFixed(1)}</td>
                    <td className={`telemetry-battery ${getBatteryClass(t.battery)}`}>
                      {t.battery ? `${t.battery}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DroneDetailPage;
