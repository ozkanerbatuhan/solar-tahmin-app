const API_BASE_URL = 'http://217.18.210.229:8000';

// Sunucu durumu kontrolü
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Sunucu yanıt vermiyor');
    }
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

// Inverter tahminleri getirme
export const fetchInverterPredictions = async (inverterId, startTime, endTime, intervalMinutes = 60) => {
  try {
    const url = `${API_BASE_URL}/api/models/predict-bulk?inverter_ids=${inverterId}&start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}&interval_minutes=${intervalMinutes}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      },
      body: ''
    });

    if (!response.ok) {
      throw new Error(`Inverter ${inverterId} verileri alınamadı`);
    }

    const data = await response.json();
    return data[inverterId] || [];
  } catch (error) {
    console.error(`Inverter ${inverterId} prediction error:`, error);
    throw error;
  }
};

// Inverter metriklerini getirme
export const fetchInverterMetrics = async (inverterId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models/metrics/${inverterId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Inverter ${inverterId} metrikleri alınamadı`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Inverter ${inverterId} metrics error:`, error);
    throw error;
  }
};

// Tüm inverterlar için tahminleri sırayla getir
export const fetchAllInverterPredictions = async (startTime, endTime, intervalMinutes = 60, onProgress = null) => {
  const allPredictions = {};
  
  for (let inverterId = 1; inverterId <= 8; inverterId++) {
    try {
      const predictions = await fetchInverterPredictions(inverterId, startTime, endTime, intervalMinutes);
      allPredictions[inverterId] = predictions;
      
      if (onProgress) {
        onProgress(inverterId, predictions);
      }
      
      // Bir sonraki istek için kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Inverter ${inverterId} error:`, error);
      allPredictions[inverterId] = [];
    }
  }
  
  return allPredictions;
};

// Tüm inverterlar için metrikleri getir
export const fetchAllInverterMetrics = async () => {
  const allMetrics = {};
  
  for (let inverterId = 1; inverterId <= 8; inverterId++) {
    try {
      const metrics = await fetchInverterMetrics(inverterId);
      allMetrics[inverterId] = metrics;
      
      // Bir sonraki istek için kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Inverter ${inverterId} metrics error:`, error);
      allMetrics[inverterId] = null;
    }
  }
  
  return allMetrics;
};

// API verilerini chart formatına dönüştür
export const transformAPIDataToChartFormat = (allPredictions) => {
  const hourlyProduction = [];
  
  // Her saat için veri oluştur (24 saat)
  for (let hour = 0; hour < 24; hour++) {
    const inverters = Array(8).fill(0).map((_, invIndex) => {
      const inverterId = invIndex + 1;
      const predictions = allPredictions[inverterId] || [];
      
      // Bu saate karşılık gelen veriyi bul
      const hourlyData = predictions.find(p => {
        const predTime = new Date(p.prediction_timestamp);
        return predTime.getHours() === hour;
      });
      
      return {
        prediction: hourlyData?.predicted_power || 0,
        radiation: hourlyData?.features?.direct_radiation || 0
      };
    });
    
    hourlyProduction.push({
      hour,
      inverters,
      totalPrediction: inverters.reduce((sum, inv) => sum + inv.prediction, 0),
      totalRadiation: inverters.reduce((sum, inv) => sum + inv.radiation, 0)
    });
  }
  
  return {
    date: new Date().toISOString().split('T')[0],
    hourlyProduction,
    dailyTotal: hourlyProduction.reduce((sum, hour) => sum + hour.totalPrediction, 0).toFixed(1),
    efficiency: (Math.random() * 15 + 75).toFixed(1) // Geçici
  };
};

// Tarih formatını API'ye uygun hale getir
export const formatDateForAPI = (date) => {
  return date.toISOString();
};

// Dosya yükleme fonksiyonu
export const uploadTextFile = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('validate_only', options.validate_only || 'false');
    formData.append('fetch_weather', options.fetch_weather || 'true');
    formData.append('forced', options.forced || 'false');
    formData.append('train_models', options.train_models || 'true');
    formData.append('fetch_future_weather', options.fetch_future_weather || 'true');

    const response = await fetch(`${API_BASE_URL}/api/data/upload-txt`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Dosya yüklenirken hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Job durumunu kontrol etme
export const fetchJobStatus = async (includeHistory = false, limit = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/data/jobs?include_history=${includeHistory}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Job durumu alınamadı');
    }

    return await response.json();
  } catch (error) {
    console.error('Job status error:', error);
    throw error;
  }
}; 