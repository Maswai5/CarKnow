import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import Payment from './pages/Payment';
import GateAccess from './pages/GateAccess';
import VehicleLookup from './pages/VehicleLookup';
import PrivateReport from './pages/PrivateReport';
import AdminDashboard from './pages/AdminDashboard';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: false
});

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Welcome to Vehicle Platform</div>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/gate-access" element={<GateAccess />} />
        <Route path="/vehicle-lookup" element={<VehicleLookup />} />
        <Route path="/private/:identifier" element={<PrivateReport />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Add login, OTP, vehicle lookup later */}
      </Routes>
    </Router>
  );
}

export default App;
