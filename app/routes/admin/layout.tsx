import { NavLink, Outlet } from "react-router";
import { useState, useEffect } from "react";

// Type declaration untuk CustomEvent
declare global {
  interface WindowEventMap {
    confettiToggle: CustomEvent<{ enabled: boolean }>;
  }
}

export default function AdminLayout() {
  const [confettiEnabled, setConfettiEnabled] = useState(true);

  // Load confetti setting from localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem('confettiEnabled');
    if (savedSetting !== null) {
      setConfettiEnabled(JSON.parse(savedSetting));
    }
  }, []);

  // Toggle confetti setting and save to localStorage
  const toggleConfetti = () => {
    const newValue = !confettiEnabled;
    setConfettiEnabled(newValue);
    localStorage.setItem('confettiEnabled', JSON.stringify(newValue));
    
    // Dispatch custom event to notify other components about the change
    window.dispatchEvent(new CustomEvent('confettiToggle', { detail: { enabled: newValue } }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white h-screen sticky top-0">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">LiuGong Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Dashboard</p>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            <NavLink 
              to="/admin"
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span className="mr-3">👥</span>
              Daftar Peserta
            </NavLink>
            
            {/* <NavLink 
              to="/admin/prize"
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span className="mr-3">🏆</span>
              Manajemen Hadiah
            </NavLink> */}
            
            <NavLink 
              to="/admin/import"
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span className="mr-3">📁</span>
              Import Data
            </NavLink>
            

            {/* Confetti Toggle - Control confetti display globally */}
            <button
              onClick={toggleConfetti}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 w-full text-left transform hover:scale-105 active:scale-95 ${
                confettiEnabled 
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
              }`}
            >
              <span className="mr-3 text-lg">🎉</span>
              <span className="flex-1">Confetti: {confettiEnabled ? 'ON' : 'OFF'}</span>
              <span className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                confettiEnabled ? 'bg-green-300' : 'bg-red-300'
              }`}></span>
            </button>
        
            
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}