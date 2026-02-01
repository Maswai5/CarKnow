import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import VehicleLookup from './pages/VehicleLookup';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">CarKnow</h1>
            <nav className="space-x-4">
              <Link to="/" className="text-indigo-600">Home</Link>
              <Link to="/lookup" className="text-indigo-600">Lookup</Link>
              <Link to="/login" className="text-indigo-600">Login</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<div className="text-center py-20">
              <h2 className="text-3xl font-semibold mb-4">Welcome to CarKnow</h2>
              <p className="text-gray-600">A fresh frontend connected to your backend for vehicle lookups and payments.</p>
            </div>} />
            <Route path="/lookup" element={<VehicleLookup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
