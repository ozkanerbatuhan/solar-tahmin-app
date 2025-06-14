import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Head from 'next/head';
import { Container, Row, Col, Card, Tabs, Tab, Badge, Alert } from 'react-bootstrap';
import DataUploadWidget from '../components/dashboard/DataUploadWidget';
import { Line } from 'react-chartjs-2';

export default function ImportPage() {
  const dispatch = useDispatch();
  const { historicalData } = useSelector(state => state.solarData);
  const [activeTab, setActiveTab] = useState('upload');
  
  // İçe aktarılan verilerin özet istatistiklerini hesaplama
  const calculateDataStats = () => {
    if (!historicalData || historicalData.length === 0) {
      return {
        totalEntries: 0,
        dateCoverage: 'Veri yok',
        avgProduction: 0,
        maxProduction: 0,
        importInfo: []
      };
    }
    
    // Verileri tarihlerine göre grupla
    const groupedByDate = historicalData.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {});
    
    const dates = Object.keys(groupedByDate).sort();
    const totalDays = dates.length;
    
    // Toplam ve maksimum üretimi hesapla
    let totalProduction = 0;
    let maxProduction = 0;
    
    historicalData.forEach(entry => {
      totalProduction += entry.production;
      if (entry.production > maxProduction) {
        maxProduction = entry.production;
      }
    });
    
    // Her ay için veri özetini hazırla
    const monthlyData = {};
    dates.forEach(date => {
      const month = date.substring(0, 7); // YYYY-MM formatı
      if (!monthlyData[month]) {
        monthlyData[month] = {
          totalProduction: 0,
          days: 0
        };
      }
      
      groupedByDate[date].forEach(entry => {
        monthlyData[month].totalProduction += entry.production;
      });
      
      monthlyData[month].days += 1;
    });
    
    // Veri içe aktarma bilgilerini liste haline getir
    const importInfo = Object.keys(monthlyData).map(month => ({
      month,
      totalProduction: monthlyData[month].totalProduction.toFixed(2),
      days: monthlyData[month].days,
      avgDailyProduction: (monthlyData[month].totalProduction / monthlyData[month].days).toFixed(2)
    })).sort((a, b) => b.month.localeCompare(a.month)); // En yeni aylar üstte
    
    return {
      totalEntries: historicalData.length,
      dateCoverage: `${dates[0]} - ${dates[dates.length - 1]} (${totalDays} gün)`,
      avgProduction: (totalProduction / historicalData.length).toFixed(2),
      maxProduction: maxProduction.toFixed(2),
      importInfo
    };
  };
  
  const stats = calculateDataStats();
  
  // Son 7 günlük veri grafiği hazırlama
  const prepareRecentDataChart = () => {
    if (!historicalData || historicalData.length === 0) return null;
    
    // Verileri tarihlerine göre grupla
    const groupedByDate = historicalData.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = { 
          totalProduction: 0,
          avgTemperature: 0,
          totalTemperature: 0,
          entries: 0
        };
      }
      acc[entry.date].totalProduction += entry.production;
      acc[entry.date].totalTemperature += entry.temperature || 0;
      acc[entry.date].entries++;
      return acc;
    }, {});
    
    // Tarihleri sırala ve son 7 günü al
    const sortedDates = Object.keys(groupedByDate).sort().slice(-7);
    
    // Her gün için ortalama sıcaklık hesapla
    sortedDates.forEach(date => {
      groupedByDate[date].avgTemperature = groupedByDate[date].totalTemperature / groupedByDate[date].entries;
    });
    
    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Günlük Toplam Üretim (kWh)',
          data: sortedDates.map(date => groupedByDate[date].totalProduction),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Ortalama Sıcaklık (°C)',
          data: sortedDates.map(date => groupedByDate[date].avgTemperature),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y1',
        }
      ]
    };
  };
  
  const recentDataChart = prepareRecentDataChart();
  
  return (
    <Container className="py-4">
      <Head>
        <title>Veri İçe Aktar - Solar Enerji Tahmin Sistemi</title>
        <meta name="description" content="Geçmiş üretim verilerini yükleyerek tahmin modelini geliştirebilirsiniz" />
      </Head>
      
      <h1 className="mb-4">Veri İçe Aktar</h1>
      
      <Row>
        <Col lg={8}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="upload" title="Veri Yükle">
              <DataUploadWidget />
            </Tab>
            
            <Tab eventKey="history" title={
              <div>
                Veri Geçmişi
                {stats.totalEntries > 0 && (
                  <Badge bg="info" className="ms-2">{stats.totalEntries}</Badge>
                )}
              </div>
            }>
              <Card>
                <Card.Header as="h5">Yüklenen Veri Geçmişi</Card.Header>
                <Card.Body>
                  {historicalData.length === 0 ? (
                    <Alert variant="info">
                      Henüz yüklenmiş veri bulunmuyor. Veri yüklemek için "Veri Yükle" sekmesini kullanabilirsiniz.
                    </Alert>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h6>Son 7 Gün Üretim Özeti</h6>
                        {recentDataChart && (
                          <div style={{ height: '300px' }}>
                            <Line 
                              data={recentDataChart}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  y: {
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    title: {
                                      display: true,
                                      text: 'Enerji (kWh)'
                                    }
                                  },
                                  y1: {
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    grid: {
                                      drawOnChartArea: false,
                                    },
                                    title: {
                                      display: true,
                                      text: 'Sıcaklık (°C)'
                                    }
                                  },
                                },
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <h6>Aylık Veri Özetleri</h6>
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Tarih Aralığı</th>
                                <th>Gün Sayısı</th>
                                <th>Toplam Üretim</th>
                                <th>Günlük Ort. Üretim</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.importInfo.map((info, idx) => (
                                <tr key={idx}>
                                  <td>{info.month}</td>
                                  <td>{info.days}</td>
                                  <td>{info.totalProduction} kWh</td>
                                  <td>{info.avgDailyProduction} kWh</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header as="h5">Veri İstatistikleri</Card.Header>
            <Card.Body>
              <p><strong>Toplam Kayıt:</strong> {stats.totalEntries}</p>
              <p><strong>Kapsanan Tarih Aralığı:</strong> {stats.dateCoverage}</p>
              <p><strong>Ortalama Üretim:</strong> {stats.avgProduction} kWh</p>
              <p><strong>Maksimum Üretim:</strong> {stats.maxProduction} kWh</p>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header as="h5">Veri Kılavuzu</Card.Header>
            <Card.Body>
              <h6>Desteklenen Dosya Formatları</h6>
              <ul className="mb-3">
                <li>TXT (.txt)</li>
              </ul>
              
              <h6>Gerekli Sütunlar</h6>
              <ul className="mb-3">
                <li><strong>Tarih:</strong> GG-AA-YYYY formatında</li>
                <li><strong>Saat:</strong> 0-23 arası tam sayı</li>
                <li><strong>Üretim:</strong> kWh cinsinden üretim miktarı</li>
              </ul>
              
              <h6>Örnek Veri</h6>
              <pre className="bg-light p-2 small">
{`Time	INV/1/DayEnergy (kWh)-INV/8/DayEnergy (kWh)
19/11/2024 11:00:00	1780-1800
19/11/2024 12:00:00	2234-2362
19/11/2024 13:00:00	3200-3262
19/11/2024 14:00:00	3977-4100
...`}
              </pre>
              
              <p className="small text-muted mt-3">
                <strong>Not:</strong> Yüklediğiniz veriler tahmin modelimizin geliştirilmesi için kullanılacaktır. 
                Daha fazla veri, daha doğru tahminler anlamına gelir.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
} 