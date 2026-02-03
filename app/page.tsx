"use client";
import { useEffect, useState } from "react";

interface DataSuhu {
  lokasi: string;
  suhu: number;
  kelembapan: number; // Tambahkan ini
  waktu: string;
}

export default function DashboardCipali() {
  const [data, setData] = useState<DataSuhu[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuhu = async () => {
    try {
      const res = await fetch("/api/suhu");
      const result = await res.json();
      if (!result.error) setData(result);
    } catch (err) {
      console.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuhu();
    const interval = setInterval(fetchSuhu, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 p-6 font-sans text-zinc-50">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight text-blue-500">MONITORING RUANG SERVER CIPALI</h1>
        <p className="mt-2 text-zinc-400">Monitoring Sistem Infrastruktur IoT</p>
      </header>

      <main className="mx-auto max-w-6xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center animate-pulse">Menghubungkan Database...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
                {/* LOKASI */}
                <div className="mb-6 flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    {item.lokasi || "GT SUBANG"}
                  </span>
                  <div className={`h-2 w-2 animate-ping rounded-full ${item.suhu > 27 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                </div>

                {/* SUHU & KELEMBAPAN */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">Suhu</p>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-black tracking-tighter">{item.suhu ?? "--"}</span>
                      <span className="text-xl text-blue-500 ml-1">°C</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">Kelembapan</p>
                    <div className="flex items-baseline justify-end">
                      <span className="text-4xl font-black tracking-tighter">{item.kelembapan ?? "--"}</span>
                      <span className="text-xl text-cyan-500 ml-1">%</span>
                    </div>
                  </div>
                </div>

                {/* TANGGAL & WAKTU */}
                <div className="border-t border-zinc-800 pt-6">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[11px] font-medium leading-none">
                      {new Date(item.waktu).toLocaleDateString("id-ID", { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}