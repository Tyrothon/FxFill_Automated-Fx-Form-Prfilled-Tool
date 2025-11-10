// App 组件
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UploadPage from './pages/UploadPage';
import RiskAnalysisPage from './pages/RiskAnalysisPage';
import FxFormPage from './pages/FxFormPage';
import DownloadPage from './pages/DownloadPage';
import RemittanceFormPage from './pages/RemittanceFormPage';
import RemittanceFormHSBC from './pages/RemittanceFormHSBC';
import RemittanceFormBOC from './pages/RemittanceFormBOC';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotPage from './pages/ChatbotPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ErrorBoundary from './components/ErrorBoundary';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: Helvetica, Arial, sans-serif;
`;

function App() {
  return (
    <AuthProvider>
      <AppContainer>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/fx-form" element={<FxFormPage />} />
              <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/remittance-form" element={<RemittanceFormPage />} />
              <Route path="/remittance-form-HSBC" element={<RemittanceFormHSBC />} />
              <Route path="/remittance-form-BOC" element={<RemittanceFormBOC />} />
              <Route path="/remittance-form-SCB" element={<RemittanceFormPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
            </Routes>
          </ErrorBoundary>
        </Router>
      </AppContainer>
    </AuthProvider>
  );
}

export default App;