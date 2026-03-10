import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import './DronesPage.css';

interface Drone {
  _id: string;
  name: string;
  type: string;
  status: string;
}

const DronesPage: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');

  const load = async () => {
    try {
      const resp = await axios.get('/drones');
      setDrones(resp.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'drone-status-active';
      case 'error':
        return 'drone-status-error';
      default:
        return 'drone-status-idle';
    }
  };

  return (
    <div className="drones-container">
      <div className="drones-content">
        <div className="drones-header">
          <h1 className="drones-title">Drone Fleet</h1>
          <p className="drones-subtitle">Manage and monitor your drones</p>
        </div>

        {error && <div className="drones-error">{error}</div>}

        <div className="drones-list">
          <h2 className="drones-list-title">Your Drones</h2>
          {drones.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', margin: '40px 0' }}>
              No drones yet. Add your first drone below!
            </p>
          ) : (
            <div>
              {drones.map((d) => (
                <div key={d._id} className="drone-item">
                  <Link to={`/drones/${d._id}`} className="drone-link">
                    {d.name} ({d.type})
                  </Link>
                  <span className={`drone-status ${getStatusClass(d.status)}`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="drones-form">
          <h2 className="drones-form-title">Add New Drone</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post('/drones', { name: newName, type: newType, status: 'idle' });
                setNewName('');
                setNewType('');
                load();
              } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to create');
              }
            }}
          >
            <div className="form-group">
              <label className="form-label">Drone Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-input"
                placeholder="Enter drone name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Drone Type</label>
              <input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="form-input"
                placeholder="Enter drone type"
                required
              />
            </div>
            <button type="submit" className="btn-create">Create Drone</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DronesPage;
