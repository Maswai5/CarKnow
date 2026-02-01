import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../App';

export default function VehicleLookup() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLookup = async () => {
    try {
      const res = await api.get(`/reports/public/${query}`);
      setResult(res.data.report);
      setMessage('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Vehicle not found');
      setResult(null);
    }
  };

  const checkGateAccess = async () => {
    try {
      const res = await api.get(`/status/${query}`);
      if (res.data.gateAccessUnlocked) {
        navigate(`/private-report/${query}`);
      } else {
        setMessage('Full report is locked. Please complete payment to unlock.');
      }
    } catch (err) {
      setMessage('Error checking gate access');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Vehicle Lookup</h2>
      <input
        placeholder="Enter plate or VIN"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: '0.5rem', padding: '0.5rem', width: '100%' }}
      />
      <button onClick={handleLookup} style={{ marginBottom: '1rem' }}>
        Lookup Vehicle
      </button>

      {message && <p>{message}</p>}

      {result && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '6px' }}>
          <h3>Vehicle Info</h3>
          <p><strong>Plate:</strong> {result.plate}</p>
          <p><strong>VIN:</strong> {result.vin}</p>
          <p><strong>Make:</strong> {result.make}</p>
          <p><strong>Model:</strong> {result.model}</p>
          <p><strong>Year:</strong> {result.year}</p>

          <button onClick={checkGateAccess} style={{ marginTop: '1rem' }}>
            View Full Report
          </button>
        </div>
      )}
    </div>
  );
}