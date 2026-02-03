const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// --- SESUAIKAN DATA DI BAWAH INI ---
const token = 'jzM_kKbgVdB05km7oYtWCqJM5GcgPtg79Bvl_nfyQ3NRrwuoNUb_5o1HFCipnOiboloZE8NlUMMmHWp_J9fdTw=='; 
const org = 'mechatronics';
const url = 'https://us-east-1-1.aws.cloud2.influxdata.com';
const bucket = 'server_monitoring';

const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket);

const lokasiTol = [
  'GT CIKOPO', 'GT KALIJATI', 'GT SUBANG', 
  'GT CIKEDUNG', 'GT KERTAJATI', 'GT SUMBERJAYA', 'GT PALIMANAN'
];

console.log("🚀 Memulai simulasi 7 Gerbang Tol Cipali...");
console.log("Tekan Ctrl+C untuk menghentikan.");

setInterval(() => {
  lokasiTol.forEach((lokasi) => {
    // Simulasi angka suhu & hum agar terlihat real-time
    const temp = (25 + Math.random() * 6).toFixed(1);
    const hum = (55 + Math.random() * 15).toFixed(1);

    const point = new Point('suhu_tol_cipali')
      .tag('gerbang_tol', lokasi)
      .floatField('temp', parseFloat(temp))
      .floatField('hum', parseFloat(hum));

    writeApi.writePoint(point);
  });

  writeApi.flush();
  console.log(`[${new Date().toLocaleTimeString()}] ✅ Berhasil mengirim data untuk 7 Gerbang.`);
}, 5000);