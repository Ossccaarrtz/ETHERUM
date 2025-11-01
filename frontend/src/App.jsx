import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import VerifyPage from './pages/VerifyPage';
import AuditorDashboard from './pages/AuditorDashboard';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/auditor-dashboard" element={<AuditorDashboard />} />
        </Routes>

        {/* Footer */}
        <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm mt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span>Powered by</span>
                <span className="font-semibold text-slate-900">IPFS</span>
                <span>•</span>
                <span className="font-semibold text-slate-900">Arbitrum</span>
                <span>•</span>
                <span className="font-semibold text-slate-900">Scroll</span>
              </div>
              <div className="text-xs text-slate-500">
                © 2025 VERITY. All rights reserved.
              </div>
            </div>
          </div>
        </footer>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
