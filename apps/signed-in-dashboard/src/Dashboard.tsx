import { useEffect, useState } from 'react';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('carknow_token');
}

async function fetchWithAuth(url: string) {
  const token = getToken();
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Dashboard() {
  const [payments, setPayments] = useState<any[] | null>(null);
  const [cars, setCars] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchWithAuth('http://localhost:5000/api/payments/user'),
      fetchWithAuth('http://localhost:5000/api/ownership/user-cars')
    ])
      .then(([paymentsRes, carsRes]) => {
        setPayments(paymentsRes.payments || paymentsRes);
        setCars(carsRes.cars || carsRes);
      })
      .catch((err) => setError(err.message || 'Failed to fetch data'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">User Dashboard</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <>
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2">Payments</h3>
            {payments && payments.length > 0 ? (
              <ul className="list-disc pl-6">
                {payments.map((p, i) => (
                  <li key={i}>{JSON.stringify(p)}</li>
                ))}
              </ul>
            ) : (
              <div>No payments found.</div>
            )}
          </section>
          <section>
            <h3 className="text-lg font-medium mb-2">Owned Cars</h3>
            {cars && cars.length > 0 ? (
              <ul className="list-disc pl-6">
                {cars.map((c, i) => (
                  <li key={i}>{JSON.stringify(c)}</li>
                ))}
              </ul>
            ) : (
              <div>No cars found.</div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
