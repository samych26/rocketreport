import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './pages/SplashScreen';
import LoadingPage from './pages/LoadingPage';
import AuthFlipCard from './pages/AuthFlipCard';
import Dashboard from './pages/Dashboard';
import TemplatesPage from './pages/TemplatesPage';
import ApiSourcesPage from './pages/ApiSourcesPage';
import ApiEndpointsPage from './pages/ApiEndpointsPage';
import BuildPage from './pages/BuildPage';
import GenerationsPage from './pages/GenerationsPage';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyEmailSentPage from './pages/VerifyEmailSentPage';
import McpDocsPage from './pages/McpDocsPage';
import './App.css';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/welcome" element={<LoadingPage />} />
              <Route path="/mcp-docs" element={<McpDocsPage />} />
              <Route path="/login" element={<AuthFlipCard initialSide="login" />} />
              <Route path="/register" element={<AuthFlipCard initialSide="register" />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
              <Route path="/api-sources" element={<ProtectedRoute><ApiSourcesPage /></ProtectedRoute>} />
              <Route path="/api-sources/:sourceId/endpoints" element={<ProtectedRoute><ApiEndpointsPage /></ProtectedRoute>} />
              <Route path="/build" element={<ProtectedRoute><BuildPage /></ProtectedRoute>} />
              <Route path="/generations" element={<ProtectedRoute><GenerationsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-email-sent" element={<VerifyEmailSentPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
