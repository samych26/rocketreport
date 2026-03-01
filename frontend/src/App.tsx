import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import TemplatesPage from './pages/TemplatesPage';
import ApiSourcesPage from './pages/ApiSourcesPage';
import BuildPage from './pages/BuildPage';
import GenerationsPage from './pages/GenerationsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
              <Route path="/api-sources" element={<ProtectedRoute><ApiSourcesPage /></ProtectedRoute>} />
              <Route path="/build" element={<ProtectedRoute><BuildPage /></ProtectedRoute>} />
              <Route path="/generations" element={<ProtectedRoute><GenerationsPage /></ProtectedRoute>} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
