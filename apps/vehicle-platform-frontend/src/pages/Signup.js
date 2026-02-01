// src/pages/Signup.js
import { useState } from 'react';
import { api } from '../App';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/signup', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} />
      <button type="submit">Sign Up</button>
      <p>{message}</p>
    </form>
  );
}