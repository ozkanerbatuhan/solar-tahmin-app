import { useState,useEffect } from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState('');
  const [predictionData, setPredictionData] = useState(null);
  const router = useRouter();
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  useEffect(() => {
    router.push('/dashboard');
  }, [predictionData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada gerçekte API'ye istek atılacak, şimdilik örnek veri oluşturalım
    const mockData = {
      date: selectedDate,
      hourlyProduction: Array.from({length: 24}, (_, i) => ({
        hour: i,
        prediction: Math.random() * 100,
        actual: Math.random() * 100
      }))
    };
    setPredictionData(mockData);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Solar Enerji Tahmin Sistemi</title>
        <meta name="description" content="Solar enerji üretim tahmini yapan web uygulaması" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="mb-4">Solar Enerji Tahmin Sistemi</h1>
        
        <div className="card p-4 mb-4 col-md-8">
          <h2>Tarih Seçin</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="dateInput" className="form-label">Tahmin Edilecek Tarih:</label>
              <input 
                type="date" 
                className="form-control" 
                id="dateInput"
                value={selectedDate}
                onChange={handleDateChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Tahmin Et</button>
          </form>
        </div>

        {predictionData && (
          <div className="card p-4 col-md-8">
            <h2>Tahmin Sonuçları - {predictionData.date}</h2>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Saat</th>
                    <th>Tahmin Edilen Üretim (kWh)</th>
                    <th>Gerçek Üretim (kWh)</th>
                    <th>Fark (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {predictionData.hourlyProduction.map((hourData) => {
                    const difference = ((hourData.prediction - hourData.actual) / hourData.actual * 100).toFixed(2);
                    return (
                      <tr key={hourData.hour}>
                        <td>{hourData.hour}:00</td>
                        <td>{hourData.prediction.toFixed(2)}</td>
                        <td>{hourData.actual.toFixed(2)}</td>
                        <td className={difference > 0 ? 'text-danger' : 'text-success'}>
                          {difference}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Burada Chart.js grafiği eklenecek */}
            <div className="mt-4">
              <p>Not: Bu veriler sadece örnek amaçlıdır. Gerçek tahmin modeli entegre edilmemiştir.</p>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Solar Enerji Tahmin Sistemi &copy; 2025</p>
      </footer>
    </div>
  );
} 