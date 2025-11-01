import { Link, useLocation } from 'react-router-dom';
import { Camera, Shield, BarChart3, Home } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Capturar Evidencia', icon: Camera },
    { path: '/verify', label: 'Verificar Evidencia', icon: Shield },
    { path: '/auditor-dashboard', label: 'Dashboard Auditor', icon: BarChart3 },
  ];

  return (
    <header className="bg-ct-dark border-b border-ct-border shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand Section */}
          <Link to="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
            <img
              src="/Media/LogoCT.png"
              alt="VERITY CTPAT"
              className="w-12 h-12 rounded-md object-contain bg-white p-1 shadow-sm"
            />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                VERITY SECURE PORTAL
              </h1>
              <p className="text-xs text-ct-gray font-medium uppercase tracking-wide">
                CTPAT — Evidence & Chain of Custody
              </p>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-ct-gray hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <select
              value={location.pathname}
              onChange={(e) => window.location.href = e.target.value}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              {navItems.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Blockchain Status */}
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">
              Blockchain Connected
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

