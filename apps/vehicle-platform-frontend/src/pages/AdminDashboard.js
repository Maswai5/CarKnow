// src/pages/AdminDashboard.js
import { useEffect, useState } from 'react';
import { api } from '../App';

export default function AdminDashboard({ user }) {
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');

  const isSuperAdmin = user?.role === 'superadmin';
  const isRegularAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isSuperAdmin) {
      const fetchPayments = async () => {
        try {
          const res = await api.get('/admin/payments');
          setPayments(res.data.payments);
        } catch (err) {
          setMessage('Failed to fetch payments');
        }
      };
      fetchPayments();
    }
  }, [isSuperAdmin]);

  if (!isSuperAdmin && !isRegularAdmin) {
    return <p>Access denied. Admins only.</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Admin Dashboard</h2>
      {isSuperAdmin && (
        <>
          <h3>All Payments</h3>
          {message && <p>{message}</p>}
          {payments.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.reference}>
                    <td>{p.reference}</td>
                    <td>{p.email}</td>
                    <td>{p.amount}</td>
                    <td>{p.status}</td>
                    <td>{new Date(p.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No payments found</p>
          )}
        </>
      )}

      {isRegularAdmin && (
        <p>You can view private reports, but payment logs are restricted to superadmins.</p>
      )}
    </div>
  );
}