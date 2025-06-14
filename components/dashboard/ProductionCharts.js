import { Card, Spinner, Nav, Tab, Form, Button, ButtonGroup } from 'react-bootstrap';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRealTimePredictions } from '../../store/solarDataSlice';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

// Statik veri oluşturan fonksiyon - API bağlantısı yokken kullanılabilir
const generateStaticData = () => {
  // Saatlik üretim verileri
  const hourlyProduction = [];
  
  for (let hour = 0; hour < 24; hour++) {
    // Her inverter için ayrı üretim değerleri
    const inverterValues = Array(8).fill(0).map(() => {
      let predictionValue = 0;
      
      // Gün içinde üretimin değişimini simüle et
      if (hour < 6) {
        predictionValue = Math.random() * 10; // Sabah erken saatlerde düşük üretim
      } else if (hour >= 6 && hour < 10) {
        predictionValue = 20 + (hour - 6) * 10 + Math.random() * 5; // Sabah artan üretim
      } else if (hour >= 10 && hour < 16) {
        predictionValue = 60 + Math.random() * 20; // Öğlen en yüksek üretim
      } else if (hour >= 16 && hour < 20) {
        predictionValue = 40 - (hour - 16) * 10 + Math.random() * 5; // Akşam düşen üretim
      } else {
        predictionValue = Math.random() * 8; // Gece düşük üretim
      }
      
      return {
        prediction: Math.round(predictionValue * 10) / 10,
        radiation: Math.round((predictionValue * 8 + Math.random() * 100) * 10) / 10 // Radyasyon değeri
      };
    });
    
    hourlyProduction.push({
      hour,
      inverters: inverterValues,
      totalPrediction: inverterValues.reduce((sum, inv) => sum + inv.prediction, 0),
      totalRadiation: inverterValues.reduce((sum, inv) => sum + inv.radiation, 0)
    });
  }
  
  return {
    date: new Date().toISOString().split('T')[0],
    hourlyProduction,
    dailyTotal: hourlyProduction.reduce((sum, hour) => sum + hour.totalPrediction, 0).toFixed(1),
    efficiency: (Math.random() * 15 + 75).toFixed(1) // %75-90 verimlilik
  };
};

// Sabit haftalık veriler - rastgele değil
const WEEKLY_STATIC_DATA = {
  labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
  predictionData: [650, 590, 800, 810, 760, 550, 700],
  actualData: [700, 610, 780, 790, 750, 590, 680],
};

const ProductionCharts = () => {
  const dispatch = useDispatch();
  const { predictionData, isLoadingRealTime, inverterData } = useSelector(state => state.solarData);
  
  const [activeTab, setActiveTab] = useState('hourly');
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [selectedInverter, setSelectedInverter] = useState('total'); // 'total' veya 0-7 arası
  const [loadingInverters, setLoadingInverters] = useState({});
  
  // Statik veri - useMemo kullanarak yalnızca bir kez oluştur
  const staticData = useMemo(() => generateStaticData(), []);
  
  // API'den gelen veri yoksa statik veriyi kullan
  const safeData = predictionData || staticData;

  // Component mount olduğunda gerçek API verilerini getir
  useEffect(() => {
    dispatch(fetchRealTimePredictions());
  }, [dispatch]);
  
  useEffect(() => {
    // Veri işleme işlemleri
    const hourlyProduction = safeData.hourlyProduction || safeData.hourlyData || [];
    
    const hourlyLabels = hourlyProduction.map(item => `${item.hour}:00`);
    
    // Her inverter için ayrı veri setleri
    const inverterData = Array(8).fill().map((_, invIndex) => ({
      predictionValues: hourlyProduction.map(item => item.inverters[invIndex].prediction),
      radiationValues: hourlyProduction.map(item => item.inverters[invIndex].radiation || 0)
    }));
    
    // Toplam üretim verileri
    const totalData = {
      predictionValues: hourlyProduction.map(item => item.totalPrediction),
      radiationValues: hourlyProduction.map(item => item.totalRadiation || 0)
    };
    
    setChartData({
      hourlyLabels,
      inverterData,
      totalData,
      weeklyLabels: WEEKLY_STATIC_DATA.labels,
      weeklyPredictionData: WEEKLY_STATIC_DATA.predictionData,
      weeklyActualData: WEEKLY_STATIC_DATA.actualData,
      weeklyDiffData: WEEKLY_STATIC_DATA.actualData.map((actual, idx) => 
        actual - WEEKLY_STATIC_DATA.predictionData[idx]
      )
    });
  }, [safeData]);
  
  if (isLoadingRealTime || !chartData) {
    return (
      <Card className="h-100 shadow-sm">
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '350px' }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  // Grafik verilerini hazırla
  const prepareChartData = (data, isTotal = false) => {
    const selectedData = isTotal ? chartData.totalData : chartData.inverterData[selectedInverter];
    
    return {
      labels: chartData.hourlyLabels,
      datasets: [
        {
          label: 'Tahmin Edilen Üretim',
          data: selectedData.predictionValues,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y',
          pointRadius: 3
        },
        {
          label: 'Direkt Radyasyon',
          data: selectedData.radiationValues,
          borderColor: 'rgb(255, 193, 7)',
          backgroundColor: 'rgba(255, 193, 7, 0.5)',
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y1',
          pointRadius: 3
        }
      ]
    };
  };

  // Çubuk grafik verilerini hazırla
  const prepareBarData = (data, isTotal = false) => {
    const selectedData = isTotal ? chartData.totalData : chartData.inverterData[selectedInverter];
    
    return {
      labels: chartData.hourlyLabels,
      datasets: [
        {
          label: 'Tahmin Edilen',
          data: selectedData.predictionValues,
          backgroundColor: 'rgba(53, 162, 235, 0.7)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1
        },
        {
          label: 'Direkt Radyasyon',
          data: selectedData.radiationValues,
          backgroundColor: 'rgba(255, 193, 7, 0.7)',
          borderColor: 'rgb(255, 193, 7)',
          borderWidth: 1
        }
      ]
    };
  };

  // Grafik seçenekleri
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: selectedInverter === 'total' ? 
          'Toplam Üretim Grafiği' : 
          `INV/${parseInt(selectedInverter) + 1} Üretim Grafiği`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1);
              if (context.dataset.label === 'Direkt Radyasyon') {
                label += ' W/m²';
              } else {
                label += ' kWh';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Üretim (kWh)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Radyasyon (W/m²)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Saat'
        }
      }
    }
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Üretim Grafikleri</h5>
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={() => dispatch(fetchRealTimePredictions())}
              disabled={isLoadingRealTime}
            >
              {isLoadingRealTime ? (
                <><Spinner as="span" animation="border" size="sm" className="me-2" />Yenileniyor...</>
              ) : (
                <>🔄 Yenile</>
              )}
            </Button>
            <Form.Check 
              type="switch"
              id="chart-type-switch"
              label={chartType === 'line' ? 'Çizgi Grafik' : 'Sütun Grafik'}
              checked={chartType === 'bar'}
              onChange={(e) => setChartType(e.target.checked ? 'bar' : 'line')}
              className="text-white"
            />
            <Nav variant="pills" className="bg-primary" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="hourly" className={activeTab === 'hourly' ? 'bg-white text-primary' : 'text-white'}>Saatlik</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="daily" className={activeTab === 'daily' ? 'bg-white text-primary' : 'text-white'}>Haftalık</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <ButtonGroup className="w-100">
            <Button 
              variant={selectedInverter === 'total' ? 'primary' : 'outline-primary'}
              onClick={() => setSelectedInverter('total')}
            >
              Toplam Üretim
            </Button>
            {Array(8).fill().map((_, index) => (
              <Button 
                key={index}
                variant={selectedInverter === index ? 'primary' : 'outline-primary'}
                onClick={() => setSelectedInverter(index)}
              >
                INV/{index + 1}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        <Tab.Content>
          <Tab.Pane active={activeTab === 'hourly'}>
            <div style={{ height: '500px' }}>
              {chartType === 'line' ? (
                <Line 
                  data={prepareChartData(chartData, selectedInverter === 'total')} 
                  options={chartOptions} 
                />
              ) : (
                <Bar 
                  data={prepareBarData(chartData, selectedInverter === 'total')} 
                  options={chartOptions} 
                />
              )}
            </div>
          </Tab.Pane>
          <Tab.Pane active={activeTab === 'daily'}>
            <div style={{ height: '500px' }}>
              {/* Haftalık veriler için grafik */}
              {chartType === 'line' ? (
                <Line 
                  data={prepareChartData(chartData, selectedInverter === 'total')} 
                  options={chartOptions} 
                />
              ) : (
                <Bar 
                  data={prepareBarData(chartData, selectedInverter === 'total')} 
                  options={chartOptions} 
                />
              )}
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Card.Body>
      <Card.Footer className="bg-white border-0">
        <small className="text-muted">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</small>
      </Card.Footer>
    </Card>
  );
};

export default ProductionCharts; 