import React, { useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useSubmit } from "react-router";
import prisma from "../../lib/prismaClient";
import * as XLSX from 'xlsx';

export async function action({ request }: ActionFunctionArgs) {
  console.log("🚀 Import action started");
  
  try {
    const formData = await request.formData();
    console.log("📄 FormData received");
    
    const file = formData.get("file") as File;
    console.log("📁 File info:", { 
      name: file?.name, 
      size: file?.size, 
      type: file?.type 
    });
    
    if (!file || file.size === 0) {
      console.log("❌ File validation failed");
      return { 
        success: false, 
        error: "File tidak ditemukan atau kosong" 
      };
    }

    console.log("✅ File validation passed, processing...");

    // HAPUS SEMUA DATA LAMA (Replace Mode)
    console.log("🗑️ Deleting all existing data...");
    const deleteResult = await prisma.user.deleteMany({});
    console.log("✅ Deleted", deleteResult.count, "existing records");

    console.log("✅ File validation passed, processing...");

    // Baca file Excel
    console.log("📖 Reading Excel file...");
    const arrayBuffer = await file.arrayBuffer();
    console.log("📊 ArrayBuffer size:", arrayBuffer.byteLength);
    
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    console.log("📋 Workbook sheets:", workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert ke JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("📄 JSON data rows:", jsonData.length);
    
    // Skip header row (baris pertama)
    const dataRows = jsonData.slice(1) as any[][];
    
    if (dataRows.length === 0) {
      console.log("❌ No data rows found");
      return { 
        success: false, 
        error: "File Excel kosong atau tidak ada data" 
      };
    }

    console.log("🔄 Processing", dataRows.length, "data rows");
    const results = {
      success: 0,
      errors: [] as string[],
      replaced: deleteResult.count
    };

    // Process setiap baris
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // +2 karena Excel mulai dari 1 dan skip header
      
      // Validasi data (asumsi: kolom A = uniqueId, kolom B = name)
      const uniqueId = row[0]?.toString()?.trim();
      const name = row[1]?.toString()?.trim();
      
      console.log(`📝 Row ${rowNumber}:`, { uniqueId, name });
      
      if (!uniqueId || !name) {
        console.log(`❌ Row ${rowNumber}: Invalid data`);
        results.errors.push(`Baris ${rowNumber}: Data tidak lengkap (uniqueId: "${uniqueId}", name: "${name}")`);
        continue;
      }
      
      if (uniqueId.length !== 9) {
        results.errors.push(`Baris ${rowNumber}: UniqueId harus 9 karakter (saat ini: "${uniqueId}")`);
        continue;
      }
      
      try {
        // Insert ke database (Replace Mode - tidak perlu cek duplikasi)
        console.log(`💾 Inserting row ${rowNumber} to database`);
        await prisma.user.create({
          data: {
            uniqueId: uniqueId,
            name: name
          }
        });
        
        results.success++;
        console.log(`✅ Row ${rowNumber} inserted successfully`);
      } catch (error) {
        console.error(`💥 Database error for row ${rowNumber}:`, error);
        results.errors.push(`Baris ${rowNumber}: Error database - ${error}`);
      }
    }

    console.log("🎉 Processing completed:", results);
    return { 
      success: true, 
      results 
    };
    
  } catch (error) {
    console.error("💥 File processing error:", error);
    return { 
      success: false, 
      error: `Error memproses file: ${error}` 
    };
  }
}

export default function ImportPage({ actionData, loaderData }: { actionData?: any; loaderData?: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const submit = useSubmit();
  
  // Hitung data yang ada saat ini
  const currentDataCount = loaderData?.users?.length || 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("🚀 Form submit started");
    
    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File;
    console.log("📁 Frontend file info:", { 
      name: file?.name, 
      size: file?.size, 
      type: file?.type 
    });

    if (!file || file.size === 0) {
      alert("Pilih file Excel terlebih dahulu!");
      return;
    }
    
    // Konfirmasi Replace Mode
    const confirmed = confirm(
      "⚠️ PERINGATAN!\n\n" +
      `Mode Replace akan menghapus ${currentDataCount} data lama dan menggantinya dengan data baru.\n\n` +
      "Apakah Anda yakin ingin melanjutkan?"
    );
    
    if (!confirmed) {
      console.log("❌ Import cancelled by user");
      return;
    }
    
    setIsUploading(true);
    console.log("✅ Submitting to server using useSubmit...");
    submit(formData, { method: "post", encType: "multipart/form-data" });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      fileInput.files = files;
    }
  };

  // Reset loading state setelah action selesai
  React.useEffect(() => {
    if (actionData) {
      console.log("📤 Action data received:", actionData);
      setIsUploading(false);
    }
  }, [actionData]);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Import Data Peserta (Replace Mode)</h1>
            <p className="text-gray-600 mt-1">Upload file Excel untuk mengganti semua data peserta</p>
            {currentDataCount > 0 && (
              <p className="text-orange-600 mt-2 font-medium">
                ⚠️ Saat ini ada {currentDataCount} data peserta yang akan dihapus
              </p>
            )}
          </div>

          <div className="p-6">
            {/* Format Template Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Format File Excel (Replace Mode)</h3>
              <div className="text-sm text-blue-800">
                <p className="mb-2">File Excel harus memiliki format berikut:</p>
                <div className="bg-white border rounded p-3 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-4 font-bold border-b pb-1 mb-1">
                    <div>Kolom A: UniqueId</div>
                    <div>Kolom B: Nama</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-gray-600">
                    <div>ABC123456</div>
                    <div>John Doe</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-gray-600">
                    <div>DEF789012</div>
                    <div>Jane Smith</div>
                  </div>
                </div>
                <p className="mt-2">• UniqueId harus tepat 9 karakter</p>
                <p>• Baris pertama akan diabaikan (header)</p>
                <p className="mt-2 font-semibold text-red-600">⚠️ PERINGATAN: Semua data lama akan dihapus dan diganti dengan data baru!</p>
              </div>
            </div>

            {/* Upload Form */}
            <Form onSubmit={handleSubmit} encType="multipart/form-data" method="post">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                  📁
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload File Excel
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag & drop file Excel di sini, atau klik untuk memilih file
                </p>
                
                <input
                  id="file-input"
                  type="file"
                  name="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const fileName = e.target.files?.[0]?.name;
                    if (fileName) {
                      const label = document.getElementById('file-label');
                      if (label) label.textContent = fileName;
                    }
                  }}
                />
                
                <label 
                  htmlFor="file-input"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Pilih File Excel
                </label>
                
                <p id="file-label" className="text-sm text-gray-500 mt-2"></p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    isUploading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? 'Mengupload...' : 'Upload & Import'}
                </button>
              </div>
            </Form>

            {/* Results */}
            {actionData && (
              <div className="mt-6">
                {actionData.success ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Import Berhasil!</h3>
                    <div className="text-sm text-green-800">
                      <p>• Berhasil diimport: <strong>{actionData.results.success}</strong> peserta</p>
                      <p>• Data lama yang dihapus: <strong>{actionData.results.replaced}</strong> peserta</p>
                      {actionData.results.errors.length > 0 && (
                        <p>• Error: <strong>{actionData.results.errors.length}</strong> baris</p>
                      )}
                    </div>
                    
                    {actionData.results.errors.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-red-700 font-medium">
                          Lihat Error Detail
                        </summary>
                        <div className="mt-2 bg-red-50 border border-red-200 rounded p-3">
                          {actionData.results.errors.map((error: string, index: number) => (
                            <p key={index} className="text-sm text-red-700">• {error}</p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2">❌ Import Gagal</h3>
                    <p className="text-sm text-red-800">{actionData.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
