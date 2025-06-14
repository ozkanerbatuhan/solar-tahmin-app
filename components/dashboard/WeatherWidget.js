import { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/router';

// Çeviriler için sabit nesne
const translations = {
  tr: {
    title: 'Hava Durumu Bilgileri',
    temperature: 'Sıcaklık',
    humidity: 'Nem',
    wind: 'Rüzgar',
    solarRadiation: 'Güneş Işıması',
    locationInfo: 'Konum bilgileri',
    today: 'Bugün',
    forecast: 'Tahmin',
    celsius: '°C',
    percent: '%',
    kmh: 'km/s',
    wm2: 'W/m²',
    updated: 'Son Güncelleme:',
    updating: 'Güncelleniyor...'
  },
  en: {
    title: 'Weather Information',
    temperature: 'Temperature',
    humidity: 'Humidity',
    wind: 'Wind',
    solarRadiation: 'Solar Radiation',
    locationInfo: 'Location information',
    today: 'Today',
    forecast: 'Forecast',
    celsius: '°C',
    percent: '%',
    kmh: 'km/h',
    wm2: 'W/m²',
    updated: 'Last Updated:',
    updating: 'Updating...'
  }
};

// Hava durumu için simge belirleme fonksiyonu
const getWeatherIcon = (temp, radiation) => {
  if (radiation > 600) return '☀️'; // Güneşli
  if (radiation > 300) return '🌤️'; // Az bulutlu
  if (temp < 5) return '❄️'; // Soğuk
  if (temp < 15) return '☁️'; // Bulutlu
  return '⛅'; // Parçalı bulutlu
};

const WeatherWidget = () => {
  const router = useRouter();
  const locale = router.locale || 'tr';
  const t = translations[locale];
  
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rastgele hava durumu verisi oluşturma
  const generateWeatherData = () => {
    const currentDate = new Date();
    
    // Gerçekçi değerler oluşturalım
    const temperature = Math.floor(Math.random() * 30) + 5; // 5-35°C arası
    const humidity = Math.floor(Math.random() * 60) + 20; // 20-80% arası
    const windSpeed = Math.floor(Math.random() * 25) + 5; // 5-30 km/s arası
    const solarRadiation = Math.floor(Math.random() * 800) + 100; // 100-900 W/m² arası
    
    return {
      temperature,
      humidity,
      windSpeed,
      solarRadiation,
      icon: getWeatherIcon(temperature, solarRadiation),
      location: 'İstanbul, Türkiye', // Varsayılan konum
      timestamp: currentDate
    };
  };

  // Uygulama başladığında ve her 30 dakikada bir verileri güncelle
  useEffect(() => {
    const fetchWeatherData = () => {
      setLoading(true);
      
      // API çağrısı yerine rastgele veri oluşturuyoruz
      // Gerçek uygulamada burada API çağrısı yapılacak
      setTimeout(() => {
        setWeather(generateWeatherData());
        setLoading(false);
      }, 1000); // Gerçek bir API çağrısını simüle etmek için 1 saniyelik gecikme
    };
    
    fetchWeatherData();
    
    // Her 30 dakikada bir güncelle
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Tarih formatını düzenleme fonksiyonu
  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Yükleniyor durumu
  if (loading && !weather) {
    return (
      <Card>
        <Card.Header as="h5">{t.title}</Card.Header>
        <Card.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t.updating}</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header as="h5">{t.title}</Card.Header>
      <Card.Body>
        {weather && (
          <>
            <div className="d-flex align-items-center mb-3">
              <span className="weather-icon me-2" style={{ fontSize: '3rem' }}>
                {weather.icon}
              </span>
              <div>
                <h2 className="mb-0">{weather.temperature}{t.celsius}</h2>
                <p className="text-muted mb-0">{weather.location}</p>
              </div>
            </div>
            
            <Row>
              <Col xs={6} md={3} className="mb-3">
                <div className="p-2 border rounded text-center">
                  <div className="small text-muted">{t.temperature}</div>
                  <div className="fw-bold">{weather.temperature}{t.celsius}</div>
                </div>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <div className="p-2 border rounded text-center">
                  <div className="small text-muted">{t.humidity}</div>
                  <div className="fw-bold">{weather.humidity}{t.percent}</div>
                </div>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <div className="p-2 border rounded text-center">
                  <div className="small text-muted">{t.wind}</div>
                  <div className="fw-bold">{weather.windSpeed} {t.kmh}</div>
                </div>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <div className="p-2 border rounded text-center">
                  <div className="small text-muted">{t.solarRadiation}</div>
                  <div className="fw-bold">{weather.solarRadiation} {t.wm2}</div>
                </div>
              </Col>
            </Row>
            
            <div className="text-muted small mt-2">
              {t.updated} {formatDate(weather.timestamp)}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default WeatherWidget; 