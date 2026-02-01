// src/pages/Login.js
import { useState } from 'react';
import { api } from '../App';

export default function Login() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="emailOrUsername" placeholder="Email or Username" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <button type="submit">Login</button>
      <p>{message}</p>
    </form>
  );
}