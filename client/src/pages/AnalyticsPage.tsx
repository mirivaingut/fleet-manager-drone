import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  droneName: string;
  avgSpeed: number;
  avgBattery: number;
  count: number;
}

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/drones/analytics');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Drone Fleet Analytics</h1>
      <p>Overview of average speed, battery levels, and telemetry count per drone.</p>

      {data.length === 0 ? (
        <p>No analytics data available. Run the simulator to generate telemetry data.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="droneName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgSpeed" fill="#8884d8" name="Average Speed (m/s)" />
            <Bar dataKey="avgBattery" fill="#82ca9d" name="Average Battery (%)" />
          </BarChart>
        </ResponsiveContainer>
      )}

      <h2>Data Summary</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Drone Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Avg Speed (m/s)</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Avg Battery (%)</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Telemetry Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.droneName}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.avgSpeed.toFixed(2)}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.avgBattery.toFixed(2)}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsPage;