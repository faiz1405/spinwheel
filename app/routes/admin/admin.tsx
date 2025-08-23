import type { Route } from "../+types/admin";
import prisma from "../../lib/prismaClient";

export async function loader({request}: Route.LoaderArgs) {
  const users = await prisma.user.findMany({
    select: { id: true, uniqueId: true, name: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return { users };
}

export function meta() {
  return [
    { title: "Admin - LiuGong Spinwheel" },
    { name: "description", content: "Admin page for LiuGong Spinwheel" },
  ];
}

export default function Admin({loaderData}: Route.ComponentProps) {
  const { users } = loaderData;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8">Admin Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <p className="text-gray-600 mb-4">Daftar user terdaftar.</p>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Unique ID</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-500" colSpan={3}>Belum ada data.</td>
                  </tr>
                ) : (
                  users.map((u: { id: string; uniqueId: string; name: string; createdAt: string | Date }) => (
                    <tr key={u.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-mono">{u.uniqueId}</td>
                      <td className="px-4 py-3">{u.name}</td>
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