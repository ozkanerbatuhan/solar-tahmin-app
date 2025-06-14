import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Stats() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statData, setStatData] = useState(null);

  const handleDateChange = (e, type) => {
    setDateRange(prev => ({
      ...prev,
      [type]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Örnek veri oluştur
    const mockStatData = generateMockStats(dateRange.start, dateRange.end);
    setStatData(mockStatData);
  };

  // Örnek istatistik verisi oluşturan fonksiyon
  const generateMockStats = (startDate, endDate) => {
    // Tarih aralığını hesapla
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Günlük verileri oluştur
    const dailyData = Array.from({ length: dayDiff }, (_, index) => {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + index);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const predicted = Math.round(300 + Math.random() * 200); // 300-500 kWh
      const actual = Math.round(predicted * (0.8 + Math.random() * 0.4)); // %80-120 arası
      const accuracy = Math.round((1 - Math.abs(predicted - actual) / actual) * 100);
      
      return {
        date: dateStr,
        predicted,
        actual,
        accuracy
      };
    });
    
    // Toplam değerleri hesapla
    const totalPredicted = dailyData.reduce((sum, item) => sum + item.predicted, 0);
    const totalActual = dailyData.reduce((sum, item) => sum + item.actual, 0);
    const avgAccuracy = Math.round(dailyData.reduce((sum, item) => sum + item.accuracy, 0) / dailyData.length);
    
    return {
      dailyData,
      summary: {
        totalPredicted,
        totalActual,
        avgAccuracy,
        startDate,
        endDate,
        dayCount: dayDiff
      }
    };
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>İstatistikler - Solar Enerji Tahmin Sistemi</title>
        <meta name="description" content="Solar enerji üretim tahmin istatistikleri" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="mb-4">Tahmin İstatistikleri</h1>
        
        <div className="card p-4 mb-4 col-md-8">
          <h2>Tarih Aralığı Seçin</h2>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="startDate" className="form-label">Başlangıç Tarihi:</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="startDate"
                  value={dateRange.start}
                  onChange={(e) => handleDateChange(e, 'start')}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="endDate" className="form-label">Bitiş Tarihi:</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="endDate"
                  value={dateRange.end}
                  onChange={(e) => handleDateChange(e, 'end')}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">İstatistikleri Göster</button>
          </form>
        </div>
        
        {statData && (
          <div className="card p-4 col-md-8">
            <h2>Özet İstatistikler</h2>
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-light p-3 text-center">
                  <h3>{statData.summary.totalActual.toLocaleString()} kWh</h3>
                  <p>Toplam Gerçek Üretim</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light p-3 text-center">
                  <h3>{statData.summary.totalPredicted.toLocaleString()} kWh</h3>
                  <p>Toplam Tahmin Edilen</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light p-3 text-center">
                  <h3>%{statData.summary.avgAccuracy}</h3>
                  <p>Ortalama Doğruluk</p>
                </div>
              </div>
            </div>
            
            <h3>Günlük Detaylar</h3>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Tahmin (kWh)</th>
                    <th>Gerçek (kWh)</th>
                    <th>Doğruluk (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {statData.dailyData.map((day) => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.predicted}</td>
                      <td>{day.actual}</td>
                      <td className={day.accuracy > 90 ? 'text-success' : (day.accuracy > 70 ? 'text-warning' : 'text-danger')}>
                        {day.accuracy}%
                      </td>
                    </tr>
                  ))}
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