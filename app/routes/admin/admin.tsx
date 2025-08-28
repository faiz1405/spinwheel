import type { Route } from "../+types/admin";
import { Form } from "react-router";
import prisma from "../../lib/prismaClient";

export async function loader({request}: Route.LoaderArgs) {
  const users = await prisma.user.findMany({
    select: { id: true, uniqueId: true, name: true, createdAt: true, wonAt: true },
    orderBy: { createdAt: "desc" },
  });
  return { users };
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
  
  return { success: false };
}

export function meta() {
  return [
    { title: "Admin - LiuGong Spinwheel" },
    { name: "description", content: "Admin page for LiuGong Spinwheel" },
  ];
}

export default function Admin({loaderData, actionData}: Route.ComponentProps & { actionData?: any }) {
  const { users } = loaderData;

  // Hitung statistik
  const totalUsers = users.length;
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
          <p className="text-gray-600 mb-4">Daftar user terdaftar.</p>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Unique ID</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-500" colSpan={4}>Belum ada data.</td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}