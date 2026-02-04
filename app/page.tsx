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
          // Sinkronisasi: Ubah 'lokasi' dari API menjadi 'gate' untuk UI
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
            
            // Hindari duplikasi data pada grafik berdasarkan timestamp
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
    <main className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-bold text-center text-blue-500 mb-12 uppercase tracking-widest">
        Monitoring Infrastruktur Tol Cipali
      </h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Sinkronisasi Data InfluxDB Cloud...</p>
        </div>
      ) : (
        <div className="space-y-12 mb-16">
          {data.map((item, i) => (
            <div key={i} className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-3xl shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-blue-400">{item.gate}</h2>
                  <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">
                      📅 {item.tanggalDisplay} | 🕒 {item.waktuDisplay}
                  </p>
                </div>
                <div className="flex gap-8 mt-4 md:mt-0">
                  <div className="text-right">
                    <p className="text-gray-500 text-[10px]">AVG SUHU</p>
                    <p className="text-lg font-bold text-orange-400">{getAverage(item.gate, 'suhu')}°C</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-[10px]">AVG LEMBAP</p>
                    <p className="text-lg font-bold text-cyan-400">{getAverage(item.gate, 'kelembapan')}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#111] p-5 rounded-2xl border border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400 text-xs">SUHU SAAT INI</span>
                    <span className={`text-3xl font-black ${item.suhu > 27 ? 'text-red-500' : 'text-white'}`}>
                      {item.suhu}°C
                    </span>
                  </div>
                  <div className="bg-[#111] p-5 rounded-2xl border border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400 text-xs">LEMBAP SAAT INI</span>
                    <span className="text-3xl font-black text-blue-400">{item.kelembapan}%</span>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-[#111] p-4 rounded-2xl border border-gray-800 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history[item.gate] || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="waktuDisplay" stroke="#444" fontSize={10} />
                      <YAxis stroke="#444" fontSize={10} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #333'}} />
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
      )}
    </main>
  );
}