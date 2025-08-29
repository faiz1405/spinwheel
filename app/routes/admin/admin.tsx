import type { Route } from "../+types/admin";
import { Form } from "react-router";
import { useState, useEffect } from "react";
import prisma from "../../lib/prismaClient";

// Type declaration untuk CustomEvent
declare global {
  interface WindowEventMap {
    customModeToggle: CustomEvent<{ enabled: boolean }>;
  }
}

export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const search = url.searchParams.get("search") || "";
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build where clause for search
  const whereClause = search ? {
    OR: [
      { uniqueId: { contains: search, mode: 'insensitive' as const } },
      { name: { contains: search, mode: 'insensitive' as const } }
    ]
  } : {};

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: { id: true, uniqueId: true, name: true, createdAt: true, wonAt: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({
      where: whereClause,
    })
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  return { 
    users, 
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    search
  };
}

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "resetWinners") {
    await prisma.user.updateMany({
      data: { wonAt: null }
    });
    return { success: true, message: "Semua pemenang berhasil direset!" };
  }
  
  if (action === "setCustomWinner") {
    const userId = formData.get("userId") as string;
    const uniqueId = formData.get("uniqueId") as string;
    
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { wonAt: new Date() }
      });
      return { success: true, message: `Peserta dengan ID ${uniqueId} berhasil diset sebagai pemenang!` };
    }
  }
  
  if (action === "removeCustomWinner") {
    const userId = formData.get("userId") as string;
    const uniqueId = formData.get("uniqueId") as string;
    
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { wonAt: null }
      });
      return { success: true, message: `Status pemenang untuk ${uniqueId} berhasil dihapus!` };
    }
  }
  
  return { success: false };
}

export function meta() {
  return [
    { title: "Admin - LiuGong Spinwheel" },
    { name: "description", content: "Admin page for LiuGong Spinwheel" },
  ];
}

export default function Admin({loaderData, actionData}: Route.ComponentProps & { actionData?: any }) {
  const { users, pagination, search } = loaderData;
  const [customModeEnabled, setCustomModeEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search);

  // Load custom mode setting from localStorage
  useEffect(() => {
    const savedCustomModeSetting = localStorage.getItem('customModeEnabled');
    if (savedCustomModeSetting !== null) {
      setCustomModeEnabled(JSON.parse(savedCustomModeSetting));
    }
  }, []);

  // Listen for custom mode toggle events
  useEffect(() => {
    const handleCustomModeToggle = (event: CustomEvent) => {
      setCustomModeEnabled(event.detail.enabled);
    };

    window.addEventListener('customModeToggle', handleCustomModeToggle as EventListener);
    
    return () => {
      window.removeEventListener('customModeToggle', handleCustomModeToggle as EventListener);
    };
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    params.set('page', '1'); // Reset to first page when searching
    window.location.search = params.toString();
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    params.set('page', newPage.toString());
    window.location.search = params.toString();
  };

  // Hitung statistik
  const totalUsers = pagination.totalUsers;
  const winners = users.filter((u: any) => u.wonAt).length;
  const remainingUsers = totalUsers - winners;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8">Admin Dashboard</h1>
        
        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
            <div className="text-gray-600">Total Peserta</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{winners}</div>
            <div className="text-gray-600">Sudah Menang</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{remainingUsers}</div>
            <div className="text-gray-600">Belum Menang</div>
          </div>
        </div>

        {/* Reset Winners Button */}
        {winners > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reset Pemenang</h3>
                <p className="text-gray-600">Reset semua pemenang agar bisa ikut lagi</p>
              </div>
              <Form method="post">
                <input type="hidden" name="action" value="resetWinners" />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  onClick={(e) => {
                    if (!confirm("Yakin ingin reset semua pemenang?")) {
                      e.preventDefault();
                    }
                  }}
                >
                  Reset Pemenang
                </button>
              </Form>
            </div>
          </div>
        )}

        {/* Success Message */}
        {actionData?.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{actionData.message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <p className="text-gray-600 mb-4 md:mb-0">Daftar user terdaftar.</p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Cari Unique ID atau Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cari
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    window.location.search = "";
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Unique ID</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2 w-[100px]">Status</th>
                  <th className="px-4 py-2">Created At</th>
                  {customModeEnabled && <th className="px-4 py-2">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-500" colSpan={customModeEnabled ? 5 : 4}>
                      {search ? "Tidak ada hasil pencarian." : "Belum ada data."}
                    </td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-mono">{u.uniqueId}</td>
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">
                        {u.wonAt ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            🏆 Menang
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            ⏳ Belum
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleString()}</td>
                      {customModeEnabled && (
                        <td className="px-4 py-3">
                          {u.wonAt ? (
                            <Form method="post" className="inline">
                              <input type="hidden" name="action" value="removeCustomWinner" />
                              <input type="hidden" name="userId" value={u.id} />
                              <input type="hidden" name="uniqueId" value={u.uniqueId} />
                              <button
                                type="submit"
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                                onClick={(e) => {
                                  if (!confirm(`Yakin ingin menghapus status pemenang untuk ${u.name}?`)) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                Hapus Pemenang
                              </button>
                            </Form>
                          ) : (
                            <Form method="post" className="inline">
                              <input type="hidden" name="action" value="setCustomWinner" />
                              <input type="hidden" name="userId" value={u.id} />
                              <input type="hidden" name="uniqueId" value={u.uniqueId} />
                              <button
                                type="submit"
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                                onClick={(e) => {
                                  if (!confirm(`Yakin ingin menjadikan ${u.name} sebagai pemenang?`)) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                Set Pemenang
                              </button>
                            </Form>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Menampilkan {((pagination.currentPage - 1) * 12) + 1} - {Math.min(pagination.currentPage * 12, pagination.totalUsers)} dari {pagination.totalUsers} peserta
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm border rounded-lg ${
                          pageNum === pagination.currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}