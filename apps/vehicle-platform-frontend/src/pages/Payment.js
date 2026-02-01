// src/pages/Payment.js
import { useState } from 'react';
import { api } from '../App';

export default function Payment() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [message, setMessage] = useState('');

  const handlePayment = async () => {
    try {
      const res = await api.post('/initiate-payment', { emailOrUsername });
      if (res.data?.paymentLink) {
        window.location.href = res.data.paymentLink; // redirect to SeerBit
      } else {
        setMessage('Payment link not received');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Payment failed');
    }
  };

  return (
    <div>
      <input
        placeholder="Email or Username"
        value={emailOrUsername}
        onChange={e => setEmailOrUsername(e.target.value)}
      />
      <button onClick={handlePayment}>Pay Now</button>
      <p>{message}</p>
    </div>
  );
}