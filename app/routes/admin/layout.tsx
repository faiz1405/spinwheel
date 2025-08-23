import { NavLink, Outlet } from "react-router";

export default function AdminLayout() {
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
            
            <NavLink 
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
            </NavLink>
            
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