import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPrediction } from '../store/solarDataSlice';
import { fetchWeatherData } from '../store/weatherSlice';
import Head from 'next/head';
import MetricsPanel from '../components/dashboard/MetricsPanel';
import ProductionCharts from '../components/dashboard/ProductionCharts';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import DataUploadWidget from '../components/dashboard/DataUploadWidget';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { metrics } = useSelector(state => state.solarData);
  const { currentWeather } = useSelector(state => state.weather);

  useEffect(() => {
    // Dashboard yüklendiğinde hava durumunu al (diğer veriler bileşenlerde alınıyor)
    dispatch(fetchWeatherData());
  }, [dispatch]);

  return (
    <div className="container-fluid py-4">
      <Head>
        <title>Dashboard - Solar Enerji Tahmin Sistemi</title>
        <meta name="description" content="Solar enerji üretim tahmini dashboard" />
      </Head>

      <h1 className="mb-4">Solar Enerji Dashboard</h1>

      {/* Üst Kısım - Metrikler ve Hava Durumu */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <MetricsPanel metrics={metrics} />
        </div>
        <div className="col-md-4">
          <WeatherWidget />
        </div>
      </div>

      {/* Alt Kısım - Üretim Grafikleri */}
      <div className="row">
        <div className="col-12">
          <ProductionCharts />
        </div>
      </div>

      {/* Veri Yükleme Widget'ı */}
      <div className="row mt-4">
        <div className="col-12">
          <DataUploadWidget />
        </div>
      </div>
    </div>
  );
} 