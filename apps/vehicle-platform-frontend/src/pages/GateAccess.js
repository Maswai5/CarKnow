// src/pages/GateAccess.js
import { useState } from 'react';
import { api } from '../App';

export default function GateAccess() {
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  const checkAccess = async () => {
    try {
      const res = await api.get(`/status/${reference}`);
      setStatus(res.data.gateAccessUnlocked);
      setMessage(res.data.gateAccessUnlocked ? 'Gate access is unlocked ✅' : 'Gate access is still locked ❌');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to check status');
    }
  };

  return (
    <div>
      <input
        placeholder="Enter payment reference"
        value={reference}
        onChange={e => setReference(e.target.value)}
      />
      <button onClick={checkAccess}>Check Gate Access</button>
      <p>{message}</p>
    </div>
  );
}