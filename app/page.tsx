"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function DashboardCipali() {
  const [data, setData] = useState<any[]>([]);
  const [history, setHistory] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch('/api/suhu'); 
      const jsonData = await response.json();
      
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        const formattedData = jsonData.map((item: any) => ({
          ...item,
          gate: item.lokasi, 
          waktuDisplay: new Date(item.waktu).toLocaleTimeString('id-ID'),
          tanggalDisplay: new Date(item.waktu).toLocaleDateString('id-ID', { 
            day: 'numeric', month: 'long', year: 'numeric' 
          })
        }));

        setData(formattedData);

        setHistory(prev => {
          const newHistory = { ...prev };
          formattedData.forEach((item: any) => {
            if (!newHistory[item.gate]) newHistory[item.gate] = [];
            const isDuplicate = newHistory[item.gate].some(h => h.waktu === item.waktu);
            if (!isDuplicate) {
              newHistory[item.gate] = [...newHistory[item.gate], item].slice(-20);
            }
          });
          return newHistory;
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000); 
    return () => clearInterval(interval);
  }, [fetchSensorData]);

  const getAverage = (gateName: string, key: 'suhu' | 'kelembapan') => {
    const gateHistory = history[gateName] || [];
    if (gateHistory.length === 0) return 0;
    const sum = gateHistory.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
    return (sum / gateHistory.length).toFixed(1);
  };

  return (
    // Mengubah bg-black menjadi bg-white dan text-white menjadi text-gray-900
    <main className="min-h-screen bg-white text-gray-900 p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-bold text-center text-orange-500 mb-12 uppercase tracking-widest">
        Monitoring Ruang Server Cipali
      </h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Sinkronisasi Data InfluxDB Cloud...</p>
        </div>
      ) : (
        <>
          <div className="space-y-12 mb-16">
            {data.map((item, i) => (
              // Mengubah bg-[#0a0a0a] menjadi bg-gray-50 dan border-gray-800 menjadi border-gray-200
              <div key={i} className="bg-gray-50 border border-gray-200 p-6 rounded-3xl shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-200 pb-4">
                  <div>
                    {/* Mengubah text-blue-400 menjadi text-orange-600 */}
                    <h2 className="text-2xl font-black text-orange-600">{item.gate}</h2>
                    <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">
                        📅 {item.tanggalDisplay} | 🕒 {item.waktuDisplay}
                    </p>
                  </div>
                  <div className="flex gap-8 mt-4 md:mt-0">
                    <div className="text-right">
                      <p className="text-gray-400 text-[10px]">AVG SUHU</p>
                      <p className="text-lg font-bold text-orange-400">{getAverage(item.gate, 'suhu')}°C</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-[10px]">AVG LEMBAP</p>
                      <p className="text-lg font-bold text-cyan-600">{getAverage(item.gate, 'kelembapan')}%</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    {/* Mengubah bg-[#111] menjadi bg-white */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
                      <span className="text-gray-400 text-xs">SUHU SAAT INI</span>
                      {/* Warna tetap mengikuti logika sensor (merah jika > 27, jika tidak hitam) */}
                      <span className={`text-3xl font-black ${item.suhu > 27 ? 'text-red-500' : 'text-gray-900'}`}>
                        {item.suhu}°C
                      </span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
                      <span className="text-gray-400 text-xs">LEMBAP SAAT INI</span>
                      {/* Warna pembacaan sensor tetap (biru/cyan) sesuai permintaan Anda */}
                      <span className="text-3xl font-black text-blue-500">{item.kelembapan}%</span>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-gray-200 h-[280px] shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history[item.gate] || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                        <XAxis dataKey="waktuDisplay" stroke="#999" fontSize={10} />
                        <YAxis stroke="#999" fontSize={10} domain={['auto', 'auto']} />
                        {/* Tooltip disesuaikan untuk tema terang */}
                        <Tooltip contentStyle={{backgroundColor:'#fff', border:'1px solid #ddd', borderRadius: '8px'}} />
                        <Legend />
                        <Line name="Suhu (°C)" type="monotone" dataKey="suhu" stroke="#f97316" strokeWidth={3} dot={false} isAnimationActive={false} />
                        <Line name="Lembap (%)" type="monotone" dataKey="kelembapan" stroke="#06b6d4" strokeWidth={3} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-red-100 rounded-3xl overflow-hidden shadow-lg mt-10">
            <div className="bg-red-50 p-4 border-b border-red-100 text-center">
              <h3 className="text-red-600 font-bold uppercase tracking-widest">
                ⚠️ Log Riwayat Suhu Ekstrem (&gt;27°C)
              </h3>
            </div>
            <div className="p-4 overflow-y-auto" style={{ height: '300px' }}>
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 bg-white z-20">
                  <tr className="text-gray-400 text-[10px] uppercase border-b border-gray-100">
                    <th className="py-3 px-4 bg-white">Waktu</th>
                    <th className="py-3 px-4 bg-white">Gerbang Tol</th>
                    <th className="py-3 px-4 text-center bg-white">Suhu</th>
                    <th className="py-3 px-4 text-center font-bold bg-white">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.filter(d => d.suhu > 27).length > 0 ? (
                    [...data].filter(d => d.suhu > 27).reverse().map((d, i) => (
                      <tr key={i} className="text-sm hover:bg-red-50 transition-colors">
                        <td className="py-4 px-4 text-gray-500 whitespace-nowrap">{d.waktuDisplay}</td>
                        <td className="py-4 px-4 font-medium text-gray-900">{d.gate}</td>
                        <td className="py-4 px-4 text-center text-red-600 font-bold">{d.suhu}°C</td>
                        <td className="py-4 px-4 text-center">
                          <span className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-bold animate-pulse">DANGER</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-gray-400 italic">
                        Belum ada data suhu ekstrem dari sensor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}