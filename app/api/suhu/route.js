import { InfluxDB } from '@influxdata/influxdb-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = "jzM_kKbgVdB05km7oYtWCqJM5GcgPtg79Bvl_nfyQ3NRrwuoNUb_5o1HFCipnOiboloZE8NlUMMmHWp_J9fdTw==";
  const org = "mechatronics";
  const url = "https://us-east-1-1.aws.cloud2.influxdata.com";
  const bucket = "server_monitoring";

  const client = new InfluxDB({ url, token });
  const queryApi = client.getQueryApi(org);

  // Mengambil data 1 jam terakhir dan mengelompokkan berdasarkan field
  const fluxQuery = `from(bucket: "${bucket}") 
    |> range(start: -1h) 
    |> filter(fn: (r) => r["_measurement"] == "suhu_tol_cipali")
    |> last() 
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;

  try {
    const rows = await queryApi.collectRows(fluxQuery);
    const data = rows.map((row) => ({
      lokasi: row.gerbang_tol,
      suhu: row.temp,      // Diambil dari field 'temp' di ESP32
      kelembapan: row.hum, // Diambil dari field 'hum' di ESP32
      waktu: row._time,
    }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}