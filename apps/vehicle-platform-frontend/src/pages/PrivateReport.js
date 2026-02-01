// src/pages/PrivateReport.js
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../App';

export default function PrivateReport() {
  const { identifier } = useParams();
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/private/${identifier}`);
        setReport(res.data.report);
      } catch (err) {
        setMessage('Failed to fetch private report');
      }
    };
    fetchReport();
  }, [identifier]);

  return (
    <div>
      <h2>Private Vehicle Report</h2>
      {message && <p>{message}</p>}
      {report && (
        <div>
          <p><strong>Owner:</strong> {report.owner}</p>
          <p><strong>Accidents:</strong> {report.accidents?.length}</p>
          <p><strong>Impounds:</strong> {report.impounds?.length}</p>
          {/* Add more fields as needed */}
        </div>
      )}
    </div>
  );
}