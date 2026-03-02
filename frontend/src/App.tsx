import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './pages/SplashScreen';
import LoadingPage from './pages/LoadingPage';
import AuthFlipCard from './pages/AuthFlipCard';
import Dashboard from './pages/Dashboard';
import TemplatesPage from './pages/TemplatesPage';
import ApiSourcesPage from './pages/ApiSourcesPage';
import BuildPage from './pages/BuildPage';
import GenerationsPage from './pages/GenerationsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/welcome" element={<LoadingPage />} />
              <Route path="/login" element={<AuthFlipCard initialSide="login" />} />
              <Route path="/register" element={<AuthFlipCard initialSide="register" />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
              <Route path="/api-sources" element={<ProtectedRoute><ApiSourcesPage /></ProtectedRoute>} />
              <Route path="/build" element={<ProtectedRoute><BuildPage /></ProtectedRoute>} />
              <Route path="/generations" element={<ProtectedRoute><GenerationsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
