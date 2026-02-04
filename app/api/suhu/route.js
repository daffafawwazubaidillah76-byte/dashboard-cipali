import { InfluxDB } from '@influxdata/influxdb-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = "jzM_kKbgVdB05km7oYtWCqJM5GcgPtg79Bvl_nfyQ3NRrwuoNUb_5o1HFCipnOiboloZE8NlUMMmHWp_J9fdTw==";
  const org = "mechatronics";
  const url = "https://us-east-1-1.aws.cloud2.influxdata.com";
  const bucket = "server_monitoring";

  const client = new InfluxDB({ url, token });
  const queryApi = client.getQueryApi(org);

  // Query untuk mengambil data terbaru dari InfluxDB
  const fluxQuery = `from(bucket: "${bucket}") 
    |> range(start: -1h) 
    |> filter(fn: (r) => r["_measurement"] == "suhu_tol_cipali")
    |> last() 
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;

  try {
    const rows = await queryApi.collectRows(fluxQuery);
    const data = rows.map((row) => ({
      // Map 'gerbang_tol' menjadi 'lokasi' agar sesuai dengan fetch di frontend
      lokasi: row.gerbang_tol || "Tidak Diketahui",
      suhu: Number(row.temp) || 0,     // Konversi ke Number agar grafik bisa merender garis
      kelembapan: Number(row.hum) || 0, // Sesuai field 'hum' di InfluxDB
      waktu: row._time,
    }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}