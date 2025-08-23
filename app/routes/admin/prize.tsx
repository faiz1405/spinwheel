export default function Prize() {
  // Mock data untuk prize - nanti bisa diambil dari database
  const prizes = [
    {
      id: 1,
      name: "🏆 Grand Prize",
      description: "Hadiah utama untuk pemenang pertama",
      value: "Rp 10.000.000",
      status: "active",
      quantity: 1,
      remaining: 1
    },
    {
      id: 2,
      name: "🥈 Second Prize", 
      description: "Hadiah untuk pemenang kedua",
      value: "Rp 5.000.000",
      status: "active",
      quantity: 2,
      remaining: 2
    },
    {
      id: 3,
      name: "🥉 Third Prize",
      description: "Hadiah untuk pemenang ketiga",
      value: "Rp 2.500.000", 
      status: "active",
      quantity: 3,
      remaining: 3
    },
    {
      id: 4,
      name: "🎁 Consolation Prize",
      description: "Hadiah hiburan untuk peserta",
      value: "Rp 500.000",
      status: "active", 
      quantity: 10,
      remaining: 10
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'claimed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Tidak Aktif';
      case 'claimed': return 'Sudah Diklaim';
      default: return 'Unknown';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Hadiah</h1>
              <p className="text-gray-600">Kelola daftar hadiah untuk LiuGong Gala Dinner 2025</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-lg">📦</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Hadiah</p>
                  <p className="text-lg font-semibold text-gray-900">{prizes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Aktif</p>
                  <p className="text-lg font-semibold text-gray-900">{prizes.filter(p => p.status === 'active').length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-purple-600 text-lg">🎯</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">{prizes.reduce((sum, p) => sum + p.quantity, 0)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-orange-600 text-lg">💰</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-lg font-semibold text-gray-900">Rp 25.000.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prize Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prizes.map((prize) => (
            <div key={prize.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              {/* Prize Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{prize.name.split(' ')[0]}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{prize.name}</h3>
                      <p className="text-sm text-gray-600">{prize.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prize.status)}`}>
                    {getStatusText(prize.status)}
                  </span>
                </div>
                
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {prize.value}
                </div>
              </div>

              {/* Prize Details */}
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm font-medium text-gray-900">{prize.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remaining:</span>
                    <span className={`text-sm font-medium ${prize.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {prize.remaining}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(prize.remaining / prize.quantity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Prize Button */}
        <div className="mt-8 text-center">
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <span className="mr-2">➕</span>
            Tambah Hadiah Baru
          </button>
        </div>

        {/* Development Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Fitur dalam Pengembangan</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Halaman ini masih dalam tahap pengembangan. Fitur edit, detail, dan tambah hadiah akan segera tersedia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}