// src/pages/VerifyOtp.js
import { useState } from 'react';
import { api } from '../App';

export default function VerifyOtp() {
  const [form, setForm] = useState({ emailOrUsername: '', otp: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/verify-otp', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'OTP verification failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="emailOrUsername" placeholder="Email or Username" onChange={handleChange} />
      <input name="otp" placeholder="Enter OTP" onChange={handleChange} />
      <button type="submit">Verify OTP</button>
      <p>{message}</p>
    </form>
  );
}