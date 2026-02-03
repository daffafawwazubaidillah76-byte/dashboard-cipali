"use client";
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const GATE_NAMES = [
  "GT CIKOPO", 
  "GT KALIJATI", 
  "GT SUBANG", 
  "GT CIKEDUNG", 
  "GT KERTAJATI", 
  "GT SUMBERJAYA", 
  "GT PALIMANAN"
];

export default function DashboardCipali() {
  const [data, setData] = useState<any[]>([]);
  const [history, setHistory] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      // Mengambil tanggal dan waktu saat ini dalam format Indonesia
      const now = new Date();
      const tanggal = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const waktu = now.toLocaleTimeString('id-ID');
      
      const newData = GATE_NAMES.map(gate => ({
        gate,
        suhu: parseFloat((Math.random() * (32 - 24) + 24).toFixed(1)),
        kelembapan: parseFloat((Math.random() * (70 - 50) + 50).toFixed(1)),
        tanggal, // Menyimpan informasi tanggal
        waktu,   // Menyimpan informasi waktu
        fullTime: `${tanggal} ${waktu}` // Gabungan untuk tooltip
      }));

      setData(newData);

      setHistory(prev => {
        const newHistory = { ...prev };
        newData.forEach(item => {
          if (!newHistory[item.gate]) newHistory[item.gate] = [];
          newHistory[item.gate] = [...newHistory[item.gate].slice(-15), item];
        });
        return newHistory;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getAverage = (gateName: string, key: 'suhu' | 'kelembapan') => {
    const gateHistory = history[gateName] || [];
    if (gateHistory.length === 0) return 0;
    const sum = gateHistory.reduce((acc, curr) => acc + curr[key], 0);
    return (sum / gateHistory.length).toFixed(1);
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-bold text-center text-blue-500 mb-12 uppercase tracking-widest">
        Monitoring Infrastruktur Tol Cipali
      </h1>

      {/* --- MONITORING PER GERBANG --- */}
      <div className="space-y-12 mb-16">
        {data.map((item, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-3xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-2xl font-black text-blue-400">{item.gate}</h2>
                <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">
                   📅 {item.tanggal} | 🕒 {item.waktu}
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
                  <span className={`text-3xl font-black ${item.suhu > 27 ? 'text-red-500' : 'text-white'}`}>{item.suhu}°C</span>
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
                    <XAxis dataKey="waktu" stroke="#444" fontSize={10} />
                    <YAxis stroke="#444" fontSize={10} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{backgroundColor:'#000', border:'1px solid #333'}}
                      labelStyle={{ color: '#999', fontSize: '10px' }}
                      labelFormatter={(value, payload) => payload[0]?.payload?.fullTime} 
                    />
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

      {/* --- LOG PERINGATAN (DENGAN SCROLL AKTIF) --- */}
      <div className="bg-[#111] border border-red-900/30 rounded-3xl overflow-hidden shadow-2xl mt-10">
        <div className="bg-red-950/20 p-4 border-b border-red-900/30 text-center">
          <h3 className="text-red-500 font-bold uppercase tracking-widest">
            ⚠️ Log Riwayat Suhu Ekstrem (&gt;27°C)
          </h3>
        </div>
        
        {/* Pembungkus Tabel dengan Tinggi Tetap */}
        <div 
          className="p-4 overflow-x-auto overflow-y-auto custom-scrollbar" 
          style={{ height: '300px', display: 'block' }} // Memaksa tinggi 300px
        >
          <table className="w-full text-left border-separate border-spacing-0">
            {/* sticky top-0 agar judul tabel tidak ikut hilang saat di-scroll */}
            <thead className="sticky top-0 bg-[#111] z-20">
              <tr className="text-gray-500 text-[10px] uppercase border-b border-gray-800">
                <th className="py-3 px-4 bg-[#111]">Tanggal & Waktu</th>
                <th className="py-3 px-4 bg-[#111]">Gerbang Tol</th>
                <th className="py-3 px-4 text-center bg-[#111]">Suhu</th>
                <th className="py-3 px-4 text-center font-bold bg-[#111]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {/* Kami memfilter data dan membalik urutannya agar yang terbaru di atas */}
              {data.filter(d => d.suhu > 27).length > 0 ? (
                [...data].filter(d => d.suhu > 27).reverse().map((d, i) => (
                  <tr key={i} className="text-sm hover:bg-red-500/5 transition-colors">
                    <td className="py-4 px-4 text-gray-400 whitespace-nowrap">{d.tanggal} - {d.waktu}</td>
                    <td className="py-4 px-4 font-medium">{d.gate}</td>
                    <td className="py-4 px-4 text-center text-red-500 font-bold">{d.suhu}°C</td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-bold animate-pulse">DANGER</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-600 italic">
                    Belum ada data suhu ekstrem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}