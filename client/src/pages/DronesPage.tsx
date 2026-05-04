import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import DeleteIcon from '../assets/delete.svg';
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
  const [newStatus, setNewStatus] = useState('idle');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editStatus, setEditStatus] = useState('idle');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await axios.get('/drones');
      setDrones(resp.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteDrone = async (id: string) => {
    if (!confirm('Are you sure you want to delete this drone?')) return;
    try {
      await axios.delete(`/drones/${id}`);
      load();
      toast.success('Drone deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete drone';
      setError(message);
      toast.error(message);
    }
  };

  const startEdit = (drone: Drone) => {
    setEditingId(drone._id);
    setEditName(drone.name);
    setEditType(drone.type);
    setEditStatus(drone.status);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditType('');
    setEditStatus('idle');
  };

  const updateDrone = async (id: string) => {
    if (!editName.trim() || !editType.trim()) {
      setError('Name and type are required');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`/drones/${id}`, { name: editName.trim(), type: editType.trim(), status: editStatus });
      setEditingId(null);
      load();
      toast.success('Drone updated successfully');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update drone';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
          {loading && <p>Loading...</p>}
          {drones.length === 0 && !loading ? (
            <p style={{ color: '#666', textAlign: 'center', margin: '40px 0' }}>
              No drones yet. Add your first drone below!
            </p>
          ) : (
            <div>
              {drones.map((d) => (
                <div key={d._id} className="drone-item">
                  {editingId === d._id ? (
                    <div className="edit-form">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="form-input"
                        placeholder="Name"
                      />
                      <input
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className="form-input"
                        placeholder="Type"
                      />
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="form-input"
                      >
                        <option value="idle">Idle</option>
                        <option value="flying">Flying</option>
                        <option value="offline">Offline</option>
                      </select>
                      <button onClick={() => updateDrone(d._id)} disabled={loading} className="icon-btn btn-save" aria-label="Save changes">
                        <span aria-hidden="true">✅</span>
                        <span className="visually-hidden">Save</span>
                      </button>
                      <button onClick={cancelEdit} className="icon-btn btn-cancel" aria-label="Cancel edit">
                        <span aria-hidden="true">✖️</span>
                        <span className="visually-hidden">Cancel</span>
                      </button>
                    </div>
                  ) : (
                    <div className='left-line'>
                      <button onClick={() => startEdit(d)} className="icon-btn btn-edit" aria-label="Edit drone">
                        <span aria-hidden="true">✏️</span>
                        <span className="visually-hidden">Edit</span>
                      </button>
                      <button onClick={() => deleteDrone(d._id)} className="icon-btn btn-delete" aria-label="Delete drone">
                        <img src={DeleteIcon} alt="" className="icon-image" />
                        <span className="visually-hidden">Delete</span>
                      </button>
                      <Link to={`/drones/${d._id}`} className="drone-link">
                        {d.name} ({d.type})
                      </Link>
                    </div>
                  )}
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
              if (!newName.trim() || !newType.trim()) {
                setError('Name and type are required');
                return;
              }
              setLoading(true);
              try {
                await axios.post('/drones', { name: newName.trim(), type: newType.trim(), status: newStatus });
                setNewName('');
                setNewType('');
                setNewStatus('idle');
                load();
                toast.success('Drone created successfully');
              } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to create drone';
                setError(message);
                toast.error(message);
              } finally {
                setLoading(false);
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
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-input"
              >
                <option value="idle">Idle</option>
                <option value="flying">Flying</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? 'Creating...' : 'Create Drone'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DronesPage;
